import Link from "next/link";
import HeroScene from "../components/HeroScene";
import AmbientCosmos from "../components/AmbientCosmos";
import ConstellationTimeline from "../components/ConstellationTimeline";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-transparent">
      <AmbientCosmos />

      {/* ── HERO SECTION ───────────────────────────────────────────────── */}
      <section
        className="relative h-screen w-full flex items-center justify-center overflow-hidden z-10"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          maskImage:        'linear-gradient(to bottom, black 60%, transparent 100%)',
        }}
      >
        <HeroScene showPlanets={false} />

        <div className="relative z-10 text-center flex flex-col items-center justify-center pointer-events-none mt-20">
          <h1 className="font-heading text-7xl md:text-9xl font-bold tracking-[0.2em] text-white/90 mb-12 drop-shadow-2xl">
            COSMOSX
          </h1>

          <div className="flex flex-col sm:flex-row gap-6 text-white/80 tracking-widest text-sm md:text-base font-light mt-8">
            {['Explore the Past.', 'Visualize the Present.', 'Simulate the Future.'].map(label => (
              <div
                key={label}
                className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
              >
                {label}
              </div>
            ))}
          </div>

          {/* ── LAUNCH SIMULATOR — navigates to /simulate ── */}
          <div className="mt-16 pointer-events-auto">
            <Link
              href="/simulate"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full
                bg-gradient-to-r from-indigo-500/30 to-violet-500/30
                border border-indigo-400/40 hover:border-indigo-300/70
                text-white tracking-[0.2em] text-sm font-light
                backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.3)]
                hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]
                hover:scale-105 transition-all duration-500"
            >
              <span>LAUNCH SIMULATOR</span>
              <span className="text-lg">🚀</span>
            </Link>
          </div>

          <div className="mt-16 animate-bounce text-white/40 text-xl">↓</div>
        </div>
      </section>

      {/* ── HISTORY SECTION ────────────────────────────────────────────── */}
      <section className="relative min-h-screen w-full py-20 z-10">
        <div className="text-center mb-20">
          <h2 className="font-heading text-4xl text-white/80 tracking-widest">HISTORY</h2>
          <p className="text-white/40 mt-3 text-sm tracking-widest font-light">
            Milestones that shaped our understanding of the cosmos
          </p>
        </div>
        <ConstellationTimeline />

      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="relative py-10 text-center text-white/25 text-xs tracking-widest z-10 border-t border-white/5">
        <p>COSMOSX INTERACTIVE EXPERIENCE © 2026</p>
      </footer>
    </main>
  );
}