# Photobooth

**Use it here: https://tzing66.github.io/photobooth/**

A personal, browser-only vintage photobooth. You take four photos with a phone or laptop camera, or upload four, and get back a developed photostrip. Everything runs client-side, so no photo ever leaves your device.

Inspired by [mysketchbooth.com](https://mysketchbooth.com).

## Run it

```bash
npm install
npm run dev          # http://localhost:5173 (laptop camera)
npm run dev:phone    # https://<your-LAN-ip>:5173, for using your phone's camera
```

Phones only allow camera access on HTTPS, so `dev:phone` serves a self-signed certificate. Open the `Network:` URL on your phone, accept the certificate warning once, and allow the camera.

## Deploy

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml` (repo Settings → Pages → Source: **GitHub Actions**). The site is served at `https://<user>.github.io/<repo>/`. The workflow sets `BASE_PATH=/<repo>/` and copies `index.html` to `404.html` so deep links and refreshes work.

Elsewhere, `npm run build` writes a static site to `dist/`. Any static host works (Netlify, Vercel, Cloudflare Pages) as long as it serves HTTPS and rewrites unknown paths to `index.html`.

## Flow

| Route | What happens |
|---|---|
| `/` | Outside the booth. The board shows 5 random strips from your gallery. **enter** clears the last session. |
| `/setup` | Pick frame, backdrop, b&w/colour and normal/authentic against a big preview rendered by the real pipeline. The preview uses sample portraits until you opt in: "try it on me" (3-2-1 camera snapshot) or "use a photo". Then take photos or upload. |
| `/takePicture` | Front camera. Each of 4 shots gets a 3-2-1 countdown and a flash, with 2s between shots. |
| `/upload` | 2×2 slots, file picker (≤25MB), crop locked to 3:4 |
| `/printStrip` | "Delivered in 5 seconds" while the strip develops in the background, then it slides out of the slot |
| `/pickup` | save (on phones: share sheet → Save Image → Photos) · share (1080×1920 story image) · print (A4) · restart · ✂ cut into 4 single prints |
| `/features` | Your gallery of every strip made in this browser |

The set-up screen has two toggles: **b&w ↔ colour** (B&W is the default) and **normal ↔ authentic**. Authentic is tuned on real booth strips: it stretches the tonal range, sharpens edges above a noise threshold (so webcam noise isn't amplified), boosts local contrast, then applies a punchy curve, fine grain and a slightly warm silver tone.

With authentic on, you can also pick a **film**. "Booth (original)" is the tuned curve above. The others are real film and instant stocks (Polaroid 667/665, Fuji FP-3000B and FP-100C, Ilford HP5, Kodak Tri-X, Rollei Ortho and Retro 80s), applied as lookup tables with the same sharpening and grain. **Flash look** uses the person cut-out to darken the room behind you, the way a booth flash a foot from your face does.

On the shoot screen you can switch between the front and back cameras (when the device has both) and turn on a flash. The front camera's flash turns the whole screen white; the back camera uses its torch, where the browser allows it.

The film lookup tables in `public/luts/` are from Pat David's [RawTherapee Film Simulation collection](https://patdavid.net/2015/03/film-emulation-in-rawtherapee/), under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (resampled to 64-step cubes; see `public/luts/CREDITS.txt`).

## Code map

- `src/lib/pipeline/`: the darkroom
  - `strip.ts`: layout with randomised spacing and nudges, plus single prints
  - `effects.ts`: flash glow, edge burn, B&W and film-colour toning, the authentic booth print, dust
  - `lut.ts`: loads HaldCLUT film stocks and applies them with trilinear lookup
  - `textures.ts`: procedural paper/concrete grain
  - `overlays.ts`: stars, hearts, doodle and heart-cutout frames, drawn in code
  - `samples.ts`: frame previews
- `src/lib/frames.ts`: frame catalogue (colours, captions) and the localStorage settings
- `src/lib/camera.ts`: front/back camera choice and the back camera's torch
- `src/lib/storage.ts`: IndexedDB for the session photos, strip, singles and gallery
- `src/themes/`: each theme is a `ThemeKit` (see `types.ts`) of decor components only. Pages hold all behaviour, so a new theme is just a new file in `registry.ts`.
- `src/pages/`: one component per route

## Adding a frame

Add an entry to `FRAMES` in `src/lib/frames.ts`. Give it a `caption` for text above each photo, or set `overlay: true` and add a drawing function to `OVERLAYS` in `src/lib/pipeline/overlays.ts`.
