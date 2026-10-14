import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/** Simple scrolling text page with a back-to-booth button (FAQ, About, gallery). */
export default function InfoPage({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh w-full px-4 pt-20 pb-16 md:px-8">
      <button onClick={() => navigate("/")} className="btn fixed top-4 left-4 z-30 md:top-8 md:left-8">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="rotate-180">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        back
      </button>
      <div className={`mx-auto ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        <h1 className="font-display mb-8 text-center text-3xl md:text-4xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}
