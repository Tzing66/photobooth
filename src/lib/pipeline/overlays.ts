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
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));

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


// --- artsy / indie frames ------------------------------------------------------

const MONO = '"Space Mono", ui-monospace, monospace';
const HAND = '"Gaegu", "Comic Sans MS", cursive';
const TYPE = '"Courier Prime", "Courier New", monospace';
const SANS = '"Archivo", sans-serif';

/** Fonts the overlays draw with; awaited before rendering so canvas text isn't a fallback. */
export async function ensureOverlayFonts() {
  await Promise.all(
    [`700 20px ${MONO}`, `700 20px ${HAND}`, `700 20px ${TYPE}`, `700 20px ${SANS}`].map((f) => document.fonts.load(f).catch(() => null)),
  );
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx: Ctx, str: string, x: number, y: number, font: string, fill: string, align: CanvasTextAlign = "center", rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(str, 0, 0);
  ctx.restore();
}

const today = () => {
  const d = new Date();
  return { yy: String(d.getFullYear()).slice(2), mm: String(d.getMonth() + 1).padStart(2, "0"), dd: String(d.getDate()).padStart(2, "0"), d };
};

/** 35mm negative: sprocket holes down both edges, edge print and frame numbers. */
function negative(ctx: Ctx, L: StripLayout) {
  const s = L.s;
  const margin = L.cells[0].x;
  const holeW = 9 * s;
  const holeH = 6 * s;
  const inset = 5 * s;
  ctx.fillStyle = "#ece6d8";
  for (let y = 4 * s; y < L.height - holeH; y += 13 * s) {
    roundRect(ctx, inset, y, holeW, holeH, 1.5 * s);
    ctx.fill();
    roundRect(ctx, L.width - inset - holeW, y, holeW, holeH, 1.5 * s);
    ctx.fill();
  }
  const amber = "#e39a2d";
  const colL = inset + holeW + (margin - inset - holeW) / 2;
  const colR = L.width - colL;
  for (let y = 70 * s; y < L.height; y += 150 * s) text(ctx, "SAFETY FILM 400", colL, y, `700 ${6 * s}px ${MONO}`, amber, "center", -Math.PI / 2);
  const n0 = randInt(6, 30);
  L.cells.forEach((c, i) => {
    text(ctx, `${n0 + i}`, colR, c.y + c.h / 2, `700 ${7 * s}px ${MONO}`, amber, "center", Math.PI / 2);
    text(ctx, `▸${n0 + i}A`, colR, c.y + 14 * s, `700 ${5 * s}px ${MONO}`, amber, "center", Math.PI / 2);
  });
}

/** Photographer's contact sheet: frame numbers, a grease-pencil circle and an X. */
function contact(ctx: Ctx, L: StripLayout) {
  const s = L.s;
  const n0 = randInt(4, 30);
  L.cells.forEach((c, i) => {
    text(ctx, `${n0 + i}  ▸ ${n0 + i}A`, c.x + 2 * s, c.y + c.h + 9 * s, `700 ${6 * s}px ${MONO}`, "#d8d4c8", "left");
    text(ctx, "SAFETY FILM", c.x + c.w - 2 * s, c.y + c.h + 9 * s, `700 ${5 * s}px ${MONO}`, "#8d887d", "right");
  });

  const grease = "#ff4b1f";
  const keep = randInt(0, 3);
  const c = L.cells[keep];
  ctx.save();
  ctx.strokeStyle = grease;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.88;
  for (let pass = 0; pass < 2; pass++) {
    ctx.lineWidth = (3.4 - pass) * s;
    ctx.beginPath();
    const cx = c.x + c.w / 2 + rand(-4, 4) * s;
    const cy = c.y + c.h / 2 + rand(-4, 4) * s;
    const start = rand(0, Math.PI * 2);
    for (let t = 0; t <= Math.PI * 2 + 0.5; t += 0.08) {
      const wob = 1 + Math.sin(t * 3 + pass) * 0.025 + rand(-0.006, 0.006);
      const x = cx + Math.cos(start + t) * c.w * 0.5 * wob;
      const y = cy + Math.sin(start + t) * c.h * 0.5 * wob;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  text(ctx, "keeper!", c.x + c.w - 40 * s, c.y + c.h - 16 * s, `700 ${22 * s}px ${HAND}`, grease, "center", -0.18);

  const other = (keep + randInt(1, 3)) % 4;
  const o = L.cells[other];
  inkStroke(ctx, grease, 3 * s, () => {
    const x = o.x + o.w - 26 * s;
    const y = o.y + 12 * s;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 16 * s, y + 16 * s);
    ctx.moveTo(x + 16 * s, y);
    ctx.lineTo(x, y + 16 * s);
  }, 1);
}

/** Disposable camera: glowing orange date stamp in each frame. */
function disposable(ctx: Ctx, L: StripLayout) {
  const s = L.s;
  const { yy, mm, dd } = today();
  const stamp = `'${yy} ${mm} ${dd}`;
  for (const c of L.cells) {
    ctx.save();
    ctx.shadowColor = "#ff5a00";
    ctx.shadowBlur = 6 * s;
    ctx.globalAlpha = 0.92;
    text(ctx, stamp, c.x + c.w - 10 * s, c.y + c.h - 12 * s, `700 ${12 * s}px ${MONO}`, "#ff9a2e", "right");
    ctx.restore();
  }
  text(ctx, "SINGLE-USE CAMERA · 27 EXP · ISO 400", L.width / 2, L.height - 11 * s, `700 ${6 * s}px ${SANS}`, "#8a857b");
}

function tape(ctx: Ctx, x: number, y: number, angle: number, s: number) {
  const w = 74 * s;
  const h = 19 * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  const teeth = 4;
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  for (let i = 1; i <= teeth; i++) ctx.lineTo(w / 2 + (i % 2 ? 2 * s : 0), -h / 2 + (h * i) / teeth);
  ctx.lineTo(-w / 2, h / 2);
  for (let i = teeth - 1; i >= 0; i--) ctx.lineTo(-w / 2 - (i % 2 ? 2 * s : 0), -h / 2 + (h * i) / teeth);
  ctx.closePath();
  ctx.shadowColor = "rgba(60,40,20,0.25)";
  ctx.shadowBlur = 3 * s;
  ctx.fillStyle = "rgba(240,230,198,0.8)";
  ctx.fill();
  ctx.restore();
}

/** Kraft-paper scrapbook page: fibres, masking tape on the corners, a handwritten date. */
function scrapbook(ctx: Ctx, L: StripLayout) {
  const s = L.s;
  ctx.save();
  ctx.lineCap = "round";
  const inPhoto = (x: number, y: number) => L.cells.some((c) => x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h);
  for (let i = 0; i < 420; i++) {
    const x = rand(0, L.width);
    const y = rand(0, L.height);
    if (inPhoto(x, y)) continue;
    ctx.strokeStyle = Math.random() < 0.5 ? "rgba(255,245,225,0.22)" : "rgba(80,50,20,0.18)";
    ctx.lineWidth = rand(0.4, 1.1) * s;
    const a = rand(0, Math.PI);
    const len = rand(3, 9) * s;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.restore();
  // Taped along the top corners only, so neighbouring photos' tape never collides.
  for (const c of L.cells) {
    tape(ctx, c.x + 12 * s, c.y + 8 * s, -0.7 + rand(-0.12, 0.12), s);
    tape(ctx, c.x + c.w - 12 * s, c.y + 8 * s, 0.7 + rand(-0.12, 0.12), s);
  }
  const { d } = today();
  const label = `${d.toLocaleString("en", { month: "short" }).toLowerCase()} '${String(d.getFullYear()).slice(2)} ♡`;
  text(ctx, label, L.width / 2, L.height - 15 * s, `700 ${22 * s}px ${HAND}`, "#4a3420", "center", -0.04);
}

/** Old cinema ticket: border, ADMIT ONE header, perforations and a serial number. */
function ticket(ctx: Ctx, L: StripLayout) {
  const s = L.s;
  const red = "#b0412e";
  const first = L.cells[0];
  const last = L.cells[L.cells.length - 1];
  ctx.save();
  ctx.strokeStyle = red;
  ctx.lineWidth = 1.2 * s;
  ctx.strokeRect(4 * s, 4 * s, L.width - 8 * s, L.height - 8 * s);
  ctx.lineWidth = 0.6 * s;
  ctx.strokeRect(6.5 * s, 6.5 * s, L.width - 13 * s, L.height - 13 * s);
  ctx.restore();

  const perf = (y: number) => {
    ctx.fillStyle = "rgba(120,90,60,0.55)";
    for (let x = 10 * s; x < L.width - 8 * s; x += 5 * s) {
      ctx.beginPath();
      ctx.arc(x, y, 1.1 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  perf(first.y - 6 * s);
  perf(last.y + last.h + 6 * s);

  text(ctx, "★ PHOTO BOOTH ★", L.width / 2, first.y / 2 - 9 * s, `700 ${6 * s}px ${TYPE}`, red);
  text(ctx, "ADMIT ONE", L.width / 2, first.y / 2 + 5 * s, `700 ${17 * s}px ${SANS}`, red);
  const bottomMid = (last.y + last.h + L.height) / 2;
  text(ctx, `Nº ${String(randInt(1, 999999)).padStart(6, "0")}`, L.width / 2, bottomMid - 4 * s, `700 ${11 * s}px ${TYPE}`, red);
  text(ctx, "KEEP THIS COUPON", L.width / 2, bottomMid + 8 * s, `700 ${5 * s}px ${TYPE}`, "rgba(120,90,60,0.8)");
}

/** A pressed sprig: curved stem, alternating leaves and a small flower. */
function sprig(ctx: Ctx, x: number, y: number, angle: number, len: number, s: number, petal: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 3 * s;
  ctx.shadowOffsetY = s;
  const bend = len * 0.18;
  const pt = (t: number) => ({ x: len * t, y: bend * 4 * t * (1 - t) });
  ctx.strokeStyle = "#5f6f4c";
  ctx.lineWidth = 1.3 * s;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len / 2, bend * 2, len, 0);
  ctx.stroke();
  for (let t = 0.16, side = 1; t < 0.9; t += 0.1, side *= -1) {
    const p = pt(t);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(side * 0.9 - 0.25);
    ctx.fillStyle = side > 0 ? "#7d8f69" : "#93a37c";
    ctx.beginPath();
    ctx.ellipse(8 * s, 0, 10 * s, 3.6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(60,70,45,0.6)";
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(17 * s, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.translate(len, 0);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(5 * s, 0, 5 * s, 3.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#c9a43b";
  ctx.beginPath();
  ctx.arc(0, 0, 2.3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Cream paper with pressed botanicals tucked over the photo corners. */
function pressed(ctx: Ctx, L: StripLayout) {
  const s = L.s;
  const petals = ["#c98b8b", "#d9a7a0", "#b9a2c4", "#e0c27a"];
  L.cells.forEach((c, i) => {
    const petal = petals[(i + randInt(0, 3)) % petals.length];
    if (i % 2 === 0) sprig(ctx, c.x - 4 * s, c.y + c.h - 4 * s, -0.9 + rand(-0.15, 0.15), rand(78, 96) * s, s, petal);
    else sprig(ctx, c.x + c.w + 4 * s, c.y + 4 * s, Math.PI - 0.9 + rand(-0.15, 0.15), rand(78, 96) * s, s, petal);
  });
  // a few loose petals
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = petals[i % petals.length];
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(rand(0, L.width), rand(0, L.height), 3.5 * s, 2 * s, rand(0, Math.PI), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const OVERLAYS: Partial<Record<FrameType, (ctx: Ctx, L: StripLayout) => void>> = {
  stars,
  hearts,
  doodle,
  cutout,
  negative,
  contact,
  disposable,
  scrapbook,
  ticket,
  pressed,
};

export function drawOverlay(ctx: Ctx, frame: FrameType, layout: StripLayout) {
  OVERLAYS[frame]?.(ctx, layout);
}
