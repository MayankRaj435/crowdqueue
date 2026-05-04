import TextFlippingBoardDemo from "@/components/text-flipping-board-demo";
import GlareCardDemo from "@/components/glare-card-demo";
import TextRevealCardPreview from "@/components/text-reveal-card-demo";

export default function UiTestPage() {
  return (
    <div className="min-h-screen bg-black text-white py-20 px-8 flex flex-col gap-24 items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">UI Components Showcase</h1>
        <p className="text-neutral-400">Testing the newly added Aceternity components</p>
      </div>

      <div className="w-full max-w-4xl border border-white/10 rounded-2xl p-8 bg-neutral-900/50 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">1. Text Flipping Board</h2>
        <TextFlippingBoardDemo />
      </div>

      <div className="w-full max-w-4xl border border-white/10 rounded-2xl p-8 bg-neutral-900/50 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">2. Glare Card</h2>
        <div className="py-10">
          <GlareCardDemo />
        </div>
      </div>

      <div className="w-full max-w-4xl border border-white/10 rounded-2xl p-8 bg-neutral-900/50 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center">3. Text Reveal Card</h2>
        <TextRevealCardPreview />
      </div>
    </div>
  );
}
