import type { ThemeId, ThemeKit } from "./types";
import { retro } from "./retro";
import { sketch } from "./sketch";
import { darkroom } from "./darkroom";
import { arcade } from "./arcade";
import { photoboy } from "./photoboy";
import { kitty } from "./kitty";

/** Cycle order for the theme switcher. */
export const THEMES: Record<ThemeId, ThemeKit> = { retro, sketch, darkroom, arcade, photoboy, kitty };
