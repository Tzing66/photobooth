import { createPortal } from "react-dom";

/**
 * Real booths put an "eye level" mark beside the lens so people look into it
 * instead of at their own reflection. Phone and laptop cameras sit at the top
 * edge of the screen, so while shooting this pins a glowing marker there,
 * right under the lens. Portalled to <body> so page transforms can't move it.
 */
export default function LookHere({ show }: { show: boolean }) {
  return createPortal(
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center pb-6 transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
      style={{ background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.25) 60%, transparent)" }}
    >
      <div className="h-2.5 w-32 rounded-b-full bg-white" style={{ boxShadow: "0 0 24px 6px var(--t-accent)" }} />
      <div className="anim-nudge-up mt-1 flex flex-col items-center text-white" style={{ filter: "drop-shadow(0 0 6px var(--t-accent))" }}>
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 11l6-6 6 6M6 19l6-6 6 6" />
        </svg>
        {show && (
          <span className="rounded-full border-2 border-white px-3.5 py-1 text-sm font-bold whitespace-nowrap" style={{ background: "var(--t-accent)" }}>
            look at the camera
          </span>
        )}
      </div>
    </div>,
    document.body,
  );
}
