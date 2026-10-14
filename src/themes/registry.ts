import type { ThemeId, ThemeKit } from "./types";
import { retro } from "./retro";
import { sketch } from "./sketch";
import { darkroom } from "./darkroom";
import { y2k } from "./y2k";

/** Cycle order for the theme switcher. */
export const THEMES: Record<ThemeId, ThemeKit> = { retro, sketch, darkroom, y2k };
