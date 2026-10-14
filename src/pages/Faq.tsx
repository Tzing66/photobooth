import InfoPage from "../components/InfoPage";

const QA: [string, string][] = [
  [
    "How does it work?",
    "Step inside, pick a frame, then either take four photos with your camera (a 3-2-1 countdown before each shot) or upload four of your own. The booth develops them into a vintage strip in about five seconds.",
  ],
  ["Black & white or colour?", "Use the toggle under the screen before you shoot. B&W gives a punchy, high-contrast print; colour gives a faded film look. Both get grain, dust and an uneven edge burn so every print is unique."],
  [
    "What's the authentic setting?",
    "It imitates a real booth: a bare flash a foot from your face. Highlights blow out, shadows go inky, the corners fall off, whites glow, and the print gets softer and grainier. Normal keeps more detail.",
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
