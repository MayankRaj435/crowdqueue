"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ShimmerButton, OutlineButton } from "@/components/ui/shimmer-button";
import { Meteors, AnimatedCounter } from "@/components/ui/animated-effects";
import { MovingBorder } from "@/components/ui/moving-border";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { AsciiArt } from "@/components/ui/ascii-art";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stats = [
  { value: 5, prefix: "2-", suffix: " hrs", decimals: 0, label: "Average daily wait time eliminated" },
  { value: 10, suffix: "K+", decimals: 0, label: "Tokens processed" },
  { value: 1, prefix: "< ", suffix: "s", decimals: 0, label: "Real-time update speed" },
  { value: 99.9, suffix: "%", decimals: 1, label: "Uptime reliability" },
];

const features = [
  {
    title: "No App Required",
    description: "Works in any mobile browser as a PWA. Citizens don't need to download anything.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
      </svg>
    ),
  },
  {
    title: "Real-Time Tracking",
    description: "Live position updates via WebSocket. Watch your token move in real-time with estimated wait.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
  {
    title: "Smart Notifications",
    description: "Get notified when you're 3 tokens away. Show up just in time, not hours early.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    title: "Geo Discovery",
    description: "Find all active queues near you on a map. Filter by hospitals, banks, government offices.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Staff Dashboard",
    description: "One-click token calling, serve, skip, and no-show marking. Real-time queue control.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    title: "Analytics",
    description: "Peak hour heatmaps, average service time trends, no-show rates, and satisfaction scores.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const userTypes = [
  {
    title: "For Citizens",
    description: "Join queues from your phone. Track your position live. Get notified when it's almost your turn. Rate your experience.",
    badge: "End User",
  },
  {
    title: "For Organizations",
    description: "Register your hospital, bank, or office. Create multiple queues. View analytics. Manage staff accounts.",
    badge: "Admin",
  },
  {
    title: "For Staff",
    description: "Call next token with one click. Mark served, skipped, or no-show. View live queue stats at your counter.",
    badge: "Operator",
  },
];

export default function LandingPage() {
  return (
    <div className="relative bg-black -mt-20">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <BackgroundBeams />
        <Meteors number={20} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open Source Queue Management
            </span>
          </motion.div>

          <TextGenerateEffect
            words="Skip the Line. Not the Service."
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9]"
            delay={200}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            A real-time virtual queue system for hospitals, government offices, and banks.
            Join remotely, track live, arrive on time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <ShimmerButton className="text-base px-10 py-4">
                Get Started Free
              </ShimmerButton>
            </Link>
            <Link href="/discover">
              <OutlineButton className="text-base px-10 py-4">
                Find Queues Near You
              </OutlineButton>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Features & Benefits
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Everything you need to eliminate physical queues and bring dignity to public service experiences.
            </p>
          </motion.div>

          <BentoGrid>
            {features.map((feature, i) => (
              <BentoGridItem
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                index={i}
                className={i === 0 ? "md:col-span-2" : i === 3 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* User Types */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Everyone
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Whether you&#39;re waiting in line or managing one, CrowdQueue has you covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userTypes.map((type, i) => (
              <SpotlightCard key={type.title} className="flex flex-col h-full w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-neutral-400 mb-4">
                    {type.badge}
                  </span>
                  <h3 className="text-xl font-semibold text-white mb-3">{type.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{type.description}</p>
                </motion.div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases (Expandable Cards) */}
      <section className="py-24 border-t border-white/[0.04] bg-black relative">
        <div className="absolute inset-0 bg-neutral-950/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Real-World Use Cases
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              See how different industries are using CrowdQueue to eliminate physical waiting lines.
            </p>
          </motion.div>

          <ExpandableCard />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="space-y-0">
            {[
              { step: "01", title: "Find a Queue", desc: "Open CrowdQueue and discover active queues near you." },
              { step: "02", title: "Join Remotely", desc: "One tap to join. Get your token number instantly." },
              { step: "03", title: "Go Do Your Thing", desc: "Leave. Shop. Rest. Track your position from anywhere." },
              { step: "04", title: "Get Notified", desc: "We'll ping you when you're 3 tokens away." },
              { step: "05", title: "Show Up & Get Served", desc: "Arrive just in time. Zero waiting." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 py-8 border-b border-white/[0.04] last:border-0"
              >
                <span className="font-display text-3xl font-bold text-white/10 shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-neutral-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer API (Ascii Art Demo) */}
      <section className="py-24 border-t border-white/[0.04] overflow-hidden bg-black relative">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
                Developer API
              </h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Build your own custom queue displays or integrate CrowdQueue into your existing kiosk hardware. Our REST API and WebSocket streams are fully documented and ready for scale.
              </p>
              <div className="font-mono text-xs sm:text-sm text-green-400 bg-neutral-950 p-4 rounded-xl border border-white/10 mb-6 overflow-x-auto shadow-2xl">
                $ curl -X GET https://api.crowdqueue.com/v1/queue/hq \ <br />
                &nbsp;&nbsp;-H &quot;Authorization: Bearer $API_KEY&quot;
              </div>
              <OutlineButton className="text-sm px-6 py-3">
                Read API Docs
              </OutlineButton>
            </motion.div>
          </div>
          
          <div className="flex-1 w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-neutral-950">
            <AsciiArt
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop"
              resolution={60}
              charset="matrix"
              color="#00ff00"
              animationStyle="matrix"
              animationDuration={3}
              animateOnView={true}
              className="w-full h-full"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-white/[0.04] relative overflow-hidden">
        <Meteors number={10} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to skip the line?
            </h2>
            <p className="text-neutral-400 mb-10 text-lg">
              Start using CrowdQueue today. No download required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <MovingBorder duration={4000} className="bg-black">
                <Link href="/register">
                  <ShimmerButton className="text-base px-10 py-4 w-full h-full">
                    Get Started Free
                  </ShimmerButton>
                </Link>
              </MovingBorder>
              <Link href="/org/register">
                <OutlineButton className="text-base px-10 py-4">
                  Register Your Organization
                </OutlineButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <span className="text-black font-black text-xs">Q</span>
            </div>
            <span className="text-sm text-neutral-500">CrowdQueue © 2026</span>
          </div>
          <p className="text-xs text-neutral-600">
            Skip the Line. Not the Service.
          </p>
        </div>
      </footer>
    </div>
  );
}
