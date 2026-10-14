import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import BoothInterior from "../components/BoothInterior";
import CropModal from "../components/CropModal";
import { showError } from "../lib/errors";
import { StorageFullError, clearPhotostrip, getAllPhotos, isComplete, savePhoto, type Photos } from "../lib/storage";

const MAX_BYTES = 25 * 1024 * 1024;

export default function Upload() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photos>([null, null, null, null]);
  const [slot, setSlot] = useState<number | null>(null);
  const [cropping, setCropping] = useState<string | null>(null);

  useEffect(() => {
    getAllPhotos().then(setPhotos, (e) => console.error("Failed to load existing photos", e));
  }, []);

  useEffect(() => () => {
    if (cropping) URL.revokeObjectURL(cropping);
  }, [cropping]);

  const pick = (i: number) => {
    setSlot(i);
    fileRef.current?.click();
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || slot === null) return;
    if (file.size > MAX_BYTES) {
      showError(
        navigate,
        "File Too Large",
        "Image file is too large. Please select an image smaller than 25MB.\n\nTip: Most phone photos are under 10MB. If your image is larger, try reducing the resolution.",
      );
      return;
    }
    setCropping(URL.createObjectURL(file));
  };

  const onCropped = async (dataUrl: string) => {
    if (slot === null) return;
    try {
      await savePhoto(slot, dataUrl);
      setPhotos((p) => p.map((v, k) => (k === slot ? dataUrl : v)));
      setCropping(null);
      setSlot(null);
    } catch (e) {
      console.error("Failed to save cropped image", e);
      if (e instanceof StorageFullError) {
        showError(navigate, "Storage Full", "Your device's storage is full. Please free up some space or try using smaller images.");
      } else {
        showError(navigate, "Save Error", "Failed to save cropped image. Please try again.");
      }
    }
  };

  const print = async () => {
    try {
      await clearPhotostrip();
    } catch (e) {
      console.error("Failed to clear photostrip", e);
    }
    navigate("/printStrip");
  };

  const complete = isComplete(photos);

  return (
    <BoothInterior actionLabel={complete ? "print" : null} actionReady={complete} onAction={complete ? print : undefined}>
      <div className="flex h-full w-full flex-col justify-center bg-[#ece8e1] p-2 text-[#2a2a2a] sm:p-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {photos.map((p, i) =>
            p ? (
              <button key={i} onClick={() => pick(i)} className="group relative aspect-[3/4] overflow-hidden rounded-md border-2 border-[#2a2a2a]">
                <img src={p} alt={`Picture ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Replace
                </span>
              </button>
            ) : (
              <button
                key={i}
                onClick={() => pick(i)}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#8a857d] transition-colors hover:bg-black/5"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">Picture {i + 1}</span>
              </button>
            ),
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      </div>
      {cropping && (
        <CropModal
          imageUrl={cropping}
          onComplete={onCropped}
          onCancel={() => {
            setCropping(null);
            setSlot(null);
          }}
          onError={(t, m) => showError(navigate, t, m)}
        />
      )}
    </BoothInterior>
  );
}
