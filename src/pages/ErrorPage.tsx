import { useLocation, useNavigate } from "react-router-dom";
import type { ErrorState } from "../lib/errors";
import { clearSession } from "../lib/storage";

export default function ErrorPage() {
  const navigate = useNavigate();
  const state = useLocation().state as Partial<ErrorState> | null;
  const title = state?.title ?? "Oops! Something went wrong";
  const message = state?.message ?? "Your photo session was interrupted or the data was lost.\nPlease start a new session.";

  const home = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.error("Failed to clear session", e);
    }
    navigate("/");
  };

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-6 p-8">
      <div className="card max-w-lg p-6 text-center md:p-8">
        <h1 className="font-display mb-3 text-2xl md:text-3xl">{title}</h1>
        <p className="text-sm whitespace-pre-line opacity-80 md:text-base">{message}</p>
      </div>
      <button className="btn btn-lg" onClick={home}>
        return to homepage
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </button>
    </div>
  );
}
