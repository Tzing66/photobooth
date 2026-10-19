// Film-stock colour lookup tables (HaldCLUT PNGs) applied on the canvas.
//
// A HaldCLUT of level L stores an N×N×N colour cube (N = L²) as an L³×L³
// image: the entry for (r, g, b) sits at pixel index r + g·N + b·N². We read
// it once into a float array and look colours up with trilinear interpolation.

export interface Lut {
  size: number;
  /** RGB triples, 0..255, indexed r + g·N + b·N². */
  data: Float32Array;
}

const cache = new Map<string, Promise<Lut>>();

export function loadLut(url: string): Promise<Lut> {
  let hit = cache.get(url);
  if (!hit) {
    hit = new Promise<Lut>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const side = img.width;
        const level = Math.round(Math.cbrt(side));
        if (level ** 3 !== side || img.height !== side) return reject(new Error(`Not a HaldCLUT: ${url}`));
        const c = document.createElement("canvas");
        c.width = c.height = side;
        const ctx = c.getContext("2d", { willReadFrequently: true, colorSpace: "srgb" })!;
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, side, side).data;
        const data = new Float32Array(side * side * 3);
        for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
          data[j] = px[i];
          data[j + 1] = px[i + 1];
          data[j + 2] = px[i + 2];
        }
        resolve({ size: level * level, data });
      };
      img.onerror = () => reject(new Error(`Failed to load LUT ${url}`));
      img.src = url;
    });
    hit.catch(() => cache.delete(url));
    cache.set(url, hit);
  }
  return hit;
}

/** Maps every pixel of `d` (RGBA bytes) through the cube, blended by `amount`. */
export function applyLut(d: Uint8ClampedArray, lut: Lut, amount = 1) {
  const { size: n, data } = lut;
  const k = (n - 1) / 255;
  const n2 = n * n;
  for (let p = 0; p < d.length; p += 4) {
    const fr = d[p] * k, fg = d[p + 1] * k, fb = d[p + 2] * k;
    const r0 = Math.min(n - 2, fr | 0), g0 = Math.min(n - 2, fg | 0), b0 = Math.min(n - 2, fb | 0);
    const tr = fr - r0, tg = fg - g0, tb = fb - b0;
    const i000 = (r0 + g0 * n + b0 * n2) * 3;
    const i100 = i000 + 3, i010 = i000 + n * 3, i110 = i010 + 3;
    const i001 = i000 + n2 * 3, i101 = i001 + 3, i011 = i001 + n * 3, i111 = i011 + 3;
    for (let c = 0; c < 3; c++) {
      const x00 = data[i000 + c] + (data[i100 + c] - data[i000 + c]) * tr;
      const x10 = data[i010 + c] + (data[i110 + c] - data[i010 + c]) * tr;
      const x01 = data[i001 + c] + (data[i101 + c] - data[i001 + c]) * tr;
      const x11 = data[i011 + c] + (data[i111 + c] - data[i011 + c]) * tr;
      const y0 = x00 + (x10 - x00) * tg;
      const y1 = x01 + (x11 - x01) * tg;
      const v = y0 + (y1 - y0) * tb;
      d[p + c] = amount === 1 ? v : d[p + c] + (v - d[p + c]) * amount;
    }
  }
}
