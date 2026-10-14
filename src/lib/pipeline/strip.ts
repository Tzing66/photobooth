// Assembles four photos into a developed photostrip, plus four standalone
// single prints (used by the "cut" view on the pickup screen).
//
// Spacing, photo placement and edge burn are all randomised a little on
// every print so each strip looks hand-assembled.

import { type FrameType, frameDef } from "../frames";
import { blackAndWhite, bloom, dust, edgeBurn, filmColor, flashGlow, harshFlash, heavyGrain, soften } from "./effects";
import { drawOverlay, ensureOverlayFonts, type Cell } from "./overlays";
import { applyTexture, randomTexture } from "./textures";

const S = 2; // render scale
const CELL_W = 240 * S;
const CELL_H = 320 * S;
const SINGLE_H = 480 * S;
const CAPTION_FONT = "Archivo";

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
/** -S, 0 or +S: the one-pixel wobble of a hand-fed print. */
const nudge = () => randInt(-1, 1) * S;

function loadImage(src: string, label: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error(`${label} load timeout`)), 10_000);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Failed to load ${label}`));
    };
    img.src = src;
  });
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { alpha: false, willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { c, ctx };
}

/** Source rect that centre-crops `img` to `aspect` (w/h). */
function coverCrop(img: HTMLImageElement, aspect: number) {
  const { width: w, height: h } = img;
  if (w / h > aspect) {
    const cw = h * aspect;
    return [(w - cw) / 2, 0, cw, h] as const;
  }
  const ch = w / aspect;
  return [0, (h - ch) / 2, w, ch] as const;
}

interface Look {
  paper: string;
  color: boolean;
  authentic: boolean;
  texture: HTMLCanvasElement;
}

/** Render one developed photo of size w×h. */
function develop(img: HTMLImageElement, w: number, h: number, { paper, color, authentic, texture }: Look) {
  const { c, ctx } = canvas(w, h);
  const [sx, sy, sw, sh] = coverCrop(img, w / h);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  if (authentic) {
    soften(ctx, w, h);
    harshFlash(ctx, w, h);
    bloom(ctx, w, h);
  }
  if (!color) flashGlow(ctx, 0, 0, w, h);
  applyTexture(ctx, texture, 0, 0, w, h, authentic ? 0.18 : 0.25);
  edgeBurn(ctx, 0, 0, w, h, paper);
  if (color) filmColor(ctx, w, h);
  else blackAndWhite(ctx, w, h);
  if (authentic) heavyGrain(ctx, w, h);
  return c;
}

async function ensureCaptionFont() {
  try {
    await document.fonts.load(`500 32px ${CAPTION_FONT}`);
  } catch {
    /* falls back to sans-serif */
  }
}

function drawCaption(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, px: number) {
  ctx.font = `500 ${px}px ${CAPTION_FONT}, sans-serif`;
  ctx.fillStyle = "#666666";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

export interface StripResult {
  strip: string;
  singles: string[];
}

export interface StripOptions {
  frame: FrameType;
  color: boolean;
  /** Harsh close-flash booth look (see effects.ts). */
  authentic?: boolean;
  /** Skip the four single prints (used when rendering frame previews). */
  stripOnly?: boolean;
}

export async function createPhotostrip(images: string[], { frame, color, authentic = false, stripOnly }: StripOptions): Promise<StripResult> {
  if (images.length !== 4 || images.some((i) => !i)) throw new Error("Invalid images array");

  const def = frameDef(frame);
  const paper = def.background;
  const captioned = !!def.caption;
  const extra = def.pad ?? {};
  if (captioned) await ensureCaptionFont();
  if (def.overlay) await ensureOverlayFonts();

  const loaded = await Promise.all(images.map((src, i) => loadImage(src, `image ${i}`)));

  // --- layout ---
  const gap = randInt(5, 10) * S + (captioned ? 20 * S : 0) + (extra.gap ?? 0) * S;
  const pad = randInt(5, 10) * S;
  const top = (captioned ? pad + gap : pad) + (extra.top ?? 0) * S;
  const side = pad + (captioned ? 4 * S : 0) + (extra.side ?? 0) * S;
  const bottom = pad + (extra.bottom ?? 0) * S;
  const width = CELL_W + side * 2;
  const height = 4 * (CELL_H + 2) + 3 * gap + bottom + top;

  const { c: strip, ctx } = canvas(width, height);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  const photoTexture = randomTexture();
  const paperTexture = randomTexture();
  const look: Look = { paper, color, authentic, texture: photoTexture };
  applyTexture(ctx, paperTexture, 0, 0, width, height, 0.1, true);

  const cells: Cell[] = [];
  loaded.forEach((img, i) => {
    const x = side;
    const y = top + i * (CELL_H + gap);
    cells.push({ x, y, w: CELL_W, h: CELL_H });
    ctx.drawImage(develop(img, CELL_W, CELL_H, look), x + nudge(), y + nudge());
  });

  if (def.caption) {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const y = i === 0 ? top - 13 * S : top + i * CELL_H + (i - 0.5) * gap;
      drawCaption(ctx, def.caption, width / 2, y, 16 * S);
    }
    ctx.restore();
  }
  dust(ctx, width, height);
  if (def.overlay) drawOverlay(ctx, frame, { width, height, cells, s: S });

  const result: StripResult = { strip: strip.toDataURL("image/png"), singles: [] };
  if (stripOnly) return result;

  // --- single prints ---
  for (const img of loaded) {
    const margin = randInt(7, 9) * S;
    const jx = nudge();
    const jy = nudge();
    const captionSpace = captioned ? 40 * S : 0;
    const sideExtra = captioned ? 5 * S : 0;
    const bottomExtra = captioned ? 5 * S : 0;
    const w = SINGLE_H * 0.75 + 2 * sideExtra;
    const h = SINGLE_H + captionSpace + bottomExtra;

    const { c: single, ctx: sctx } = canvas(w, h);
    sctx.fillStyle = paper;
    sctx.fillRect(0, 0, w, h);
    applyTexture(sctx, paperTexture, 0, 0, w, h, 0.1, true);

    const pw = w - 2 * margin - 2 * sideExtra;
    const ph = SINGLE_H - 2 * margin;
    const shiftX = Math.min(margin / 2, Math.abs(jx)) * Math.sign(jx || -1);
    const shiftY = Math.min(margin / 2, Math.abs(jy)) * Math.sign(jy || -1);
    sctx.drawImage(develop(img, pw, ph, look), margin + sideExtra + shiftX, margin + captionSpace + shiftY);
    dust(sctx, w, h);
    if (def.caption) drawCaption(sctx, def.caption, w / 2, captionSpace / 2 + 5 * S, 25 * S);
    result.singles.push(single.toDataURL("image/png"));
  }
  return result;
}
