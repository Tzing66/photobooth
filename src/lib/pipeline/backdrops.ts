// Booth backdrops painted behind the cut-out person. They're drawn before the
// darkroom steps, so they get the same flash, grain and toning as the photo.

import type { BackdropType } from "../frames";
import { randomTexture } from "./textures";

type Ctx = CanvasRenderingContext2D;

/** Flash-lit wall: bright where the flash hits, falling off to the corners. */
function litWall(ctx: Ctx, w: number, h: number, centre: string, edge: string) {
  const g = ctx.createRadialGradient(w / 2, h * 0.42, w * 0.1, w / 2, h * 0.5, Math.hypot(w, h) * 0.6);
  g.addColorStop(0, centre);
  g.addColorStop(1, edge);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function curtain(ctx: Ctx, w: number, h: number) {
  const pleats = 6.5;
  const phase = Math.random() * Math.PI * 2;
  const g = ctx.createLinearGradient(0, 0, w, 0);
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const fold = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * pleats + phase);
    const v = 0.35 + 0.65 * fold ** 1.6; // sharp dark creases, broad lit folds
    g.addColorStop(t, `rgb(${Math.round(150 * v)},${Math.round(22 * v)},${Math.round(26 * v)})`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // light falls off toward the top (rod shadow) and the floor
  const v = ctx.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, "rgba(0,0,0,0.45)");
  v.addColorStop(0.18, "rgba(0,0,0,0)");
  v.addColorStop(0.8, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

export function paintBackdrop(ctx: Ctx, type: BackdropType, w: number, h: number) {
  switch (type) {
    case "white":
      litWall(ctx, w, h, "#fbfaf7", "#d6d2ca");
      break;
    case "grey":
      litWall(ctx, w, h, "#a9a7a2", "#6f6d69");
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(randomTexture(), 0, 0, w, h); // painted-canvas mottling
      ctx.restore();
      break;
    case "black":
      litWall(ctx, w, h, "#1e1d1c", "#070707");
      break;
    case "curtain":
      curtain(ctx, w, h);
      break;
    case "none":
      break;
  }
}

/** Plain walls catch the flash: the subject casts a soft shadow behind them. */
export const castsShadow = (type: BackdropType) => type === "white" || type === "grey";
