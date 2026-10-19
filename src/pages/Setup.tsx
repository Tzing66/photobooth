import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { FlipIcon } from "../components/CameraIcons";
import { getFacing, hasSeveralCameras, isMirrored, openCamera, setFacing, type Facing } from "../lib/camera";
import {
  BACKDROPS,
  FRAMES,
  type BackdropType,
  type FilmType,
  type FrameType,
  filmDef,
  filmsFor,
  getBackdrop,
  getFilm,
  getFrame,
  isAuthentic,
  isColorMode,
  isFalloff,
  needsShadow,
  setAuthentic,
  setBackdrop,
  setColorMode,
  setFalloff,
  setFilm,
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
  film: FilmType;
  falloff: boolean;
}

/**
 * Opt-in preview snapshot: live mirror with a 3-2-1 countdown, one frame
 * grabbed, camera released straight away.
 */
function LiveSnap({ onShot, onCancel, onError, height }: { onShot: (url: string) => void; onCancel: () => void; onError: () => void; height: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [count, setCount] = useState<number | null>(null);
  const [facing, setFacingState] = useState<Facing>(getFacing);
  const [cam, setCam] = useState({ mirrored: true, several: false });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setCount(null);
    (async () => {
      try {
        stream = await openCamera(facing);
        const video = videoRef.current;
        if (cancelled || !video) return;
        video.srcObject = stream;
        setCam({ mirrored: isMirrored(stream), several: await hasSeveralCameras() });
        await video.play();
        // 3-2-1, then grab the frame (unmirrored, like the real shots).
        [3, 2, 1].forEach((n, i) => timers.push(setTimeout(() => setCount(n), i * 1000)));
        timers.push(
          setTimeout(() => {
            const c = document.createElement("canvas");
            c.width = video.videoWidth;
            c.height = video.videoHeight;
            c.getContext("2d")!.drawImage(video, 0, 0);
            onShot(c.toDataURL("image/jpeg", 0.9));
          }, 3000),
        );
      } catch (e) {
        console.warn("Preview camera unavailable", e);
        if (!cancelled) onError();
      }
    })();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onShot, onError, facing]);

  const flip = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    setFacingState(next);
  };

  return (
    <div className="relative overflow-hidden rounded-md bg-black" style={{ height, aspectRatio: "3 / 4" }}>
      <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${cam.mirrored ? "-scale-x-100" : ""}`} />
      {cam.several && (
        <button onClick={flip} className="cam-btn absolute top-2 left-2" aria-label={facing === "user" ? "Switch to back camera" : "Switch to front camera"}>
          <FlipIcon />
        </button>
      )}
      {count !== null && (
        <span key={count} className="font-display absolute inset-0 grid animate-[countpop_1s_ease-out_forwards] place-items-center text-7xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {count}
        </span>
      )}
      <button onClick={onCancel} className="btn absolute bottom-3 left-1/2 -translate-x-1/2 px-3! py-1! text-xs!">
        cancel
      </button>
    </div>
  );
}

/** Read a picked file, downscaled so previews stay quick. */
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 2000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
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
 * Choose frame, backdrop, tone and look against a big preview, then go shoot
 * or upload. The preview starts on sample portraits; the camera is only used
 * if you ask ("try it on me"), or you can preview on one of your own photos.
 */
export default function Setup() {
  const navigate = useNavigate();
  const { kit } = useTheme();
  const [s, setS] = useState<Settings>(() => ({ frame: getFrame(), color: isColorMode(), authentic: isAuthentic(), backdrop: getBackdrop(), film: getFilm(), falloff: isFalloff() }));
  const [subject, setSubject] = useState<string[]>(placeholderPortraits);
  const [source, setSource] = useState<"samples" | "camera" | "photo">("samples");
  const [snapping, setSnapping] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ strip: string; zoom: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const renderId = useRef(0);

  const onShot = useCallback((url: string) => {
    setSubject([url, url, url, url]);
    setSource("camera");
    setSnapping(false);
    setNote(null);
  }, []);
  const onSnapError = useCallback(() => {
    setSnapping(false);
    setNote("Couldn't open the camera. Check camera permission, or use a photo instead.");
  }, []);
  const onSnapCancel = useCallback(() => setSnapping(false), []);

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await readPhoto(file);
      setSubject([url, url, url, url]);
      setSource("photo");
      setNote(null);
    } catch (err) {
      console.error("Couldn't read photo", err);
      setNote("That image couldn't be opened. Try a JPEG or PNG.");
    }
  };

  const useSamples = () => {
    setSubject(placeholderPortraits());
    setSource("samples");
  };

  // Re-render the preview whenever a setting or the subject changes; only the latest render wins.
  useEffect(() => {
    const id = ++renderId.current;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        if (s.backdrop !== "none" || (s.authentic && s.falloff && source !== "samples")) setNote((n) => n ?? "Loading the cut-out model (first time only)…");
        const result = await createPhotostrip(subject, {
          frame: s.frame,
          color: s.color,
          authentic: s.authentic,
          backdrop: s.backdrop,
          film: s.film,
          // the cut-out model can't find a person in the grey silhouettes
          flash: s.falloff && source !== "samples",
          stripOnly: true,
        });
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
  }, [subject, s, source]);

  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch };
    setS(next);
    setFrame(next.frame);
    setColorMode(next.color);
    setAuthentic(next.authentic);
    setBackdrop(next.backdrop);
    setFilm(next.film);
    setFalloff(next.falloff);
    if ((patch.backdrop && patch.backdrop !== "none") || patch.falloff) preloadSegmenter().catch(() => null);
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
            {snapping ? (
              <LiveSnap onShot={onShot} onCancel={onSnapCancel} onError={onSnapError} height={previewH} />
            ) : preview ? (
              <img src={preview.zoom} alt="Close-up of one photo" className={`h-auto w-auto rotate-[-1.5deg] ${shadow}`} style={{ maxHeight: previewH, maxWidth: "min(58vw, 26rem)" }} />
            ) : (
              <div className="grid place-items-center" style={{ height: previewH, width: "min(58vw, 26rem)" }}>
                <Spinner />
              </div>
            )}
            {preview && <img src={preview.strip} alt="Full strip" className={`w-auto rotate-[1.5deg] ${shadow}`} style={{ height: previewH }} />}
            {busy && preview && !snapping && (
              <div className="absolute inset-0 grid place-items-center">
                <Spinner className="h-10 w-10" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted">
            {{ samples: "Previewing on sample portraits", camera: "Previewing on you", photo: "Previewing on your photo" }[source]}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button className="chip" onClick={() => setSnapping(true)} disabled={snapping}>
              <span className="chip-swatch grid place-items-center text-sm" aria-hidden>
                📷
              </span>
              {source === "camera" ? "retake" : "try it on me"}
            </button>
            <button className="chip" onClick={() => fileRef.current?.click()}>
              <span className="chip-swatch grid place-items-center text-sm" aria-hidden>
                🖼
              </span>
              use a photo
            </button>
            {source !== "samples" && (
              <button className="link text-xs" onClick={useSamples}>
                back to samples
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
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

          {s.authentic && (
            <div>
              <h2 className="font-display mb-2 text-sm md:text-base">Film</h2>
              <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
                {filmsFor(s.color).map((f) => (
                  <button key={f.type} className="chip px-3!" aria-pressed={filmDef(s.film, s.color).type === f.type} onClick={() => update({ film: f.type })}>
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <kit.Toggle on={s.falloff} onToggle={() => update({ falloff: !s.falloff })} left="room light" right="flash look" label="Toggle flash falloff" />
              </div>
              <p className="mt-1 text-xs text-muted">
                Flash darkens the room behind you, like a booth flash a foot from your face.
                {source === "samples" && " Try it on yourself or a photo to see it."}
              </p>
            </div>
          )}

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
