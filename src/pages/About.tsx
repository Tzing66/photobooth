import InfoPage from "../components/InfoPage";

export default function About() {
  return (
    <InfoPage title="About">
      <div className="card space-y-4 p-5 text-sm leading-relaxed md:p-7 md:text-base">
        <p>
          A personal photobooth built in the spirit of the old coin-op booths: four poses, a short wait while the strip develops, and a slightly
          imperfect print you can't quite reproduce.
        </p>
        <p>
          Each strip goes through a little darkroom in your browser. Photos are cropped to 3:4, washed with a paper texture, given an uneven chemical
          burn at the edges, toned to either contrasty black & white or faded film colour, and dusted with specks. Spacing and placement shift a few
          pixels on every print, just like the real thing.
        </p>
        <p>Four booth themes (Retro ’70s, Sketchbook, Darkroom and Y2K Purikura) change the cabinet you're standing in, not the photos.</p>
        <p className="opacity-70">Inspired by mysketchbooth.com.</p>
      </div>
    </InfoPage>
  );
}
