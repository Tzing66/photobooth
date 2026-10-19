// Frame catalogue and the small per-session settings kept in localStorage.

export type FrameType =
  | "black"
  | "white"
  | "cutout"
  | "hearts"
  | "stars"
  | "doodle"
  | "negative"
  | "contact"
  | "scrapbook"
  | "ticket"
  | "pressed";

export interface FrameDef {
  type: FrameType;
  name: string;
  /** Strip background; also tints the edge burn on light frames. */
  background: string;
  /** Text printed above every photo. */
  caption?: string;
  /** Drawn over the finished strip (stars, hearts, ...). */
  overlay?: boolean;
  /** Extra margin (in strip units, 1 unit = 2px) for overlays that need room. */
  pad?: { top?: number; bottom?: number; side?: number; gap?: number };
}

export const FRAMES: FrameDef[] = [
  { type: "black", name: "Classic Black", background: "black" },
  { type: "white", name: "Classic White", background: "#d5d1cc" },
  { type: "cutout", name: "Heart Cutouts", background: "#d5d1cc", overlay: true },
  { type: "hearts", name: "Hearts", background: "#d5d1cc", overlay: true },
  { type: "stars", name: "Stars", background: "black", overlay: true },
  { type: "doodle", name: "Doodles", background: "#d5d1cc", overlay: true },
  { type: "negative", name: "Film Negative", background: "#15120f", overlay: true, pad: { side: 30, top: 6, bottom: 6 } },
  { type: "contact", name: "Contact Sheet", background: "#0f0f0f", overlay: true, pad: { gap: 12, bottom: 14, top: 4 } },
  { type: "scrapbook", name: "Scrapbook", background: "#c6a47c", overlay: true, pad: { side: 6, gap: 8, bottom: 24, top: 6 } },
  { type: "ticket", name: "Ticket Stub", background: "#efe3c8", overlay: true, pad: { top: 34, bottom: 36, side: 8 } },
  { type: "pressed", name: "Pressed Flowers", background: "#ebe5d5", overlay: true, pad: { side: 10, gap: 6 } },
];

export type BackdropType = "none" | "white" | "grey" | "black" | "curtain";

export interface BackdropDef {
  type: BackdropType;
  name: string;
  /** CSS background for the picker swatch. */
  swatch: string;
}

export const BACKDROPS: BackdropDef[] = [
  { type: "none", name: "Your room", swatch: "repeating-linear-gradient(45deg,#c9c4bb 0 4px,#e9e5dd 4px 8px)" },
  { type: "white", name: "White wall", swatch: "radial-gradient(circle at 50% 40%,#fbfaf7,#d6d2ca)" },
  { type: "grey", name: "Studio grey", swatch: "radial-gradient(circle at 50% 40%,#a9a7a2,#6f6d69)" },
  { type: "black", name: "Black", swatch: "radial-gradient(circle at 50% 40%,#2a2928,#070707)" },
  { type: "curtain", name: "Velvet curtain", swatch: "repeating-linear-gradient(90deg,#5a0f12 0 3px,#a8242a 3px 9px,#5a0f12 9px 12px)" },
];

/**
 * Film stocks for the authentic look. "booth" is our own tuned curve (the
 * original authentic look); the rest are HaldCLUTs from Pat David's RawTherapee
 * Film Simulation collection (CC BY-SA 4.0), in public/luts/.
 */
export type FilmType =
  | "booth"
  | "polaroid-667"
  | "polaroid-665-3"
  | "fuji-fp-3000b-hc"
  | "ilford-hp5-plus-400"
  | "kodak-tri-x-400-2"
  | "rollei-ortho-25"
  | "rollei-retro-80s"
  | "fuji-fp-100c-3";

export interface FilmDef {
  type: FilmType;
  name: string;
  /** Which tone mode it belongs to; "both" shows in b&w and colour. */
  mode: "bw" | "color" | "both";
  lut?: string;
}

const lut = (slug: FilmType) => `${import.meta.env.BASE_URL}luts/${slug}.png`;

export const FILMS: FilmDef[] = [
  { type: "booth", name: "Booth (original)", mode: "both" },
  { type: "polaroid-667", name: "Polaroid 667", mode: "bw", lut: lut("polaroid-667") },
  { type: "polaroid-665-3", name: "Polaroid 665", mode: "bw", lut: lut("polaroid-665-3") },
  { type: "fuji-fp-3000b-hc", name: "Fuji FP-3000B HC", mode: "bw", lut: lut("fuji-fp-3000b-hc") },
  { type: "ilford-hp5-plus-400", name: "Ilford HP5", mode: "bw", lut: lut("ilford-hp5-plus-400") },
  { type: "kodak-tri-x-400-2", name: "Kodak Tri-X", mode: "bw", lut: lut("kodak-tri-x-400-2") },
  { type: "rollei-ortho-25", name: "Rollei Ortho", mode: "bw", lut: lut("rollei-ortho-25") },
  { type: "rollei-retro-80s", name: "Rollei Retro 80s", mode: "bw", lut: lut("rollei-retro-80s") },
  { type: "fuji-fp-100c-3", name: "Fuji FP-100C", mode: "color", lut: lut("fuji-fp-100c-3") },
];

export const filmsFor = (color: boolean) => FILMS.filter((f) => f.mode === "both" || f.mode === (color ? "color" : "bw"));

/** The stock to use; one that doesn't fit the tone mode falls back to the original booth look. */
export const filmDef = (t: FilmType, color: boolean) => filmsFor(color).find((f) => f.type === t) ?? FILMS[0];

export const frameDef = (t: FrameType) => FRAMES.find((f) => f.type === t) ?? FRAMES[0];

const FRAME_KEY = "photobooth_frame";
const FILTER_KEY = "photobooth_filter";
const LOOK_KEY = "photobooth_look";
const BACKDROP_KEY = "photobooth_backdrop";
const FILM_KEY = "photobooth_film";
const FALLOFF_KEY = "photobooth_falloff";

export function getFrame(): FrameType {
  const v = localStorage.getItem(FRAME_KEY);
  return FRAMES.some((f) => f.type === v) ? (v as FrameType) : "black";
}
export const setFrame = (t: FrameType) => localStorage.setItem(FRAME_KEY, t);

/** Black & white is the default, like a real booth. */
export const isColorMode = () => localStorage.getItem(FILTER_KEY) === "color";
export const setColorMode = (color: boolean) => localStorage.setItem(FILTER_KEY, color ? "color" : "bw");

/** "authentic" = harsh close-flash booth exposure; "normal" is the default. */
export const isAuthentic = () => localStorage.getItem(LOOK_KEY) === "authentic";
export const setAuthentic = (on: boolean) => localStorage.setItem(LOOK_KEY, on ? "authentic" : "normal");

export function getBackdrop(): BackdropType {
  const v = localStorage.getItem(BACKDROP_KEY);
  return BACKDROPS.some((b) => b.type === v) ? (v as BackdropType) : "none";
}
export const setBackdrop = (t: BackdropType) => localStorage.setItem(BACKDROP_KEY, t);

export function getFilm(): FilmType {
  const v = localStorage.getItem(FILM_KEY);
  return FILMS.some((f) => f.type === v) ? (v as FilmType) : "booth";
}
export const setFilm = (t: FilmType) => localStorage.setItem(FILM_KEY, t);

/** Flash falloff (darker room behind you); off by default. */
export const isFalloff = () => localStorage.getItem(FALLOFF_KEY) === "on";
export const setFalloff = (on: boolean) => localStorage.setItem(FALLOFF_KEY, on ? "on" : "off");

export function resetSettings() {
  localStorage.removeItem(FILM_KEY);
  localStorage.removeItem(FALLOFF_KEY);
  localStorage.removeItem(FRAME_KEY);
  localStorage.removeItem(FILTER_KEY);
  localStorage.removeItem(LOOK_KEY);
  localStorage.removeItem(BACKDROP_KEY);
}

/** Strips on light paper get a drop shadow when displayed; black ones don't. */
export const needsShadow = (t: FrameType) => t !== "black";
