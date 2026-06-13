import Header from "@/components/Header";
import MissionFlashcard, { Mission } from "@/components/MissionFlashcard";

const MISSIONS: Mission[] = [
  {
    id: "artemis-3",
    name: "Artemis III",
    date: "2026",
    agency: "NASA",
    destination: "Moon (Lunar South Pole)",
    description: "The first crewed lunar landing since Apollo 17 in 1972. It will deliver the first woman and first person of color to the Moon's surface to explore the permanently shadowed regions for water ice.",
    color: "#3b82f6" // blue-500
  },
  {
    id: "europa-clipper",
    name: "Europa Clipper",
    date: "2030 (Arrival)",
    agency: "NASA",
    destination: "Jupiter (Europa)",
    description: "A spacecraft designed to conduct detailed reconnaissance of Jupiter's moon Europa and investigate whether the icy moon could harbor conditions suitable for life in its subsurface ocean.",
    color: "#8b5cf6" // violet-500
  },
  {
    id: "mars-sample-return",
    name: "Mars Sample Return",
    date: "2033+",
    agency: "NASA / ESA",
    destination: "Mars",
    description: "A highly complex multi-spacecraft mission to collect rock and dust samples gathered by the Perseverance rover and bring them back to Earth for unprecedented laboratory analysis.",
    color: "#ef4444" // red-500
  },
  {
    id: "dragonfly",
    name: "Dragonfly",
    date: "2034 (Arrival)",
    agency: "NASA",
    destination: "Saturn (Titan)",
    description: "A rotorcraft lander that will fly to dozens of promising locations on Saturn's largest moon, Titan, to study its prebiotic chemistry and habitability.",
    color: "#10b981" // emerald-500
  },
  {
    id: "lunar-gateway",
    name: "Lunar Gateway",
    date: "2028+",
    agency: "International",
    destination: "Lunar Orbit",
    description: "A small space station in lunar orbit intended to serve as a solar-powered communication hub, science laboratory, and short-term habitation module for astronauts.",
    color: "#f59e0b" // amber-500
  },
  {
    id: "davinci",
    name: "DAVINCI",
    date: "2031",
    agency: "NASA",
    destination: "Venus",
    description: "Deep Atmosphere Venus Investigation of Noble gases, Chemistry, and Imaging. It will plunge through Venus's thick atmosphere to measure its composition and image its mountainous terrain.",
    color: "#f97316" // orange-500
  }
];

export default function MissionsPage() {
  return (
    <main className="relative min-h-screen bg-transparent pt-32 pb-24 px-6 md:px-12 z-10">
      <Header />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-6xl text-white tracking-widest font-bold mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            FUTURE MISSIONS
          </h1>
          <p className="text-white/60 text-sm md:text-base tracking-widest font-sans uppercase max-w-2xl mx-auto">
            Explore the next generation of spacecraft embarking on journeys to uncover the mysteries of our solar system and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MISSIONS.map((mission, index) => (
            <MissionFlashcard key={mission.id} mission={mission} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
