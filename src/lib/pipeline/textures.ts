// Procedural paper/concrete textures blended over each print at low opacity.
// Generated once per page load (four variants) instead of shipping image files.

const W = 600;
const H = 800;
const VARIANTS = 4;

let cache: HTMLCanvasElement[] | null = null;

function blotches(ctx: CanvasRenderingContext2D, cols: number, rows: number, spread: number, alpha: number) {
  const small = document.createElement("canvas");
  small.width = cols;
  small.height = rows;
  const sctx = small.getContext("2d")!;
  const img = sctx.createImageData(cols, rows);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + (Math.random() - 0.5) * spread;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  sctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, W, H);
  ctx.restore();
}

function makeTexture(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgb(150,150,150)";
  ctx.fillRect(0, 0, W, H);

  // Large, medium and small mottling, like a weathered wall.
  blotches(ctx, 4, 5, 90, 1);
  blotches(ctx, 15, 20, 70, 0.6);
  blotches(ctx, 60, 80, 60, 0.4);
  blotches(ctx, 200, 260, 50, 0.3);

  // Fine grain.
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 36;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  // A few hairline scratches and pits.
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)";
    ctx.lineWidth = Math.random() * 1.2 + 0.3;
    ctx.beginPath();
    let x = Math.random() * W;
    let y = Math.random() * H;
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (Math.random() - 0.5) * 120;
      y += (Math.random() - 0.5) * 120;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = `rgba(40,40,40,${Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

export function randomTexture(): HTMLCanvasElement {
  if (!cache) cache = Array.from({ length: VARIANTS }, makeTexture);
  return cache[Math.floor(Math.random() * cache.length)];
}

/** Blend a texture over a region. `blur` softens it for the whole-strip pass. */
export function applyTexture(
  ctx: CanvasRenderingContext2D,
  tex: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  alpha = 0.25,
  blur = false,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (blur) ctx.filter = "blur(4px)";
  ctx.drawImage(tex, x, y, w, h);
  ctx.restore();
}
