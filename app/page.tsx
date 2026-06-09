import HeroScene from "../components/HeroScene";
import AmbientCosmos from "../components/AmbientCosmos";
import ConstellationTimeline from "../components/ConstellationTimeline";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-transparent">
      <AmbientCosmos />
      
      {/* HERO SECTION */}
      <section 
        className="relative h-screen w-full flex items-center justify-center overflow-hidden z-10"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
      >
        <HeroScene showPlanets={false} />
        
        <div className="relative z-10 text-center flex flex-col items-center justify-center pointer-events-none mt-20">
          <h1 className="font-heading text-7xl md:text-9xl font-bold tracking-[0.2em] text-white/90 mb-12 drop-shadow-2xl">
            COSMOSX
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-6 text-white/80 tracking-widest text-sm md:text-base font-light mt-8">
            <div className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
              Explore the Past.
            </div>
            <div className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
              Visualize the Present.
            </div>
            <div className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
              Simulate the Future.
            </div>
          </div>
          
          <div className="mt-32 animate-bounce text-white/50">
            ↓
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="relative min-h-screen w-full py-20 z-10">
        <div className="text-center mb-20">
          <h2 className="font-heading text-4xl text-white/80 tracking-widest">HISTORY</h2>
        </div>
        <ConstellationTimeline />
      </section>

      {/* SCENARIO SIMULATOR SECTION */}
      <section className="relative min-h-screen w-full py-20 z-10 flex flex-col items-center justify-center">
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
