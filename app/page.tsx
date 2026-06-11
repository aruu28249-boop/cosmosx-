import HeroScene from "../components/HeroScene";
import AmbientCosmos from "../components/AmbientCosmos";
import ConstellationTimeline from "../components/ConstellationTimeline";
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
          
          {/* Neon Pill CTA */}
          <a href="#simulator" className="flex items-center gap-3 px-10 py-4 rounded-full bg-[#1e1a4d]/60 border border-[#818cf8] text-white tracking-[0.2em] text-sm font-bold shadow-[0_0_20px_rgba(129,140,248,0.4)] hover:shadow-[0_0_40px_rgba(129,140,248,0.8)] hover:scale-105 hover:bg-[#1e1a4d]/80 transition-all duration-300 backdrop-blur-md cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            LAUNCH SIMULATOR
          </a>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section id="history" className="relative min-h-screen w-full py-20 z-10">
        <div className="text-center mb-20">
          <h2 className="font-heading text-4xl text-white/80 tracking-widest">HISTORY</h2>
        </div>
        <ConstellationTimeline />
      </section>

      {/* SCENARIO SIMULATOR SECTION */}
      <section id="simulator" className="relative min-h-screen w-full py-20 z-10 flex flex-col items-center justify-center">
        <div className="text-center mb-10 relative z-20">
          <h2 className="font-heading text-5xl text-white tracking-widest mb-4 drop-shadow-xl">SIMULATE</h2>
          <p className="text-white/60 max-w-lg mx-auto font-light tracking-wide">
            Animate cosmic events, planetary disappearance, and orbital disturbances in real-time.
          </p>
        </div>
        
        <div className="relative w-full max-w-6xl h-[70vh] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(18,28,68,0.8)] bg-[#050816] group">
          <HeroScene showPlanets={true} />
          
          {/* Glassy Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/90 via-transparent to-[#050816]/30 pointer-events-none" />
          
          {/* Glassy UI Elements */}
          <div className="absolute top-8 left-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <h3 className="font-heading tracking-widest text-lg mb-2">SYSTEM METRICS</h3>
            <div className="flex flex-col gap-2 text-xs font-mono text-white/50">
              <div className="flex justify-between gap-8"><span>SOLAR MASS:</span> <span className="text-white/90">1.0 M☉</span></div>
              <div className="flex justify-between gap-8"><span>LUMINOSITY:</span> <span className="text-white/90">3.828 × 10²⁶ W</span></div>
              <div className="flex justify-between gap-8"><span>STATUS:</span> <span className="text-emerald-400">STABLE</span></div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-6 z-20">
            <button className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 border border-white/20 text-white text-sm tracking-widest backdrop-blur-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              INITIATE SUPERNOVA
            </button>
            <button className="px-8 py-3 rounded-full bg-[#121C44]/40 hover:bg-[#121C44]/80 hover:scale-105 border border-indigo-400/30 text-indigo-100 text-sm tracking-widest backdrop-blur-2xl transition-all shadow-[0_0_20px_rgba(18,28,68,0.5)]">
              ORBITAL SHIFT
            </button>
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="relative py-10 text-center text-white/30 text-xs tracking-widest z-10">
        <p>COSMOSX INTERACTIVE EXPERIENCE © 2026</p>
      </footer>
    </main>
  );
}
