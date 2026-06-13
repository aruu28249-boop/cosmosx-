import Header from "@/components/Header";
import AmbientCosmos from "@/components/AmbientCosmos";
import ConstellationTimeline from "@/components/ConstellationTimeline";

export const metadata = {
  title: "CosmosX | Cosmic Timeline",
  description: "Humanity's historical space exploration journey through the stars.",
};

export default function TimelinePage() {
  return (
    <main className="relative min-h-screen bg-transparent">
      {/* Background stars */}
      <AmbientCosmos />
      
      {/* Navigation header */}
      <Header />

      {/* Main Content Area */}
      <div className="relative z-10 pt-32 pb-48">
        
        {/* Title Section */}
        <div className="text-center mb-16 px-4">
          <h1 className="font-heading text-5xl md:text-6xl text-white font-bold tracking-[0.2em] mb-4 uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Cosmic Timeline
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent mx-auto mb-6" />
          <p className="text-white/50 max-w-xl mx-auto text-sm tracking-widest leading-relaxed font-light">
            Journey through the milestones, discoveries, and breakthroughs that defined humanity&apos;s quest to understand the infinite universe.
          </p>
        </div>

        {/* Timeline Component */}
        <ConstellationTimeline />
      </div>
      
      {/* Footer */}
      <footer className="relative py-10 text-center text-white/25 text-xs tracking-widest z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <p>COSMOSX INTERACTIVE EXPERIENCE © 2026</p>
      </footer>
    </main>
  );
}
