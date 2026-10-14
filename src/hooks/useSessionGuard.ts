import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllPhotos, isComplete } from "../lib/storage";

const GUARDED = ["/printStrip", "/pickup"];

/**
 * On the print/pickup screens: warn before a reload wipes the moment, and bounce
 * to the error page if the session's photos are gone (e.g. via history nav).
 */
export function useSessionGuard() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!GUARDED.includes(pathname)) return;

    const check = async (title: string, message: string) => {
      let ok = false;
      try {
        ok = isComplete(await getAllPhotos());
      } catch (e) {
        console.error("Session guard check failed", e);
      }
      if (!ok) navigate("/error", { state: { title, message } });
    };

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const popstate = () => check("Session Expired", "Your photo session has expired or data was lost. Please start a new session.");

    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("popstate", popstate);
    check("Session Not Found", "No active photo session found. Please take photos or upload images first.");
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", popstate);
    };
  }, [pathname, navigate]);
}
