// Frame catalogue and the small per-session settings kept in localStorage.

export type FrameType =
  | "black"
  | "white"
  | "cutout"
  | "hearts"
  | "seasonal"
  | "seasonal2"
  | "birthday"
  | "branded"
  | "stars"
  | "doodle";

export interface FrameDef {
  type: FrameType;
  name: string;
  /** Strip background; also tints the edge burn on light frames. */
  background: string;
  /** Text printed above every photo. */
  caption?: string;
  /** Drawn over the finished strip (stars, hearts, ...). */
  overlay?: boolean;
}

export const FRAMES: FrameDef[] = [
  { type: "black", name: "Classic Black", background: "black" },
  { type: "white", name: "Classic White", background: "#d5d1cc" },
  { type: "cutout", name: "Heart Cutouts", background: "#d5d1cc", overlay: true },
  { type: "hearts", name: "Hearts", background: "#d5d1cc", overlay: true },
  { type: "seasonal", name: "Valentine", background: "#ffdadd", caption: "HAPPY VALENTINE'S DAY" },
  { type: "seasonal2", name: "Be Mine", background: "#ffdadd", caption: "be my valentine? ❤︎" },
  { type: "birthday", name: "Birthday", background: "#d5d1cc", caption: "HAPPY BIRTHDAY" },
  { type: "branded", name: "Photobooth", background: "#d5d1cc", caption: "PHOTOBOOTH · EST. 2026" },
  { type: "stars", name: "Stars", background: "black", overlay: true },
  { type: "doodle", name: "Doodles", background: "#d5d1cc", overlay: true },
];

export const frameDef = (t: FrameType) => FRAMES.find((f) => f.type === t) ?? FRAMES[0];

const FRAME_KEY = "photobooth_frame";
const FILTER_KEY = "photobooth_filter";

export function getFrame(): FrameType {
  const v = localStorage.getItem(FRAME_KEY);
  return FRAMES.some((f) => f.type === v) ? (v as FrameType) : "black";
}
export const setFrame = (t: FrameType) => localStorage.setItem(FRAME_KEY, t);

/** Black & white is the default, like a real booth. */
export const isColorMode = () => localStorage.getItem(FILTER_KEY) === "color";
export const setColorMode = (color: boolean) => localStorage.setItem(FILTER_KEY, color ? "color" : "bw");

export function resetSettings() {
  localStorage.removeItem(FRAME_KEY);
  localStorage.removeItem(FILTER_KEY);
}

/** Strips on light paper get a drop shadow when displayed; black ones don't. */
export const needsShadow = (t: FrameType) => t !== "black";
