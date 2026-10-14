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

/** Light papers tint the burn with their own colour; dark ones let black through. */
function isLightPaper(paper: string) {
  const rgb = hexToRgb(paper);
  return !!rgb && 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b > 140;
}

/**
 * Uneven chemical burn along each edge. On dark frames the edges are erased so
 * the black strip shows through; on light frames they're tinted with the paper.
 * Each side gets its own random strength so no two prints match.
 */
export function edgeBurn(ctx: Ctx, x: number, y: number, w: number, h: number, paper = "black") {
  ctx.save();
  const light = isLightPaper(paper);
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

// --- "authentic" booth look ---------------------------------------------------
// A real booth fires a bare flash about a foot from your face onto fast paper:
// faces blow out, shadows crush, light falls off hard toward the frame edges,
// highlights bleed, and the print is soft and grainy. These run before (soften,
// harshFlash, bloom) and after (heavyGrain) the normal toning.

/** Lens/paper softness: cheap blur by down- then up-sampling. */
export function soften(ctx: Ctx, w: number, h: number, k = 0.45) {
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(w * k));
  small.height = Math.max(1, Math.round(h * k));
  const sctx = small.getContext("2d")!;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(ctx.canvas, 0, 0, small.width, small.height);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, w, h);
  ctx.restore();
}

/** Over-exposure + hard S-curve, brightest slightly above centre where the face sits. */
export function harshFlash(ctx: Ctx, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const cx = w / 2;
  const cy = h * 0.42;
  const maxD = Math.hypot(w / 2, h * 0.58);
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const v = Math.min(1, (i / 255) * 1.3); // ~1/3 stop over
    const s = v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v); // S-curve
    curve[i] = (v * 0.35 + s * 0.65) * 255;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = Math.hypot(x - cx, y - cy) / maxD;
      const falloff = 1.08 - 0.5 * t * t; // flash hot-spot, dark corners
      const i = (y * w + x) * 4;
      d[i] = clamp(curve[d[i]] * falloff);
      d[i + 1] = clamp(curve[d[i + 1]] * falloff);
      d[i + 2] = clamp(curve[d[i + 2]] * falloff);
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Highlights bleed into their surroundings (halation on cheap paper). */
export function bloom(ctx: Ctx, w: number, h: number, strength = 0.35) {
  const k = 0.12;
  const sw = Math.max(1, Math.round(w * k));
  const sh = Math.max(1, Math.round(h * k));
  const small = document.createElement("canvas");
  small.width = sw;
  small.height = sh;
  const sctx = small.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(ctx.canvas, 0, 0, sw, sh);
  const img = sctx.getImageData(0, 0, sw, sh);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const keep = lum > 185 ? (lum - 185) / 70 : 0;
    d[i] *= keep;
    d[i + 1] *= keep;
    d[i + 2] *= keep;
  }
  sctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = strength;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, w, h);
  ctx.restore();
}

/** Coarse silver grain, stronger in the mid-tones like real fast film. */
export function heavyGrain(ctx: Ctx, w: number, h: number, amount = 26) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] + d[i + 1] + d[i + 2]) / 765;
    const n = (Math.random() - 0.5) * amount * (0.4 + 2.4 * lum * (1 - lum));
    d[i] = clamp(d[i] + n);
    d[i + 1] = clamp(d[i + 1] + n);
    d[i + 2] = clamp(d[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);
}
