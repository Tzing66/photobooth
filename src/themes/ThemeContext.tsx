import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ThemeId, ThemeKit } from "./types";
import { THEMES } from "./registry";

const KEY = "photobooth_theme";
const ORDER = Object.keys(THEMES) as ThemeId[];

interface ThemeState {
  kit: ThemeKit;
  cycle: () => void;
}

const Ctx = createContext<ThemeState | null>(null);

function initialTheme(): ThemeId {
  try {
    const v = localStorage.getItem(KEY);
    if (v && v in THEMES) return v as ThemeId;
  } catch {
    /* storage blocked */
  }
  return "retro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<ThemeId>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* storage blocked */
    }
  }, [id]);

  const cycle = useCallback(() => setId((cur) => ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]), []);
  const value = useMemo(() => ({ kit: THEMES[id], cycle }), [id, cycle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme outside ThemeProvider");
  return v;
}
