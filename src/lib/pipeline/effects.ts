// Per-photo darkroom effects. Each mutates a 2D context in place.

import { applyLut, type Lut } from "./lut";

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

// --- "authentic" booth print ------------------------------------------------
// Modelled on real booth strips: crisp faces, flash-bright skin that keeps its
// detail, near-black hair and clothes, a lit curtain behind, fine grain and a
// neutral-to-warm tone. Webcam frames arrive soft, flat and noisy, so this has
// to *create* the punch: stretch the range, lift local contrast, sharpen fine
// edges, then a strong but smooth curve.

/** Separable box blur on one channel; three passes approximate a gaussian. */
function blurChannel(src: Float32Array, w: number, h: number, r: number): Float32Array {
  if (r < 1) return src.slice();
  let a = src.slice();
  let b = new Float32Array(src.length);
  const norm = 1 / (2 * r + 1);
  for (let pass = 0; pass < 3; pass++) {
    // horizontal: a -> b
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let acc = a[row] * (r + 1);
      for (let x = 1; x <= r; x++) acc += a[row + Math.min(x, w - 1)];
      for (let x = 0; x < w; x++) {
        b[row + x] = acc * norm;
        acc += a[row + Math.min(x + r + 1, w - 1)] - a[row + Math.max(x - r, 0)];
      }
    }
    // vertical: b -> a
    for (let x = 0; x < w; x++) {
      let acc = b[x] * (r + 1);
      for (let y = 1; y <= r; y++) acc += b[Math.min(y, h - 1) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc * norm;
        acc += b[Math.min(y + r + 1, h - 1) * w + x] - b[Math.max(y - r, 0) * w + x];
      }
    }
  }
  return a;
}

/** 3×3 gaussian ([1,2,1] separable): the finest possible blur, ~0.85px sigma. */
function gauss3(src: Float32Array, w: number, h: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const l = src[row + (x > 0 ? x - 1 : x)];
      const r = src[row + (x < w - 1 ? x + 1 : x)];
      tmp[row + x] = (l + 2 * src[row + x] + r) * 0.25;
    }
  }
  for (let y = 0; y < h; y++) {
    const up = (y > 0 ? y - 1 : y) * w;
    const dn = (y < h - 1 ? y + 1 : y) * w;
    for (let x = 0; x < w; x++) out[y * w + x] = (tmp[up + x] + 2 * tmp[y * w + x] + tmp[dn + x]) * 0.25;
  }
  return out;
}

/** Soft coring: differences smaller than `t` (sensor noise) contribute nothing. */
const core = (d: number, t: number) => (d > t ? d - t : d < -t ? d + t : 0);

/** Value below which `p` of the samples fall (0..1 inputs). */
function percentile(lum: Float32Array, p: number) {
  const hist = new Uint32Array(1024);
  for (let i = 0; i < lum.length; i++) hist[Math.min(1023, Math.max(0, Math.round(lum[i] * 1023)))]++;
  const target = lum.length * p;
  let acc = 0;
  for (let i = 0; i < 1024; i++) {
    acc += hist[i];
    if (acc >= target) return i / 1023;
  }
  return 1;
}

/** Strong S-curve: crushed toe, smooth shoulder, bright skin. */
function boothCurve(x: number) {
  const v = Math.min(1, Math.max(0, x)) ** 0.9; // flash: a gentle lift in the mids (skin)
  const k = 1.6;
  const s = v < 0.5 ? 0.5 * (2 * v) ** k : 1 - 0.5 * (2 * (1 - v)) ** k;
  return s;
}

/**
 * Develops the photo in place into a booth print. Black & white uses a
 * near-neutral channel mix with a slight red lean, so every skin tone keeps
 * its detail;
 * colour keeps the hues and applies the same tonal work to luminance.
 *
 * With a film `lut`, the stock does the tone and colour instead of our curve:
 * the range is stretched on RGB, the photo goes through the LUT, then gets
 * the same sharpening, local contrast and grain.
 */
export function boothPrint(ctx: Ctx, w: number, h: number, color: boolean, lut?: Lut) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const n = w * h;
  const lum = new Float32Array(n);
  const readLum = (mono: boolean) => {
    for (let i = 0; i < n; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      lum[i] = (mono ? (r + g + b) / 3 : color ? 0.299 * r + 0.587 * g + 0.114 * b : 0.36 * r + 0.52 * g + 0.12 * b) / 255;
    }
  };
  readLum(false);

  // 1. Full range: black point and white point from the image itself.
  const lo = percentile(lum, 0.006);
  const hi = Math.max(lo + 0.05, percentile(lum, 0.996));
  if (lut) {
    // Webcams expose flat; give the stock a full-range negative to print from.
    const k = 1 / (hi - lo);
    for (let p = 0; p < d.length; p += 4) {
      d[p] = (d[p] - lo * 255) * k;
      d[p + 1] = (d[p + 1] - lo * 255) * k;
      d[p + 2] = (d[p + 2] - lo * 255) * k;
    }
    applyLut(d, lut);
    readLum(!color); // B&W stocks print neutral grey
  }
  const orig = color ? lum.slice() : lum;
  if (!lut) for (let i = 0; i < n; i++) lum[i] = (lum[i] - lo) / (hi - lo);

  // 2. Sharpening that never removes detail: two unsharp masks, a fine one
  // (~1px) for brows, lashes and hair strands and a wider one (~3px) for edge
  // bite. Coring stops sensor noise being amplified; below the threshold a
  // pixel is left exactly as it was (smoothing it is what smeared eyebrows).
  const fine = gauss3(lum, w, h);
  const mid = blurChannel(lum, w, h, Math.max(1, Math.round(w / 360)));
  for (let i = 0; i < n; i++) lum[i] += core(lum[i] - fine[i], 0.006) * 1.15 + core(lum[i] - mid[i], 0.01) * 0.5;

  // 3. Gentle local contrast at a small radius, so faces pop without halos.
  const big = blurChannel(lum, w, h, Math.max(2, Math.round(w * 0.02)));
  for (let i = 0; i < n; i++) lum[i] += (lum[i] - big[i]) * 0.25;

  // 4. Tone curve, 5. fine grain, gentle corner falloff.
  const cx = w / 2;
  const cy = h * 0.45;
  const maxD = Math.hypot(w / 2, h * 0.55);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const t = Math.hypot(x - cx, y - cy) / maxD;
      let v = (lut ? lum[i] : boothCurve(lum[i])) * (1 - 0.16 * t * t * t);
      v += (Math.random() - 0.5) * 0.024 * (0.35 + 2 * v * (1 - v));
      v = Math.min(1, Math.max(0, v));
      const p = i * 4;
      if (color) {
        // Same tonal change, applied additively so hues survive; slightly muted.
        const delta = (v - orig[i]) * 255;
        const r = d[p] + delta, g = d[p + 1] + delta, b = d[p + 2] + delta;
        if (lut) {
          // the stock already has its own colour
          d[p] = clamp(r);
          d[p + 1] = clamp(g);
          d[p + 2] = clamp(b);
          continue;
        }
        const m = (r + g + b) / 3;
        d[p] = clamp(m + (r - m) * 0.9 + 4);
        d[p + 1] = clamp(m + (g - m) * 0.9 + 1);
        d[p + 2] = clamp(m + (b - m) * 0.9 - 3);
      } else {
        // Silver print: neutral highlights, a touch of warmth in the shadows.
        const val = v * 255;
        const warm = lut ? 0 : (1 - v) * 6;
        d[p] = clamp(val + warm * 0.6);
        d[p + 1] = clamp(val + warm * 0.2);
        d[p + 2] = clamp(val - warm * 0.5);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}
