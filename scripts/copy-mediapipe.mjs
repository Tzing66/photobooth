// Copies MediaPipe's WebAssembly runtime into public/ so the site serves it
// itself (no third-party CDN). Runs before dev and build; the output is
// gitignored because it's ~25MB and comes straight from node_modules.
import { cpSync, mkdirSync } from "node:fs";

const src = "node_modules/@mediapipe/tasks-vision/wasm";
const dest = "public/mediapipe/wasm";
mkdirSync(dest, { recursive: true });
// SIMD build + no-SIMD fallback; FilesetResolver picks one at runtime.
for (const f of ["vision_wasm_internal.js", "vision_wasm_internal.wasm", "vision_wasm_nosimd_internal.js", "vision_wasm_nosimd_internal.wasm"]) {
  cpSync(`${src}/${f}`, `${dest}/${f}`);
}
