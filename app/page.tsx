import SolarSystem from "@/components/SolarSystem";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import SpaceTimeline from "@/components/SpaceTimeline";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="bg-black text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-wide">CosmosX</span>
        <div className="flex gap-8 text-sm text-white/70">
          <a href="#solar-system" className="hover:text-white transition">Solar System</a>
          <a href="#timeline" className="hover:text-white transition">Timeline</a>
          <a href="#simulator" className="hover:text-white transition">AI Simulator</a>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Solar System */}
      <section id="solar-system" className="min-h-screen">
        <SolarSystem triggerEffect={() => {}} />
      </section>

      {/* Timeline */}
      <section id="timeline" className="min-h-screen">
        <SpaceTimeline />
      </section>

      {/* AI Simulator */}
      <section id="simulator" className="min-h-screen">
        <ScenarioSimulator onScenarioSelect={() => {}} />
      </section>

    </main>
  );
}
