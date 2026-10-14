import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoothInterior from "../components/BoothInterior";
import Spinner from "../components/Spinner";
import { FRAMES, getFrame, isAuthentic, isColorMode, setFrame } from "../lib/frames";
import { frameSample } from "../lib/pipeline/samples";

const tilt = () => (Math.random() - 0.5) * 6;

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function FrameSelection() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(() => Math.max(0, FRAMES.findIndex((f) => f.type === getFrame())));
  const [settings, setSettings] = useState(() => ({ color: isColorMode(), authentic: isAuthentic() }));
  const [angle, setAngle] = useState(tilt);
  const [preview, setPreview] = useState<string | null>(null);
  const frame = FRAMES[index];

  useEffect(() => {
    let live = true;
    setPreview(null);
    frameSample(frame.type, settings.color, settings.authentic).then((url) => live && setPreview(url), console.error);
    return () => {
      live = false;
    };
  }, [frame.type, settings]);

  const step = (d: number) => {
    setIndex((i) => (i + d + FRAMES.length) % FRAMES.length);
    setAngle(tilt());
  };

  const select = () => {
    setFrame(frame.type);
    navigate("/select");
  };

  return (
    <BoothInterior actionLabel="select" actionReady onAction={select} onSettingsChange={setSettings}>
      <div className="flex h-full w-full flex-col items-center gap-1 bg-[#ece8e1] p-2 text-[#2a2a2a]">
        <div className="flex min-h-0 w-full flex-1 items-center gap-1">
          <button onClick={() => step(-1)} aria-label="Previous frame" className="grid h-9 w-9 shrink-0 place-items-center rounded hover:bg-black/10">
            <Chevron dir="left" />
          </button>
          <div className="flex h-full min-w-0 flex-1 items-center justify-center py-1">
            {preview ? (
              <img
                src={preview}
                alt={`${frame.name} preview`}
                className="max-h-full max-w-full object-contain shadow-lg shadow-black/30 transition-transform duration-300"
                style={{ transform: `rotate(${angle}deg)` }}
              />
            ) : (
              <Spinner className="h-10 w-10" />
            )}
          </div>
          <button onClick={() => step(1)} aria-label="Next frame" className="grid h-9 w-9 shrink-0 place-items-center rounded hover:bg-black/10">
            <Chevron dir="right" />
          </button>
        </div>
        <div className="shrink-0 text-center text-xs font-semibold tracking-wide md:text-sm">
          {frame.name} <span className="opacity-50">· {index + 1}/{FRAMES.length}</span>
        </div>
      </div>
    </BoothInterior>
  );
}
