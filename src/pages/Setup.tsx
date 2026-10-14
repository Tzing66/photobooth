import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import {
  BACKDROPS,
  FRAMES,
  type BackdropType,
  type FrameType,
  getBackdrop,
  getFrame,
  isAuthentic,
  isColorMode,
  needsShadow,
  setAuthentic,
  setBackdrop,
  setColorMode,
  setFrame,
} from "../lib/frames";
import { placeholderPortraits } from "../lib/pipeline/samples";
import { preloadSegmenter } from "../lib/pipeline/segment";
import { createPhotostrip, type StripResult } from "../lib/pipeline/strip";
import { clearAllPhotos } from "../lib/storage";
import { useTheme } from "../themes/ThemeContext";

interface Settings {
  frame: FrameType;
  color: boolean;
  authentic: boolean;
  backdrop: BackdropType;
}

/** Grab one frame from the front camera, then release it. */
async function snapshot(): Promise<string> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 720 }, height: { ideal: 960 }, facingMode: "user" } });
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    await new Promise((r) => setTimeout(r, 700)); // let auto-exposure settle
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    c.getContext("2d")!.drawImage(video, 0, 0);
    return c.toDataURL("image/jpeg", 0.9);
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

/** The top of the strip down to the middle of the first gap: one photo plus its frame. */
function zoomOnFirst(result: StripResult): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const [a, b] = result.layout.cells;
      const h = Math.round((a.y + a.h + b.y) / 2);
      const c = document.createElement("canvas");
      c.width = result.layout.width;
      c.height = h;
      c.getContext("2d")!.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = result.strip;
  });
}

const FrameSwatch = ({ paper }: { paper: string }) => (
  <span className="flex h-7 w-4 shrink-0 flex-col gap-[2px] rounded-[2px] p-[2px] shadow-sm" style={{ background: paper }}>
    {[0, 1, 2].map((i) => (
      <span key={i} className="flex-1 bg-[#9a948c]" />
    ))}
  </span>
);

function GoButtons({ onCamera, onUpload }: { onCamera: () => void; onUpload: () => void }) {
  return (
    <>
      <button className="btn flex-1 py-3! whitespace-nowrap" onClick={onCamera}>
        take photos
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>
      <button className="btn flex-1 py-3! whitespace-nowrap" onClick={onUpload}>
        upload
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>
    </>
  );
}

/**
 * Choose frame, backdrop, tone and look against a big live preview of your own
 * face (one quiet camera snapshot), then go shoot or upload.
 */
export default function Setup() {
  const navigate = useNavigate();
  const { kit } = useTheme();
  const [s, setS] = useState<Settings>(() => ({ frame: getFrame(), color: isColorMode(), authentic: isAuthentic(), backdrop: getBackdrop() }));
  const [subject, setSubject] = useState<string[] | null>(null);
  const [usingFace, setUsingFace] = useState(false);
  const [preview, setPreview] = useState<{ strip: string; zoom: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const renderId = useRef(0);

  const takeSnapshot = useCallback(async () => {
    try {
      setNote("Taking a preview snapshot…");
      const shot = await snapshot();
      setSubject([shot, shot, shot, shot]);
      setUsingFace(true);
      setNote(null);
    } catch (e) {
      console.warn("Preview snapshot unavailable", e);
      setSubject(placeholderPortraits());
      setUsingFace(false);
      setNote("Camera unavailable, previewing with sample portraits.");
    }
  }, []);

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // StrictMode double-mount: one camera prompt only
    started.current = true;
    takeSnapshot();
  }, [takeSnapshot]);

  // Re-render the preview whenever a setting or the subject changes; only the latest render wins.
  useEffect(() => {
    if (!subject) return;
    const id = ++renderId.current;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        if (s.backdrop !== "none") setNote((n) => n ?? "Loading the cut-out model (first time only)…");
        const result = await createPhotostrip(subject, { frame: s.frame, color: s.color, authentic: s.authentic, backdrop: s.backdrop, stripOnly: true });
        const zoom = await zoomOnFirst(result);
        if (id !== renderId.current) return;
        setPreview({ strip: result.strip, zoom });
        setNote((n) => (n?.startsWith("Loading the cut-out") ? null : n));
      } catch (e) {
        console.error("Preview render failed", e);
        if (id === renderId.current) setNote(s.backdrop !== "none" ? "Couldn't load the backdrop cut-out on this device." : "Preview failed to render.");
      } finally {
        if (id === renderId.current) setBusy(false);
      }
    }, 120);
    return () => clearTimeout(t);
  }, [subject, s]);

  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next);
    setFrame(next.frame);
    setColorMode(next.color);
    setAuthentic(next.authentic);
    setBackdrop(next.backdrop);
    if (patch.backdrop && patch.backdrop !== "none") preloadSegmenter().catch(() => null);
  };

  const go = (path: string) => async () => {
    try {
      await clearAllPhotos();
    } catch (e) {
      console.error("Failed to clear photos", e);
    }
    navigate(path);
  };

  const shadow = needsShadow(s.frame) ? "shadow-lg shadow-black/35" : "";
  const previewH = "min(50dvh, 34rem)";

  return (
    <div className="flex min-h-dvh w-full flex-col items-center px-4 pt-4 pb-32 md:pb-10">
      <div className="h-[clamp(52px,10dvh,104px)] w-full max-w-xl shrink-0">
        <kit.Lightbox />
      </div>

      <div className="mt-4 grid w-full max-w-5xl grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
        {/* preview */}
        <section aria-label="Preview" className="flex min-w-0 flex-col items-center gap-2 md:sticky md:top-4">
          <div className="relative flex items-start justify-center gap-4 sm:gap-6">
            {preview ? (
              <>
                <img src={preview.zoom} alt="Close-up of one photo" className={`h-auto w-auto rotate-[-1.5deg] ${shadow}`} style={{ maxHeight: previewH, maxWidth: "min(58vw, 26rem)" }} />
                <img src={preview.strip} alt="Full strip" className={`w-auto rotate-[1.5deg] ${shadow}`} style={{ height: previewH }} />
              </>
            ) : (
              <div className="grid place-items-center" style={{ height: previewH, width: "min(80vw, 30rem)" }}>
                <Spinner />
              </div>
            )}
            {busy && preview && (
              <div className="absolute inset-0 grid place-items-center">
                <Spinner className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{usingFace ? "Previewing with your face" : "Previewing with sample portraits"}</span>
            <button onClick={takeSnapshot} className="link">
              {usingFace ? "retake preview" : "use my camera"}
            </button>
          </div>
          {note && <p className="text-center text-xs text-muted">{note}</p>}
        </section>

        {/* options */}
        <section className="card flex min-w-0 flex-col gap-5 p-4 md:p-5" aria-label="Options">
          <div>
            <h2 className="font-display mb-2 text-sm md:text-base">Frame</h2>
            <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
              {FRAMES.map((f) => (
                <button key={f.type} className="chip" aria-pressed={s.frame === f.type} onClick={() => update({ frame: f.type })}>
                  <FrameSwatch paper={f.background} />
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display mb-2 text-sm md:text-base">Backdrop</h2>
            <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
              {BACKDROPS.map((b) => (
                <button key={b.type} className="chip" aria-pressed={s.backdrop === b.type} onClick={() => update({ backdrop: b.type })}>
                  <span className="chip-swatch" style={{ background: b.swatch }} />
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <kit.Toggle on={s.color} onToggle={() => update({ color: !s.color })} left="b&w" right="color" label="Toggle colour mode" />
            <kit.Toggle on={s.authentic} onToggle={() => update({ authentic: !s.authentic })} left="normal" right="authentic" label="Toggle authentic booth look" />
          </div>

          <div className="bg-paper sticky bottom-0 -mx-5 -mb-5 hidden gap-3 rounded-b-[inherit] px-5 pt-3 pb-5 md:flex">
            <GoButtons onCamera={go("/takePicture")} onUpload={go("/upload")} />
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex md:hidden justify-center gap-3 px-4 pt-6 pb-4 pr-16 sm:pr-4" style={{ background: "linear-gradient(transparent, var(--t-page) 45%)" }}>
        <GoButtons onCamera={go("/takePicture")} onUpload={go("/upload")} />
      </div>
    </div>
  );
}
