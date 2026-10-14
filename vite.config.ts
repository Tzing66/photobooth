import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// `npm run dev:phone` serves over HTTPS on the LAN: phones only grant camera
// access (getUserMedia) to secure origins, and localhost isn't reachable from them.
//
// BASE_PATH is set by the GitHub Pages workflow (site lives at /<repo>/).
export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss(), ...(mode === "phone" ? [basicSsl()] : [])],
}));
