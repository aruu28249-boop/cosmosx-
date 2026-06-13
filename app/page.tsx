
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

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="relative py-10 text-center text-white/25 text-xs tracking-widest z-10 border-t border-white/5">
        <p>COSMOSX INTERACTIVE EXPERIENCE © 2026</p>
      </footer>
    </main>
  );
}