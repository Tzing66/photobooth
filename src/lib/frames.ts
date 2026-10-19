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
 * Every look in one list. "vintage" is the faded print (the original
 * "normal" look); "booth" is our crisp booth print, either with its own tone
 * curve or through a film stock. Film stocks are HaldCLUTs from Pat David's
 * RawTherapee Film Simulation collection (CC BY-SA 4.0), in public/luts/.
 */
export type FilterType =
  | "vintage"
  | "vintage-color"
  | "booth"
  | "booth-color"
  | "sepia"
  | "polaroid-667"
  | "polaroid-665-3"
  | "fuji-fp-3000b-hc"
  | "ilford-hp5-plus-400"
  | "kodak-tri-x-400-2"
  | "rollei-ortho-25"
  | "rollei-retro-80s"
  | "fuji-fp-100c-3";

export interface FilterDef {
  type: FilterType;
  name: string;
  color: boolean;
  look: "vintage" | "booth";
  lut?: string;
  /** Brown-toned silver print. */
  sepia?: boolean;
  /** CSS background for the picker swatch. */
  swatch: string;
}

const lut = (slug: FilterType) => `${import.meta.env.BASE_URL}luts/${slug}.png`;

const SWATCH = {
  soft: "linear-gradient(135deg,#3a3835,#d9d5ce)",
  hard: "linear-gradient(135deg,#050505 20%,#f4f4f2 80%)",
  color: "linear-gradient(135deg,#7a4a3a,#d9a27a 50%,#9fb7c2)",
  sepia: "linear-gradient(135deg,#2a1a0e 15%,#a5774d 50%,#f3e4c8 85%)",
};

export const FILTERS: FilterDef[] = [
  { type: "vintage", name: "Vintage", color: false, look: "vintage", swatch: SWATCH.soft },
  { type: "vintage-color", name: "Vintage Colour", color: true, look: "vintage", swatch: SWATCH.color },
  { type: "booth", name: "Booth", color: false, look: "booth", swatch: SWATCH.hard },
  { type: "booth-color", name: "Booth Colour", color: true, look: "booth", swatch: SWATCH.color },
  { type: "sepia", name: "Sepia", color: false, look: "booth", sepia: true, swatch: SWATCH.sepia },
  { type: "polaroid-667", name: "Polaroid 667", color: false, look: "booth", lut: lut("polaroid-667"), swatch: SWATCH.hard },
  { type: "polaroid-665-3", name: "Polaroid 665", color: false, look: "booth", lut: lut("polaroid-665-3"), swatch: SWATCH.hard },
  { type: "fuji-fp-3000b-hc", name: "Fuji FP-3000B", color: false, look: "booth", lut: lut("fuji-fp-3000b-hc"), swatch: SWATCH.hard },
  { type: "ilford-hp5-plus-400", name: "Ilford HP5", color: false, look: "booth", lut: lut("ilford-hp5-plus-400"), swatch: SWATCH.hard },
  { type: "kodak-tri-x-400-2", name: "Kodak Tri-X", color: false, look: "booth", lut: lut("kodak-tri-x-400-2"), swatch: SWATCH.hard },
  { type: "rollei-ortho-25", name: "Rollei Ortho", color: false, look: "booth", lut: lut("rollei-ortho-25"), swatch: SWATCH.hard },
  { type: "rollei-retro-80s", name: "Rollei Retro 80s", color: false, look: "booth", lut: lut("rollei-retro-80s"), swatch: SWATCH.hard },
  { type: "fuji-fp-100c-3", name: "Fuji FP-100C", color: true, look: "booth", lut: lut("fuji-fp-100c-3"), swatch: SWATCH.color },
];

export const filterDef = (t: FilterType) => FILTERS.find((f) => f.type === t) ?? FILTERS[0];

export const frameDef = (t: FrameType) => FRAMES.find((f) => f.type === t) ?? FRAMES[0];

const FRAME_KEY = "photobooth_frame";
const PRINT_KEY = "photobooth_print";
const BACKDROP_KEY = "photobooth_backdrop";
// Before filters were one list: b&w/colour, normal/authentic and a film.
const LEGACY_KEYS = ["photobooth_filter", "photobooth_look", "photobooth_film", "photobooth_falloff"];

export function getFrame(): FrameType {
  const v = localStorage.getItem(FRAME_KEY);
  return FRAMES.some((f) => f.type === v) ? (v as FrameType) : "black";
}
export const setFrame = (t: FrameType) => localStorage.setItem(FRAME_KEY, t);

/** Vintage B&W is the default; older saved settings map onto the matching filter. */
export function getFilter(): FilterType {
  const v = localStorage.getItem(PRINT_KEY);
  if (FILTERS.some((f) => f.type === v)) return v as FilterType;
  const color = localStorage.getItem("photobooth_filter") === "color";
  if (localStorage.getItem("photobooth_look") !== "authentic") return color ? "vintage-color" : "vintage";
  const film = FILTERS.find((f) => f.type === localStorage.getItem("photobooth_film") && f.lut);
  if (film && film.color === color) return film.type;
  return color ? "booth-color" : "booth";
}
export const setFilter = (t: FilterType) => localStorage.setItem(PRINT_KEY, t);

export function getBackdrop(): BackdropType {
  const v = localStorage.getItem(BACKDROP_KEY);
  return BACKDROPS.some((b) => b.type === v) ? (v as BackdropType) : "none";
}
export const setBackdrop = (t: BackdropType) => localStorage.setItem(BACKDROP_KEY, t);

export function resetSettings() {
  [FRAME_KEY, PRINT_KEY, BACKDROP_KEY, ...LEGACY_KEYS].forEach((k) => localStorage.removeItem(k));
}

/** Strips on light paper get a drop shadow when displayed; black ones don't. */
export const needsShadow = (t: FrameType) => t !== "black";
