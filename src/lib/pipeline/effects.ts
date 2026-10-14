// Per-photo darkroom effects. Each mutates a 2D context in place.

type Ctx = CanvasRenderingContext2D;

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Soft white bloom in the centre, like an on-camera flash. Black & white only. */
export function flashGlow(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, w * 0.1, x + w / 2, y + h / 2, w * 0.7);
  g.addColorStop(0, "rgba(255,255,255,0.25)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const LIGHT_PAPERS = ["#d5d1cc", "#ffdadd"];

/**
 * Uneven chemical burn along each edge. On dark frames the edges are erased so
 * the black strip shows through; on light frames they're tinted with the paper.
 * Each side gets its own random strength so no two prints match.
 */
export function edgeBurn(ctx: Ctx, x: number, y: number, w: number, h: number, paper = "black") {
  ctx.save();
  const light = LIGHT_PAPERS.includes(paper.toLowerCase());
  const rgb = light ? hexToRgb(paper) : null;
  ctx.globalCompositeOperation = light ? "source-over" : "destination-out";

  const base = Math.min(w, h) * 0.022;
  const size = base + Math.min(w, h) * (Math.random() * 0.005 - 0.0025);
  const strength = light ? 0.7 + Math.random() * 0.15 : 0.95 + Math.random() * 0.05;
  const ramp = (light ? [0.55, 0.42, 0.3, 0.2, 0.13, 0.08, 0.04, 0.02, 0] : [0.95, 0.75, 0.55, 0.38, 0.25, 0.15, 0.08, 0.03, 0]).map(
    (a) => a * strength,
  );
  const colour = (a: number) => (rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${a})` : `rgba(0,0,0,${a})`);
  const stops = [0, 0.12, 0.25, 0.38, 0.5, 0.63, 0.75, 0.88];

  const side = (g: CanvasGradient, jitter: number, inward: boolean, rect: [number, number, number, number]) => {
    stops.forEach((s, i) => g.addColorStop(inward ? s : 1 - s, colour(ramp[i] * jitter)));
    g.addColorStop(inward ? 1 : 0, colour(0));
    ctx.fillStyle = g;
    ctx.fillRect(...rect);
  };
  const j = () => 0.9 + Math.random() * 0.2;

  side(ctx.createLinearGradient(x, y, x, y + size), j(), true, [x, y, w, size]);
  side(ctx.createLinearGradient(x, y + h - size, x, y + h), j(), false, [x, y + h - size, w, size]);
  side(ctx.createLinearGradient(x, y, x + size, y), j(), true, [x, y, size, h]);
  side(ctx.createLinearGradient(x + w - size, y, x + w, y), j(), false, [x + w - size, y, size, h]);
  ctx.restore();
}

/** Scatter of light and dark specks: dust on the print. */
export function dust(ctx: Ctx, w: number, h: number) {
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Punchy, slightly warm black & white: heavy contrast, crushed blacks. */
export function blackAndWhite(ctx: Ctx, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let v = (d[i] + d[i + 1] + d[i + 2]) / 3;
    v = (v - 128) * 1.9 + 128;
    if (v < 40) v -= 6;
    if (v > 210) v += 10;
    d[i] = clamp(v + 8);
    d[i + 1] = clamp(v + 3);
    d[i + 2] = clamp(v - 8);
  }
  ctx.putImageData(img, 0, 0);
}

/** Faded film-stock colour: lifted shadows, soft highlights, warm mids, grain. */
export function filmColor(ctx: Ctx, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum < 90) {
      r = clamp(r * 0.85 + 8);
      g = clamp(g * 0.85 + 8);
      b = clamp(b * 0.85 + 8);
    } else if (lum > 165) {
      const t = (lum - 165) / 90;
      r = clamp(r + (255 - r) * 0.12 * t);
      g = clamp(g + (255 - g) * 0.12 * t);
      b = clamp(b + (255 - b) * 0.12 * t);
    }

    const mr = r * 1.08 + g * 0.01 + b * -0.03;
    const mg = r * 0.02 + g * 1.02 + b * 0.01;
    const mb = r * 0.01 + g * 0.02 + b * 1.07;
    r = clamp(clamp(mr) + 8);
    g = clamp(clamp(mg) + 2);
    b = clamp(clamp(mb) + 1);

    r = clamp(r + (Math.random() - 0.5) * 3);
    g = clamp(g + (Math.random() - 0.5) * 2.5);
    b = clamp(b + (Math.random() - 0.5) * 3);

    const avg = (r + g + b) / 3;
    r = clamp(r * 0.88 + avg * 0.12);
    g = clamp(g * 0.88 + avg * 0.12);
    b = clamp(b * 0.88 + avg * 0.12);

    if (lum > 70 && lum < 180) {
      r = clamp(r + 3);
      g = clamp(g + 1);
      b = clamp(b - 1);
    }
    if (lum < 60) {
      r = clamp(r + 2);
      b = clamp(b + 1);
    }
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }
  ctx.putImageData(img, 0, 0);
}
