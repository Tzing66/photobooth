import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children, className = "max-w-lg" }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`card relative flex max-h-[95dvh] w-full flex-col overflow-hidden transition-transform duration-300 ${open ? "scale-100" : "scale-95"} ${className}`}>
        <button onClick={onClose} aria-label="Close" className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full opacity-70 hover:opacity-100">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
