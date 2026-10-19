import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const MAX_SIDE = 2400; // keep memory sane on phones
const MAX_CANVAS = 8192;

/** Largest centred 3:4 crop that fits the displayed image. */
function initialCrop(w: number, h: number): Crop {
  const cropW = (h * 3) / 4;
  if (cropW > w) {
    const cropH = (w * 4) / 3;
    return { unit: "px", x: 0, y: (h - cropH) / 2, width: w, height: cropH };
  }
  return { unit: "px", x: (w - cropW) / 2, y: 0, width: cropW, height: h };
}

interface Props {
  imageUrl: string;
  onComplete: (dataUrl: string) => void;
  onCancel: () => void;
  onError: (title: string, message: string) => void;
}

export default function CropModal({ imageUrl, onComplete, onCancel, onError }: Props) {
  const [crop, setCrop] = useState<Crop>();
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const valid = !!crop && crop.width >= 10 && crop.height >= 10;

  const doCrop = () => {
    const img = imgRef.current;
    if (!img || !crop || !valid) return;
    setBusy(true);
    try {
      const sx = img.naturalWidth / img.width;
      const sy = img.naturalHeight / img.height;
      let w = crop.width * sx;
      let h = crop.height * sy;
      if (w > MAX_SIDE || h > MAX_SIDE) {
        const k = Math.min(MAX_SIDE / w, MAX_SIDE / h);
        w = Math.floor(w * k);
        h = Math.floor(h * k);
      }
      if (w > MAX_CANVAS || h > MAX_CANVAS) {
        onError("Image Too Large", "Image resolution too high to process. Please use a smaller image.");
        return;
      }
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) {
        onError("Canvas Error", "Failed to get canvas context. Please try again.");
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, crop.x * sx, crop.y * sy, crop.width * sx, crop.height * sy, 0, 0, w, h);
      const url = c.toDataURL("image/jpeg", 0.93);
      if (!url || url === "data:,") throw new Error("Canvas produced empty data URL");
      c.width = c.height = 1; // release memory early (Safari)
      onComplete(url);
    } catch (e) {
      console.error("Crop failed", e);
      onError("Crop Error", e instanceof Error ? e.message : "Failed to crop image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="card flex max-h-[95dvh] w-full max-w-2xl flex-col">
        <h2 className="font-display p-4 pb-2 text-xl md:px-6">Crop Image</h2>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 md:px-6">
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={3 / 4} keepSelection className="max-h-[calc(95dvh-200px)]">
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              className="block max-h-[calc(95dvh-200px)] max-w-full object-contain"
              onLoad={(e) => setCrop(initialCrop(e.currentTarget.width, e.currentTarget.height))}
              onError={() => onError("Image Load Error", "Failed to load image. Please try with a different image.")}
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end gap-2 p-4 md:px-6">
          <button className="btn" onClick={onCancel}>
            cancel
          </button>
          <button className="btn" onClick={doCrop} disabled={!valid || busy} style={!valid || busy ? { opacity: 0.5 } : undefined}>
            {busy ? "cropping..." : "crop"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
