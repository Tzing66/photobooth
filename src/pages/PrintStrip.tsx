import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { showError } from "../lib/errors";
import { getFrame, isAuthentic, isColorMode, needsShadow } from "../lib/frames";
import { createPhotostrip } from "../lib/pipeline/strip";
import { StorageFullError, addToGallery, getAllPhotos, getPhotostrip, isComplete, savePhotostrip, saveIndividualPhotos } from "../lib/storage";
import { useTheme } from "../themes/ThemeContext";

const COUNTDOWN = 5;

function failureMessage(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  const base = "Failed to create your photostrip. ";
  if (msg.includes("Invalid images")) return base + "Some of your photos are missing or corrupted. Please go back and retake or re-upload them.";
  if (msg.includes("load")) return base + "One or more of your photos couldn't be processed. Please go back and retake or re-upload them.";
  if (err instanceof StorageFullError) return base + "Your device's storage is full, so the strip couldn't be saved. Free up some space and try again.";
  return base + `Please try refreshing the page. Technical details: ${msg}`;
}

/**
 * "Photos delivered here in 5 seconds": the strip is developed in the
 * background during the countdown, then slides out of the pickup slot.
 */
export default function PrintStrip() {
  const navigate = useNavigate();
  const { kit } = useTheme();
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const [strip, setStrip] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [canPickUp, setCanPickUp] = useState(false);
  const started = useRef(false);

  // Load the session; develop the strip if this session hasn't got one yet.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const photos = await getAllPhotos();
        if (!isComplete(photos)) {
          showError(navigate, "Photos Not Found", "Your photo session data was not found. Please take new photos or upload images to continue.");
          return;
        }
        const existing = await getPhotostrip();
        if (existing) {
          setStrip(existing);
          return;
        }
        const frame = getFrame();
        const result = await createPhotostrip(photos as string[], { frame, color: isColorMode(), authentic: isAuthentic() });
        await savePhotostrip(result.strip);
        await saveIndividualPhotos(result.singles);
        addToGallery(result.strip, frame).catch((e) => console.warn("Couldn't add strip to gallery", e));
        setStrip(result.strip);
      } catch (e) {
        console.error("Photostrip creation failed", e);
        showError(navigate, "Photostrip Creation Failed", failureMessage(e));
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    if (seconds > 0 || !strip) return;
    const a = setTimeout(() => setRevealed(true), 300);
    const b = setTimeout(() => setCanPickUp(true), 2000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [seconds, strip]);

  const shadow = needsShadow(getFrame()) ? "shadow-lg shadow-black/40" : "";

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center px-4 pt-3 pb-14 sm:pb-3">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
        <div className="aspect-square shrink-0" style={{ width: "clamp(120px, 20dvh, 200px)" }}>
          <kit.PrintTimer seconds={seconds} />
        </div>
        <div className="shrink-0" style={{ height: "min(50dvh, 26rem)", aspectRatio: "3 / 11" }}>
          <kit.PickupSlot>
            {seconds === 0 && !strip ? (
              <div className="grid h-full place-items-center">
                <Spinner />
              </div>
            ) : (
              strip && (
                <div className={`flex h-full w-full items-start justify-center pt-1 transition-transform duration-500 ${canPickUp ? "-rotate-3" : ""}`}>
                  <img
                    src={strip}
                    alt="Your photostrip"
                    className={`max-h-full max-w-full object-contain transition-all duration-1000 ease-out ${shadow} ${revealed ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
                  />
                </div>
              )
            )}
          </kit.PickupSlot>
        </div>
      </div>
      <button className={`btn mb-2 w-full max-w-xs transition-opacity duration-500 ${canPickUp ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => navigate("/pickup")}>
        pick up
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
