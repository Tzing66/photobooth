import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { showError } from "../lib/errors";
import { frameDef, getFrame, needsShadow } from "../lib/frames";
import { canShareFiles, download, printStrip, storyImage } from "../lib/output";
import { clearSession, getAllPhotos, getIndividualPhotos, getPhotostrip, isComplete } from "../lib/storage";
import { useTheme } from "../themes/ThemeContext";

/** Fallback when the singles weren't saved: slice the strip into quarters. */
function sliceStrip(url: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const h = img.height / 4;
      resolve(
        [0, 1, 2, 3].map((i) => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = h;
          c.getContext("2d")!.drawImage(img, 0, i * h, img.width, h, 0, 0, img.width, h);
          return c.toDataURL("image/png");
        }),
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

const ICONS: Record<string, ReactNode> = {
  download: <path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" />,
  share: <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13" />,
  print: <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z" />,
  restart: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
};

export default function Pickup() {
  const navigate = useNavigate();
  const { kit } = useTheme();
  const [strip, setStrip] = useState("");
  const [singles, setSingles] = useState<string[]>([]);
  const [cut, setCut] = useState(false);
  const [sharePreview, setSharePreview] = useState<string | null>(null);

  const frame = getFrame();
  const shadow = needsShadow(frame) ? "shadow-lg shadow-black/40" : "";
  // Sticker overlays span the whole strip, so it can't be cut cleanly into singles.
  const cuttable = !frameDef(frame).overlay;

  useEffect(() => {
    (async () => {
      try {
        if (!isComplete(await getAllPhotos())) {
          showError(navigate, "Photos Not Found", "Your photo session data was not found. Please take new photos or upload images to continue.");
          return;
        }
        const s = await getPhotostrip();
        if (!s) {
          showError(navigate, "Photostrip Not Found", "Your photostrip was not found. Please go back to the print page to generate your photostrip.");
          return;
        }
        setStrip(s);
      } catch (e) {
        console.error("Failed to load session", e);
        showError(navigate, "Loading Error", "Failed to load your photos and photostrip. Please try refreshing the page or start a new session.");
      }
    })();
  }, [navigate]);

  const showSingles = async () => {
    try {
      const saved = await getIndividualPhotos();
      setSingles(saved.length === 4 ? saved : await sliceStrip(strip));
      setCut(true);
    } catch (e) {
      console.error("Failed to load single photos", e);
    }
  };

  const share = async () => {
    try {
      const { dataUrl, blob } = await storyImage(strip);
      setSharePreview(dataUrl);
      const file = new File([blob], "photostrip.png", { type: "image/png" });
      if (!canShareFiles(file)) {
        setSharePreview(null);
        showError(navigate, "Sharing Not Supported", "Sharing is not supported on your device or browser. Please try using the download button instead.");
        return;
      }
      await navigator.share({ files: [file], title: "My photostrip" });
      setSharePreview(null);
    } catch (e) {
      // AbortError = user closed the share sheet; keep the preview so they can long-press save.
      if ((e as DOMException)?.name !== "AbortError") console.error("Share failed", e);
    }
  };

  const restart = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.error("Failed to clear session", e);
    }
    navigate("/");
  };

  const actions: [keyof typeof ICONS, () => void][] = [
    ["download", () => download(strip, "photostrip.png")],
    ["share", share],
    ["print", () => printStrip(strip)],
    ["restart", restart],
  ];

  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-between px-5 pt-3 pb-14 sm:pb-3">
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center py-4">
        {strip && !cut && (
          <div className="relative">
            <div className="absolute -top-8 left-full ml-2 hidden w-28 sm:block md:-top-10 md:ml-4 md:w-40">
              <kit.Note kind="yourStrip" />
            </div>
            {cuttable && (
              <div className="absolute bottom-0 left-full ml-3 md:ml-8">
                <kit.IconButton kind="cut" onClick={showSingles} />
              </div>
            )}
            <img
              src={strip}
              alt="Your photostrip"
              className={`mx-auto block h-auto w-auto transition-transform duration-300 hover:-rotate-3 ${shadow}`}
              style={{ maxHeight: "calc(100dvh - 12rem)", maxWidth: "min(70vw, 480px)" }}
            />
          </div>
        )}

        {cut && (
          <div className="relative flex flex-col items-center gap-2">
            <div className="absolute -top-6 left-full ml-2 hidden w-28 sm:block md:ml-4 md:w-40">
              <kit.Note kind="tapToSave" />
            </div>
            <div className="absolute bottom-0 left-full ml-3 md:ml-8">
              <kit.IconButton kind="back" onClick={() => setCut(false)} />
            </div>
            {singles.map((s, i) => (
              <button key={i} onClick={() => download(s, `photo-${i + 1}.png`)} aria-label={`Download photo ${i + 1}`}>
                <img
                  src={s}
                  alt={`Photo ${i + 1}`}
                  className={`w-auto transition-transform duration-200 hover:-rotate-3 ${shadow}`}
                  style={{ height: "calc((100dvh - 12rem - 1.5rem) / 4)" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full max-w-xl flex-col items-center">
        <p className="mb-2 text-center text-xs text-muted md:hidden">Press and hold the image to save it straight to your phone!</p>
        <div className="grid w-full grid-cols-2 gap-2 pb-2 sm:grid-cols-4 sm:gap-3">
          {actions.map(([name, fn]) => (
            <button key={name} className="btn" onClick={fn} disabled={!strip}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {ICONS[name]}
              </svg>
              {name}
            </button>
          ))}
        </div>
      </div>

      <Modal open={!!sharePreview} onClose={() => setSharePreview(null)}>
        <div className="p-4 pt-10">{sharePreview && <img src={sharePreview} alt="Share preview" className="mx-auto w-full object-contain" style={{ maxHeight: "70dvh" }} />}</div>
      </Modal>
    </div>
  );
}
