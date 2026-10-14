// Placeholder "sitter" silhouettes for previews when there's no camera
// snapshot; they go through the real pipeline like any photo.

let placeholders: string[] | null = null;

function silhouette(pose: number): string {
  const w = 480;
  const h = 640;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#b9b3ab");
  bg.addColorStop(1, "#8d877f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Head tilt / position varies per pose like four different shots.
  const tilt = [-0.12, 0.08, 0, 0.18][pose];
  const dx = [-30, 25, 0, -10][pose];
  ctx.save();
  ctx.translate(w / 2 + dx, h * 0.62);
  ctx.rotate(tilt);
  ctx.fillStyle = "#55504a";
  ctx.beginPath(); // shoulders
  ctx.ellipse(0, 210, 210, 170, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-60, -30, 120, 90); // neck
  ctx.beginPath(); // head
  ctx.ellipse(0, -110, 92, 115, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return c.toDataURL("image/jpeg", 0.9);
}

/** Four placeholder portraits (used when no camera snapshot is available). */
export function placeholderPortraits(): string[] {
  placeholders ??= [0, 1, 2, 3].map(silhouette);
  return placeholders;
}
