export default function ScenarioSimulator() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 p-8 flex flex-col justify-between">
      
      {/* Metrics Panel */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl w-72 shadow-[0_4px_30px_rgba(0,0,0,0.1)] pointer-events-auto">
        <h3 className="font-heading text-lg tracking-[0.2em] mb-6 text-white/80">SYSTEM METRICS</h3>
        
        <div className="flex flex-col gap-4 font-sans text-xs tracking-wider text-white/60">
          <div className="flex justify-between items-center">
            <span>SOLAR MASS:</span>
            <span className="text-white/90">1.0 M☉</span>
          </div>
          <div className="flex justify-between items-center">
            <span>LUMINOSITY:</span>
            <span className="text-white/90">3.828 × 10²⁶ W</span>
          </div>
          <div className="flex justify-between items-center">
            <span>STATUS:</span>
            <span className="text-[#a1e5e0]">STABLE</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6 pointer-events-auto mb-4">
        <button className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-xs tracking-widest text-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          INITIATE SUPERNOVA
        </button>
        <button className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-xs tracking-widest text-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          ORBITAL SHIFT
        </button>
      </div>

    </div>
  );
}