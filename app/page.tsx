
import Link from "next/link";
import AmbientCosmos from "../components/AmbientCosmos";
import Header from "../components/Header";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-transparent">
      <AmbientCosmos />
      <Header />
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden z-10">
        
        {/* Background Video with Smooth Fade Out Mask */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/hero_bg.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,3,10,0.85)_100%)] pointer-events-none z-10" />

        <div className="relative z-20 text-center flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 mt-12">
          
          {/* Main Epic Title */}
          <h1 className="font-heading text-6xl md:text-[8rem] font-bold tracking-[0.25em] text-white mb-8 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] ml-[0.1em]">
            COSMOSX
          </h1>
          
          {/* Subheadings with Dividers */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white/70 tracking-[0.2em] text-sm font-sans font-medium uppercase mb-16">
            <span>Explore the Past.</span>
            <span className="hidden md:block w-px h-4 bg-white/30"></span>
            <span>Visualize the Present.</span>
            <span className="hidden md:block w-px h-4 bg-white/30"></span>
            <span>Simulate the Future.</span>
          </div>
          
        </div>
      </section>

      {/* TIMELINE TEASER SECTION */}
      <section id="history" className="relative w-full py-32 z-10 border-t border-white/5 overflow-hidden">
        {/* Ambient radial glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Copy & Call to Action */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 mb-3 font-semibold">
              Chronicle of the Cosmos
            </span>
            <h2 className="font-heading text-4xl md:text-5xl text-white font-bold tracking-wider mb-6 leading-tight">
              JOURNEY THROUGH SPACE TIME
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8 font-light tracking-wide">
              Embark on an interactive odyssey tracing humanity&apos;s key milestones in space exploration. 
              From the historic aluminum beep of Sputnik 1 to the deep-field infrared gaze of the James Webb Space Telescope and ISRO&apos;s groundbreaking landing on the lunar south pole.
            </p>
            <Link 
              href="/timeline"
              className="group relative inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 text-white font-semibold px-6 py-3.5 rounded-xl text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_35px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Interactive Timeline
              <svg 
                className="w-4 h-4 text-white/70 group-hover:text-indigo-300 group-hover:translate-x-1.5 transition-all duration-300"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Right Column: Visual Teaser Mockup/Interactive Cards */}
          <div className="lg:col-span-7 relative flex justify-center items-center">
            {/* Visual background constellation grid */}
            <div className="absolute inset-0 border border-white/5 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_70%)] pointer-events-none" />
            
            {/* Mini floating preview cards representing steps on the timeline */}
            <div className="relative w-full max-w-lg p-6 md:p-8 flex flex-col gap-5">
              
              {/* Card 1: Sputnik */}
              <div className="translate-x-[-10px] md:translate-x-[-30px] flex gap-4 items-center p-4 rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-md opacity-40 hover:opacity-60 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/80">
                  1957
                </div>
                <div>
                  <h4 className="text-white text-xs tracking-wider uppercase font-semibold">Sputnik 1</h4>
                  <p className="text-white/40 text-[10px] tracking-wide mt-0.5">The first artificial Earth satellite</p>
                </div>
              </div>

              {/* Card 2: Apollo 11 (High impact active highlighted card) */}
              <div className="relative z-10 translate-x-[10px] md:translate-x-[20px] scale-[1.03] flex gap-4 items-center p-5 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.04] backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.08)]">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-mono text-sm text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  1969
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white text-sm tracking-wider uppercase font-bold">Apollo 11</h4>
                    <span className="text-[8px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded px-1.5 py-0.5 uppercase tracking-widest font-mono">
                      NASA
                    </span>
                  </div>
                  <p className="text-white/70 text-xs tracking-wide mt-1">First humans on the Moon.</p>
                </div>
                {/* Ping animation dot */}
                <div className="absolute top-4 right-4 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </div>
              </div>

              {/* Card 3: Chandrayaan-3 */}
              <div className="translate-x-[-5px] md:translate-x-[-15px] flex gap-4 items-center p-4 rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-md opacity-60 hover:opacity-85 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/80">
                  2023
                </div>
                <div>
                  <h4 className="text-white text-xs tracking-wider uppercase font-semibold">Chandrayaan-3</h4>
                  <p className="text-white/40 text-[10px] tracking-wide mt-0.5">First to land on the lunar south pole</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="relative py-10 text-center text-white/25 text-xs tracking-widest z-10 border-t border-white/5">
        <p>COSMOSX INTERACTIVE EXPERIENCE © 2026</p>
      </footer>
    </main>
  );
}