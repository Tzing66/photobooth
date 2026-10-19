import InfoPage from "../components/InfoPage";

const QA: [string, string][] = [
  [
    "How does it work?",
    "Step inside, pick a frame, then either take four photos with your camera (a 3-2-1 countdown before each shot) or upload four of your own. The booth develops them into a vintage strip in about five seconds.",
  ],
  [
    "Which filter should I pick?",
    "Vintage is a soft, faded print. Booth is tuned on real booth strips: crisp faces, flash-bright skin that keeps its detail, near-black hair and clothes, and fine grain. Sepia is the Booth print toned brown. The film stocks (Polaroid, Fuji instant, Ilford, Kodak Tri-X and more) are Pat David's free RawTherapee film simulations, CC BY-SA 4.0. Every filter gets grain, dust and an uneven edge burn, so each print is unique.",
  ],
  [
    "Can I use the back camera or a flash?",
    "Yes. On the shoot screen, tap the camera icon to switch between front and back, and the lightning bolt for flash. With the front camera the screen flashes white; with the back camera the phone's torch fires, if your browser allows it.",
  ],
  ["Are my photos uploaded anywhere?", "No. Everything happens in your browser. Photos and strips are stored only on this device (IndexedDB), and the gallery lives here too. Clear it any time from the gallery page."],
  ["How do I save my strip?", "On a phone, tap save and choose \"Save Image\" in the share sheet. It goes straight into Photos (browsers can't write to your photo library without that step). On a computer it downloads. Tap the scissors to cut the strip into four single prints, then tap any one to save it."],
  ["Can I share or print it?", "Share opens your phone's share sheet with a story-sized image. Print opens an A4 page with the strip centred and ready to go."],
  ["The camera won't start.", "Allow camera access when the browser asks. On a phone the page must be served over HTTPS. Run npm run dev:phone and open the https:// address it prints."],
  ["What do the themes change?", "Only the look of the booth. Frames, effects and the strips themselves are identical in every theme. Tap the theme button in the corner to cycle."],
];

export default function Faq() {
  return (
    <InfoPage title="FAQ">
      <div className="space-y-6">
        {QA.map(([q, a]) => (
          <div key={q} className="card p-4 md:p-5">
            <h2 className="mb-1 font-bold md:text-lg">{q}</h2>
            <p className="text-sm leading-relaxed opacity-85 md:text-base">{a}</p>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
