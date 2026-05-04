import { GlareCard } from "@/components/ui/glare-card";

export default function GlareCardDemo() {
  return (
    <GlareCard className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-900 to-black">
      <div className="w-14 h-14 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
      </div>
      <p className="text-white font-display font-bold text-3xl tracking-wide mb-1">Pro Org</p>
      <p className="text-emerald-400 font-semibold mb-4 border-b border-white/10 pb-4 w-full">$29 / month</p>
      
      <ul className="text-neutral-300 text-sm space-y-3 text-left w-full px-2">
        <li className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span> Unlimited queues
        </li>
        <li className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span> Advanced analytics
        </li>
        <li className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span> Role-based staff accounts
        </li>
      </ul>

      <div className="mt-auto pt-4 w-full z-20">
        <button className="block w-full py-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors text-sm font-bold z-20 relative pointer-events-auto">
          Upgrade to Pro
        </button>
      </div>
    </GlareCard>
  );
}
