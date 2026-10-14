// Decorative overlays drawn over the finished strip for the "sticker" frames.
// Everything is vector-drawn on the canvas, positioned relative to the photo cells.

import type { FrameType } from "../frames";

type Ctx = CanvasRenderingContext2D;

export interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface StripLayout {
  width: number;
  height: number;
  cells: Cell[];
  /** Pixel scale factor (the strip is rendered at 2x). */
  s: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// --- shapes -----------------------------------------------------------------

function starPath(ctx: Ctx, cx: number, cy: number, r: number, rot: number, points = 5, inner = 0.45) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = rot + (i * Math.PI) / points - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
}

/** Classic parametric heart; `jitter` makes it look hand-drawn. */
function heartPath(ctx: Ctx, cx: number, cy: number, sx: number, sy = sx, jitter = 0, rot = 0) {
  ctx.beginPath();
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    let x = 16 * Math.sin(t) ** 3;
    let y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    x = x * sx + (jitter ? (Math.random() - 0.5) * jitter : 0);
    y = (y + 2) * sy + (jitter ? (Math.random() - 0.5) * jitter : 0);
    const rx = x * Math.cos(rot) - y * Math.sin(rot);
    const ry = x * Math.sin(rot) + y * Math.cos(rot);
    if (i === 0) ctx.moveTo(cx + rx, cy + ry);
    else ctx.lineTo(cx + rx, cy + ry);
  }
  ctx.closePath();
}

function goldStar(ctx: Ctx, cx: number, cy: number, r: number) {
  const rot = rand(-0.4, 0.4);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = r * 0.25;
  ctx.shadowOffsetY = r * 0.08;
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, "#f7dc7a");
  g.addColorStop(0.5, "#d9a93a");
  g.addColorStop(1, "#9c6f1c");
  ctx.fillStyle = g;
  starPath(ctx, cx, cy, r, rot);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "#7a5413";
  ctx.lineWidth = Math.max(1, r * 0.05);
  starPath(ctx, cx, cy, r, rot);
  ctx.stroke();
  // bevel highlight
  ctx.fillStyle = "rgba(255,248,210,0.55)";
  starPath(ctx, cx - r * 0.08, cy - r * 0.1, r * 0.45, rot);
  ctx.fill();
  ctx.restore();
}

function inkStroke(ctx: Ctx, colour: string, width: number, draw: () => void, passes = 2) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (let p = 0; p < passes; p++) {
    draw();
    ctx.stroke();
  }
  ctx.restore();
}

function sketchRect(ctx: Ctx, x: number, y: number, w: number, h: number, wobble: number) {
  const j = () => (Math.random() - 0.5) * wobble;
  ctx.beginPath();
  ctx.moveTo(x + j(), y + j());
  ctx.lineTo(x + w + j(), y + j());
  ctx.lineTo(x + w + j(), y + h + j());
  ctx.lineTo(x + j(), y + h + j());
  ctx.lineTo(x + j(), y + j() + wobble);
}

function burst(ctx: Ctx, cx: number, cy: number, r: number) {
  const pts = 7;
  ctx.beginPath();
  for (let i = 0; i <= pts * 2; i++) {
    const rad = (i % 2 === 0 ? r : r * 0.42) * rand(0.85, 1.1);
    const a = (i * Math.PI) / pts;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
}

function sparkle(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
}

function bow(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.6, cy, r * 0.6, r * 0.38, -0.3, 0, Math.PI * 2);
  ctx.moveTo(cx + r * 1.2, cy);
  ctx.ellipse(cx + r * 0.6, cy, r * 0.6, r * 0.38, 0.3, 0, Math.PI * 2);
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cx - r * 0.3, cy + r * 0.8, cx - r * 0.7, cy + r * 1.2);
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cx + r * 0.3, cy + r * 0.8, cx + r * 0.6, cy + r * 1.3);
}

function cherries(ctx: Ctx, cx: number, cy: number, r: number, colour: string) {
  ctx.save();
  ctx.fillStyle = colour;
  for (const dx of [-0.55, 0.55]) {
    ctx.beginPath();
    ctx.arc(cx + dx * r, cy + r * 0.5, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(cx - 0.55 * r, cy + 0.1 * r);
  ctx.quadraticCurveTo(cx - 0.2 * r, cy - r * 0.6, cx + r * 0.3, cy - r);
  ctx.moveTo(cx + 0.55 * r, cy + 0.1 * r);
  ctx.quadraticCurveTo(cx + 0.4 * r, cy - r * 0.5, cx + r * 0.3, cy - r);
}

function envelope(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.rect(cx - r, cy - r * 0.65, r * 2, r * 1.3);
  ctx.moveTo(cx - r, cy - r * 0.65);
  ctx.lineTo(cx, cy + r * 0.1);
  ctx.lineTo(cx + r, cy - r * 0.65);
}

// --- frames -----------------------------------------------------------------

function stars(ctx: Ctx, L: StripLayout) {
  const [a, b, c, d] = L.cells;
  const r = L.s * 13;
  // Clusters tumbling off the corners of the cells.
  const clusters: [number, number, number][] = [
    [a.x + r * 0.6, a.y + r * 0.5, 1],
    [a.x + r * 2.4, a.y + r * 0.2, 0.6],
    [a.x + r * 4, a.y + r * 1.4, 0.5],
    [a.x + r * 0.9, a.y + r * 2.6, 0.75],
    [a.x + a.w - r * 0.8, a.y + a.h - r * 2.2, 0.6],
    [a.x + a.w - r * 2.2, a.y + a.h - r * 1, 0.45],
    [b.x + r * 0.7, b.y + b.h - r * 1.4, 0.9],
    [b.x + r * 2.4, b.y + b.h - r * 0.6, 0.55],
    [b.x + r * 1.4, b.y + b.h + r * 0.3, 0.6],
    [c.x + c.w - r * 1.2, c.y + c.h - r * 1.2, 0.8],
    [d.x + d.w - r * 0.4, d.y - r * 0.1, 0.65],
    [d.x + d.w - r * 2.4, d.y + r * 0.6, 0.5],
    [d.x + r * 0.5, d.y + d.h - r * 2.4, 0.9],
    [d.x + r * 2.3, d.y + d.h - r * 0.4, 1],
    [d.x + r * 4.3, d.y + d.h - r * 0.9, 0.55],
    [d.x + r * 0.4, d.y + d.h - r * 0.2, 0.5],
  ];
  for (const [x, y, k] of clusters) goldStar(ctx, x + rand(-3, 3), y + rand(-3, 3), r * k);
}

function hearts(ctx: Ctx, L: StripLayout) {
  const [a, b, c, d] = L.cells;
  const s = L.s;
  const red = "#c41e3a";
  const drawFilled = (x: number, y: number, k: number) => {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4 * s;
    ctx.shadowOffsetY = 1.5 * s;
    ctx.fillStyle = red;
    heartPath(ctx, x, y, k * s, k * s, 0, rand(-0.35, 0.35));
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(x - k * s * 7, y - k * s * 6, k * s * 2.6, k * s * 1.6, -0.6, 0, Math.PI * 2);
    ctx.fill();
  };
  const drawOutline = (x: number, y: number, k: number) =>
    inkStroke(ctx, red, 1.6 * s, () => heartPath(ctx, x, y, k * s, k * s, k * s * 1.4, rand(-0.4, 0.4)));

  drawFilled(a.x + 22 * s, a.y + 20 * s, 1);
  drawFilled(a.x + 48 * s, a.y + 12 * s, 0.6);
  drawOutline(a.x + 30 * s, a.y + 48 * s, 0.55);
  drawFilled(b.x + b.w - 22 * s, b.y + b.h - 26 * s, 0.9);
  drawOutline(b.x + b.w - 50 * s, b.y + b.h - 14 * s, 0.5);
  drawFilled(c.x + 20 * s, c.y + c.h - 18 * s, 0.7);
  drawFilled(d.x + d.w - 24 * s, d.y + 22 * s, 0.85);
  drawOutline(d.x + d.w - 26 * s, d.y + 52 * s, 0.45);
  drawFilled(d.x + 26 * s, d.y + d.h - 24 * s, 1.1);
  drawFilled(d.x + 56 * s, d.y + d.h - 12 * s, 0.55);
}

function doodle(ctx: Ctx, L: StripLayout) {
  const [a, b, c, d] = L.cells;
  const s = L.s;
  const ink = "#b3121f";
  for (let i = 0; i < 3; i++) {
    const x = a.x + 16 * s + i * 22 * s;
    inkStroke(ctx, ink, 2.2 * s, () => heartPath(ctx, x, a.y + 14 * s, 0.6 * s, 0.6 * s, 1.5 * s));
  }
  inkStroke(ctx, ink, 2.2 * s, () => burst(ctx, a.x + a.w - 22 * s, a.y + a.h + (b.y - a.y - a.h) / 2, 22 * s));
  inkStroke(ctx, ink, 2.6 * s, () => sketchRect(ctx, c.x + 3 * s, c.y + 3 * s, c.w - 6 * s, c.h - 6 * s, 6 * s), 3);
  inkStroke(ctx, ink, 2.2 * s, () => burst(ctx, d.x + 22 * s, d.y + d.h - 24 * s, 20 * s));
}

function cutout(ctx: Ctx, L: StripLayout) {
  const s = L.s;
  const pink = "#ffdadd";
  const ink = "#9e2a3f";

  // Pink card with heart-shaped windows punched out over each photo.
  const sheet = document.createElement("canvas");
  sheet.width = L.width;
  sheet.height = L.height;
  const sc = sheet.getContext("2d")!;
  sc.fillStyle = pink;
  sc.fillRect(0, 0, L.width, L.height);
  sc.globalCompositeOperation = "destination-out";
  const hearts = L.cells.map((cell) => ({
    cx: cell.x + cell.w / 2,
    cy: cell.y + cell.h / 2,
    sx: (cell.w * 0.46) / 16,
    sy: (cell.h * 0.4) / 16,
  }));
  for (const h of hearts) {
    heartPath(sc, h.cx, h.cy, h.sx, h.sy);
    sc.fill();
  }
  sc.globalCompositeOperation = "source-over";

  // The shadow makes the card read as a die-cut sitting on top of the print.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6 * s;
  ctx.drawImage(sheet, 0, 0);
  ctx.restore();

  for (const h of hearts) {
    inkStroke(ctx, ink, 2.4 * s, () => heartPath(ctx, h.cx + rand(-2, 2) * s, h.cy + rand(-2, 2) * s, h.sx * 1.02, h.sy * 1.02, 4 * s));
  }

  // Little doodles in the corners the hearts leave free.
  const kit: ((x: number, y: number) => void)[] = [
    (x, y) => inkStroke(ctx, ink, 1.6 * s, () => bow(ctx, x, y, 12 * s)),
    (x, y) => inkStroke(ctx, ink, 1.4 * s, () => sparkle(ctx, x, y, 10 * s), 1),
    (x, y) => inkStroke(ctx, ink, 1.6 * s, () => cherries(ctx, x, y, 11 * s, ink), 1),
    (x, y) => inkStroke(ctx, ink, 1.6 * s, () => envelope(ctx, x, y, 11 * s), 1),
    (x, y) => {
      ctx.fillStyle = ink;
      heartPath(ctx, x, y, 0.45 * s);
      ctx.fill();
    },
    (x, y) => {
      ctx.fillStyle = ink;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x + rand(-14, 14) * s, y + rand(-14, 14) * s, rand(1, 2.4) * s, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  ];
  let k = Math.floor(Math.random() * kit.length);
  for (const cell of L.cells) {
    const corners: [number, number][] = [
      [cell.x + 20 * s, cell.y + 18 * s],
      [cell.x + cell.w - 20 * s, cell.y + 18 * s],
      [cell.x + 22 * s, cell.y + cell.h - 26 * s],
      [cell.x + cell.w - 22 * s, cell.y + cell.h - 26 * s],
    ];
    for (const [x, y] of corners) kit[k++ % kit.length](x, y);
  }
}

const OVERLAYS: Partial<Record<FrameType, (ctx: Ctx, L: StripLayout) => void>> = {
  stars,
  hearts,
  doodle,
  cutout,
};

export function drawOverlay(ctx: Ctx, frame: FrameType, layout: StripLayout) {
  OVERLAYS[frame]?.(ctx, layout);
}
