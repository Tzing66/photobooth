import { useNavigate } from "react-router-dom";
import BoothInterior from "../components/BoothInterior";
import { clearAllPhotos } from "../lib/storage";

export default function Select() {
  const navigate = useNavigate();

  const go = (path: string) => async () => {
    try {
      await clearAllPhotos();
    } catch (e) {
      console.error("Failed to clear photos", e);
    }
    navigate(path);
  };

  return (
    <BoothInterior>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#ece8e1] p-4">
        <button className="btn w-full max-w-[14rem]" onClick={go("/takePicture")}>
          take photo
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
        <button className="btn w-full max-w-[14rem]" onClick={go("/upload")}>
          upload photo
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </BoothInterior>
  );
}
