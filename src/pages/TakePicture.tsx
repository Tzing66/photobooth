import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoothInterior from "../components/BoothInterior";
import { FlashIcon, FlipIcon } from "../components/CameraIcons";
import LookHere from "../components/LookHere";
import { canTorch, getFacing, hasSeveralCameras, isFlashOn, isMirrored, openCamera, setFacing, setFlashOn, setTorch, type Facing } from "../lib/camera";
import { showError } from "../lib/errors";
import { clearAllPhotos, clearPhotostrip, isComplete, savePhoto, type Photos } from "../lib/storage";

const SHOTS = 4;
const COUNTDOWN_FROM = 3;
const FLASH_MS = 300;
/** Front camera "flash": the whole screen goes white, held long enough for the exposure to catch it. */
const SCREEN_FLASH_MS = 450;
const BETWEEN_SHOTS_MS = 2000;

function cameraErrorMessage(err: unknown) {
  let msg = "Unable to access camera. ";
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return msg + "Camera access was denied. Please allow camera access and try again.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return msg + "No camera found on this device.";
      case "NotReadableError":
      case "TrackStartError":
        return msg + "Camera is already in use by another application.";
      case "OverconstrainedError":
      case "ConstraintNotSatisfiedError":
        return msg + "Camera doesn't meet the required specifications.";
      default:
        return msg + "An unknown error occurred.";
    }
  }
  if (!navigator.mediaDevices?.getUserMedia) msg += "This page needs HTTPS (or localhost) for camera access. ";
  return msg + "Please check your camera permissions and try again.";
}

export default function TakePicture() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [photos, setPhotos] = useState<Photos>([null, null, null, null]);
  const [ready, setReady] = useState(false);
  const [shooting, setShooting] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [facing, setFacingState] = useState<Facing>(getFacing);
  const [cam, setCam] = useState({ mirrored: true, torch: false, several: false });
  const [flashOn, setFlashOnState] = useState(isFlashOn);
  const [screenFlash, setScreenFlash] = useState(false);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  // Camera on mount (and on flip), off on unmount.
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    setReady(false);
    (async () => {
      try {
        stream = await openCamera(facing);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        streamRef.current = stream;
        video.srcObject = stream;
        setCam({ mirrored: isMirrored(stream), torch: canTorch(stream), several: await hasSeveralCameras() });
        const markReady = () => setReady(true);
        video.onloadedmetadata = () => {
          video.play().then(markReady, (e) => {
            console.warn("video.play() failed", e);
            markReady();
          });
        };
        later(markReady, 2000); // some browsers never fire loadedmetadata reliably
      } catch (e) {
        console.error("Camera error", e);
        if (!cancelled) showError(navigate, "Camera Access Error", cameraErrorMessage(e));
      }
    })();
    const pending = timers.current;
    return () => {
      cancelled = true;
      if (streamRef.current === stream) streamRef.current = null;
      stream?.getTracks().forEach((t) => t.stop());
      pending.forEach(clearTimeout);
    };
  }, [navigate, later, facing]);

  const flip = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    setFacingState(next);
  };
  const toggleFlash = () => {
    setFlashOn(!flashOn);
    setFlashOnState(!flashOn);
  };
  // Back camera: the torch. Front camera: the screen itself.
  const useTorch = flashOn && cam.torch;
  const useScreen = flashOn && !cam.torch && cam.mirrored;

  useEffect(() => {
    if (isComplete(photos)) navigate("/printStrip");
  }, [photos, navigate]);

  const capture = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!video || !canvas || !ctx || !video.videoWidth) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  const snap = (i: number) => {
    setFlash(true);
    if (useScreen) setScreenFlash(true);
    later(async () => {
      try {
        const shot = capture();
        setFlash(false);
        setScreenFlash(false);
        if (useTorch) setTorch(streamRef.current, false);
        if (!shot) throw new Error("Empty capture");
        await savePhoto(i, shot);
        setPhotos((p) => p.map((v, k) => (k === i ? shot : v)));
        if (i < SHOTS - 1) later(() => countdown(i + 1), BETWEEN_SHOTS_MS);
        else {
          setShooting(false);
          setCount(null);
        }
      } catch (e) {
        console.error("Failed to save photo", e);
        showError(
          navigate,
          "Photo Save Error",
          "Failed to save your photo. This might be due to storage or memory issues. Please try again, and if the problem persists, try refreshing the page.",
        );
      }
    }, useScreen ? SCREEN_FLASH_MS : FLASH_MS);
  };

  const countdown = (i: number) => {
    const tick = (n: number) => {
      if (n === 0) {
        setCount(null);
        snap(i);
        return;
      }
      setCount(n);
      // Torch on a second early so auto-exposure settles on the lit face.
      if (n === 1 && useTorch) setTorch(streamRef.current, true);
      later(() => tick(n - 1), 1000);
    };
    tick(COUNTDOWN_FROM);
  };

  const start = async () => {
    if (shooting) return;
    if (!ready) {
      showError(navigate, "Camera Not Ready", "The camera is still initializing. Please wait a moment and try again, or refresh the page if the issue persists.");
      return;
    }
    try {
      await clearPhotostrip();
      await clearAllPhotos();
      setShooting(true);
      setPhotos([null, null, null, null]);
      countdown(0);
    } catch (e) {
      console.error("Failed to start session", e);
      showError(navigate, "Session Start Error", "Failed to start a new photo session. Please try refreshing the page and ensure your camera is working properly.");
    }
  };

  const canStart = ready && !shooting && !isComplete(photos);
  const taken = photos.filter(Boolean).length;

  return (
    <BoothInterior actionLabel={canStart ? "start" : null} actionReady={canStart} onAction={canStart ? start : undefined} locked={shooting}>
      <LookHere show={shooting} />
      <div className="relative h-full w-full bg-black">
        {!ready && <div className="absolute inset-0 z-10 grid place-items-center bg-[#ece8e1] text-center text-sm text-[#2a2a2a]">Initializing camera...</div>}
        <video ref={videoRef} autoPlay playsInline muted disablePictureInPicture className={`h-full w-full object-cover ${cam.mirrored ? "-scale-x-100" : ""}`} />
        {ready && !shooting && (
          <div className="absolute top-2 left-2 z-10 flex gap-2">
            {cam.several && (
              <button onClick={flip} className="cam-btn" aria-label={facing === "user" ? "Switch to back camera" : "Switch to front camera"}>
                <FlipIcon />
              </button>
            )}
            {(cam.torch || cam.mirrored) && (
              <button onClick={toggleFlash} className="cam-btn" aria-pressed={flashOn} aria-label={flashOn ? "Flash on" : "Flash off"}>
                <FlashIcon on={flashOn} />
              </button>
            )}
          </div>
        )}
        {count !== null && (
          <div className="absolute inset-0 grid place-items-center">
            <span key={count} className="font-display animate-[countpop_1s_ease-out_forwards] text-7xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {count}
            </span>
          </div>
        )}
        {shooting && (
          <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
            {Math.min(taken + 1, SHOTS)} / {SHOTS}
          </div>
        )}
        {flash && <div className="absolute inset-0 z-20 animate-[flash_0.3s_ease-in-out] bg-white" />}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {screenFlash && <div className="fixed inset-0 z-[100] bg-white" aria-hidden />}
    </BoothInterior>
  );
}
