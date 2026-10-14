// Person cut-out for backdrops, using MediaPipe's selfie segmenter on-device.
// Nothing here loads until a backdrop other than "your room" is used: the
// runtime (~13MB wasm) and model (~250KB) are served from our own site.

import type { ImageSegmenter, ImageSegmenterResult } from "@mediapipe/tasks-vision";

let segmenter: Promise<ImageSegmenter> | null = null;

function load(): Promise<ImageSegmenter> {
  segmenter ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const base = `${import.meta.env.BASE_URL}mediapipe/`;
    const fileset = await FilesetResolver.forVisionTasks(`${base}wasm`);
    const options = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: `${base}selfie_segmenter.tflite`, delegate },
      runningMode: "IMAGE" as const,
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
    try {
      return await ImageSegmenter.createFromOptions(fileset, options("GPU"));
    } catch (e) {
      console.warn("GPU segmenter unavailable, using CPU", e);
      return ImageSegmenter.createFromOptions(fileset, options("CPU"));
    }
  })();
  segmenter.catch(() => (segmenter = null));
  return segmenter;
}

/** Start downloading the model early (e.g. when a backdrop is picked). */
export const preloadSegmenter = () => load().then(() => undefined);

// Masks are cached by image source so the strip and the single prints (and
// repeated previews of the same snapshot) only segment each photo once.
const cache = new Map<string, HTMLCanvasElement>();
const CACHE_MAX = 12;

/**
 * Alpha mask of the person in `img` (same aspect as the image): opaque where
 * the person is, transparent elsewhere, with a soft edge.
 */
export async function personMask(img: HTMLImageElement): Promise<HTMLCanvasElement> {
  const hit = cache.get(img.src);
  if (hit) return hit;

  const seg = await load();
  const mask = await new Promise<HTMLCanvasElement>((resolve, reject) => {
    try {
      seg.segment(img, (result: ImageSegmenterResult) => {
        const m = result.confidenceMasks?.[0];
        if (!m) return reject(new Error("No mask returned"));
        const w = m.width;
        const h = m.height;
        const conf = m.getAsFloat32Array();
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d")!;
        const out = ctx.createImageData(w, h);
        for (let i = 0; i < conf.length; i++) {
          // smoothstep(0.3, 0.7): crisp silhouette, slightly feathered edge
          const t = Math.min(1, Math.max(0, (conf[i] - 0.3) / 0.4));
          out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = 255;
          out.data[i * 4 + 3] = t * t * (3 - 2 * t) * 255;
        }
        ctx.putImageData(out, 0, 0);
        resolve(c);
      });
    } catch (e) {
      reject(e);
    }
  });

  cache.set(img.src, mask);
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!);
  return mask;
}
