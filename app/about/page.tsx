"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import StarfieldBackground from "@/components/StarfieldBackground";

// Placeholder MissionStatement component
const MissionStatement = () => (
  <section className="py-12 text-center">
    <h2 className="text-3xl font-heading text-white mb-4">Our Mission</h2>
    <p className="max-w-2xl mx-auto text-white/70">
      To explore the cosmos and share the wonder of space with everyone.
    </p>
  </section>
);

// Placeholder CometCursor component (currently no visual effect)
const CometCursor = () => null;
import {
  Cpu,
  Users,
  Send,
  Terminal,
  Compass,
  Database,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Radio,
  Layers
} from "lucide-react";

// Crew Data
const CREW = [
  {
    id: "jhalak",
    name: "Jhalak Mittal",
    role: "Led the 3D Solar System & Planet Animations",
    bio: "Passionate about bringing cosmic bodies to life with stunning visuals and realistic physics.",
    hobbies: "3D modeling, astrophotography, sci-fi novels",
    avatarColor: "from-indigo-500/20 to-purple-500/30 border-indigo-500/40",
    glowColor: "rgba(99, 102, 241, 0.4)",
    tag: "VISUAL-01"
  },
  {
    id: "reshmi",
    name: "Reshmi Yadav",
    role: "Built the Space Timeline & UI/UX Design",
    bio: "Designing intuitive journeys through time and space, blending aesthetic elegance with seamless interaction.",
    hobbies: "Sketching, user testing, stargazing",
    avatarColor: "from-pink-500/20 to-rose-500/30 border-pink-500/40",
    glowColor: "rgba(236, 72, 153, 0.4)",
    tag: "DESIGN-02"
  },
  {
    id: "somya",
    name: "Somya Maheshwari",
    role: "Crafted the Landing Page & Visual Experience",
    bio: "Creating immersive first impressions that draw visitors into the cosmos with vibrant visuals and storytelling.",
    hobbies: "Graphic design, motion graphics, astronomy podcasts",
    avatarColor: "from-emerald-500/20 to-teal-500/30 border-emerald-500/40",
    glowColor: "rgba(16, 185, 129, 0.4)",
    tag: "VISUAL-03"
  },
  {
    id: "aryan",
    name: "Aryan Singhal",
    role: "Handled Integration, Deployment & Backend Architecture",
    bio: "Ensuring robust, scalable infrastructure that powers the CosmosX experience across the web.",
    hobbies: "DevOps, cloud orchestration, quantum computing articles",
    avatarColor: "from-cyan-500/20 to-blue-500/30 border-cyan-500/40",
    glowColor: "rgba(6, 182, 212, 0.4)",
    tag: "ENG-04"
  },
  {
    id: "dushyant",
    name: "Dushyant Sharma",
    role: "Research, Content Strategy & Space Data Curation",
    bio: "Curating accurate space data and crafting compelling narratives that educate and inspire.",
    hobbies: "Reading scientific journals, data visualization, hiking under the stars",
    avatarColor: "from-yellow-500/20 to-amber-500/30 border-yellow-500/40",
    glowColor: "rgba(234, 179, 8, 0.4)",
    tag: "DATA-05"
  }
];

// Quiz Data
const QUIZ_QUESTIONS = [
  {
    question: "Select your primary focus when gazing into the cosmic void:",
    options: [
      { text: "Deciphering quantum mechanics & spacetime formulas", value: "tech" },
      { text: "Mapping uncharted planetary clusters & gravitational lanes", value: "cartography" },
      { text: "Detecting organic compounds & habitable conditions", value: "bio" }
    ]
  },
  {
    question: "Choose your primary tool of the trade:",
    options: [
      { text: "A high-performance quantum simulation terminal", value: "tech" },
      { text: "An array of long-range electromagnetic receivers", value: "cartography" },
      { text: "A hermetic biosphere containment vessel", value: "bio" }
    ]
  },
  {
    question: "How do you respond to an unexpected hyperspatial grav-anomaly?",
    options: [
      { text: "Calculate warp field compensation & redirect reactor core", value: "tech" },
      { text: "Chart the anomaly's radius & use it for slingshot acceleration", value: "cartography" },
      { text: "Monitor biological cargo logs for micro-gravitational distress", value: "bio" }
    ]
  }
];

const QUIZ_RESULTS = {
  tech: {
    title: "Quantum Propulsion Engineer",
    desc: "You thrive in the mechanics of space-time. Your mind is attuned to warp fields, magnetic confinement of plasma, and keeping the ship intact through singularity event horizons.",
    badge: "ENG-TECH"
  },
  cartography: {
    title: "Deep Space Cartographer",
    desc: "You are the eyes of the crew. You map the gravitational pathways and plot courses through uncharted nebulae. Without you, we are blind in the endless dark.",
    badge: "NAV-CART"
  },
  bio: {
    title: "Astrobiological Officer",
    desc: "You protect the spark of life. You analyze strange soil samples, test for biosignatures in icy oceans, and design the closed-loop biospheres that keep us breathing.",
    badge: "LIFE-BIO"
  }
};

export default function AboutPage() {
  // Tabs State
  const [activeTab, setActiveTab] = useState<"vision" | "tech" | "hubs">("vision");

  // Crew State
  const [selectedCrew, setSelectedCrew] = useState<typeof CREW[0] | null>(null);

  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<keyof typeof QUIZ_RESULTS | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", channel: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "transmitting" | "securely_dispatched">("idle");
  const [progress, setProgress] = useState(0);

  // Stats State
  const [stats, setStats] = useState({
    simulations: 142084,
    starSystems: 82,
    crewCount: 45
  });


  // Run Quiz
  const handleQuizAnswer = (value: string) => {
    const nextAnswers = [...quizAnswers, value];
    setQuizAnswers(nextAnswers);

    if (quizStep + 1 < QUIZ_QUESTIONS.length) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate result based on majority answer
      const counts = nextAnswers.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let bestValue: keyof typeof QUIZ_RESULTS = "tech";
      let maxCount = 0;
      Object.entries(counts).forEach(([k, v]) => {
        if (v > maxCount) {
          maxCount = v;
          bestValue = k as keyof typeof QUIZ_RESULTS;
        }
      });
      setQuizResult(bestValue);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizResult(null);
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.channel || !formData.message) return;

    setFormStatus("transmitting");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFormStatus("securely_dispatched");
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  return (
    <main className="relative min-h-screen bg-transparent z-10 text-white pb-32">
      <Header />

      {/* ── HERO HEADER ────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 px-4 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="font-heading text-4xl md:text-7xl font-bold tracking-[0.2em] uppercase text-white mt-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">ABOUT COSMOSX</h1>
<p className="text-white/60 mt-6 max-w-2xl mx-auto text-sm md:text-base leading-relaxed tracking-wider font-sans font-light">We had always wondered about the space and the universe. The vast truth it holds, the silence between the stars, the questions that keep us awake at night — what's out there? Are we alone? How did all of this begin? CosmosX was born from that curiosity. Not from a boardroom, not from a business plan — but from five friends who simply looked up one night and refused to stop asking why.</p>
        </motion.div>

        {/* Interactive Realtime Counter Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { label: "VIRTUAL UNIVERSES SIMULATED", val: stats.simulations.toLocaleString() },
            { label: "CELESTIAL CORRIDORS MAPPED",  val: stats.starSystems.toString() },
            { label: "CREW UNITS IN SYSTEMS",        val: stats.crewCount.toString() }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className="bg-[#0b0c16]/70 border border-indigo-500/20 rounded-xl p-6 backdrop-blur-md cursor-default relative overflow-hidden group transition-all duration-300 hover:border-indigo-400/50 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
              
              <span className="text-[10px] tracking-[0.2em] text-white/40 block mb-2 font-mono">{stat.label}</span>
              <div className="text-3xl font-heading font-bold text-white tracking-widest group-hover:text-indigo-300 transition-colors">
                {stat.val}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION 1: MISSION CONTROL (TABS) ───────────────────────────── */}
      <section className="relative px-4 max-w-6xl mx-auto mt-12">
        <div className="border border-white/10 rounded-2xl bg-[#090b14]/80 backdrop-blur-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* Tab Selection Header */}
          <div className="flex border-b border-white/10 bg-black/40 overflow-x-auto">
            {[
              { id: "vision" as const, label: "THE INITIATIVE VISION", icon: Compass },
              { id: "tech" as const, label: "QUANTUM COMPUTE MATRIX", icon: Cpu },
              { id: "hubs" as const, label: "COSMOS RESEARCH HUB", icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-5 px-6 font-heading text-xs md:text-sm tracking-[0.2em] font-medium flex items-center justify-center gap-3 transition-all relative whitespace-nowrap min-w-[200px] ${
                    activeTab === tab.id 
                      ? "text-white bg-indigo-950/20" 
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-400 animate-pulse" : ""}`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_8px_#6366f1]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="p-8 md:p-12 relative min-h-[350px]">
            {/* Ambient Background Glow inside content */}
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <AnimatePresence mode="wait">
              {activeTab === "vision" && (
                <motion.div
                  key="vision"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                  <div>
                    <h3 className="font-heading text-2xl tracking-widest text-indigo-300">EXPLORING BEYOND LIMITS</h3>
                    <p className="mt-4 text-white/70 font-sans text-sm leading-relaxed tracking-wider font-light">
                      Humans have long observed the stars, but only recently have we developed the computational power to synthesize deep cosmological systems dynamically. CosmosX bridges astrophysics data and active visual engagement.
                    </p>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-indigo-950 flex items-center justify-center border border-indigo-500/30 mt-0.5 text-indigo-400 font-mono text-[10px] font-bold">1</div>
                        <div>
                          <h4 className="text-white font-medium tracking-wide text-xs">Europa Ice Oceans</h4>
                          <p className="text-white/50 text-[11px] mt-0.5">Plotting subsurface temperature models to look for life vectors.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-indigo-950 flex items-center justify-center border border-indigo-500/30 mt-0.5 text-indigo-400 font-mono text-[10px] font-bold">2</div>
                        <div>
                          <h4 className="text-white font-medium tracking-wide text-xs">Exoplanet Atmospheres</h4>
                          <p className="text-white/50 text-[11px] mt-0.5">Mapping light-refraction indexes of gold-ilmenite structures.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual UI Box */}
                  <div className="border border-white/5 bg-black/40 rounded-xl p-6 flex flex-col justify-between h-64 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-white/20">CTRL-VIZ_V1</div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="font-mono text-xs text-white/60 tracking-wider">SYSTEM DEPLOYMENT PROGRESS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-mono">ACTIVE</span>
                    </div>
                    {/* Simulated Phase Timeline */}
                    <div className="space-y-4 my-auto">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 tracking-widest font-mono text-white/50">
                          <span>PHASE I: orbital maps</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-full rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 tracking-widest font-mono text-white/50">
                          <span>PHASE II: sub-ice rovers</span>
                          <span>74%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[74%] rounded-full shadow-[0_0_8px_#6366f1]"></div>
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-indigo-400/80 tracking-widest">
                      {"// DIRECT TELEMETRY DATA ACTIVE"}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "tech" && (
                <motion.div
                  key="tech"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                  <div>
                    <h3 className="font-heading text-2xl tracking-widest text-indigo-300">REALTIME CELESTIAL ALGORITHMS</h3>
                    <p className="mt-4 text-white/70 font-sans text-sm leading-relaxed tracking-wider font-light">
                      The core engine utilizes real astrophysical coordinate projection matrices. By synthesizing orbit parameters, gravitational masses, and luminosity coefficients, we generate three-dimensional models that operate dynamically inside standard browsers.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="border border-white/5 bg-white/5 rounded-lg p-3">
                        <Terminal className="w-4 h-4 text-indigo-400 mb-2" />
                        <h4 className="text-white text-xs font-semibold">GPU Instancing</h4>
                        <p className="text-[11px] text-white/50 mt-1">Rendering 6,000+ stars smoothly on mobile and web clients.</p>
                      </div>
                      <div className="border border-white/5 bg-white/5 rounded-lg p-3">
                        <Database className="w-4 h-4 text-indigo-400 mb-2" />
                        <h4 className="text-white text-xs font-semibold">Keplerian Dynamics</h4>
                        <p className="text-[11px] text-white/50 mt-1">Calculating elliptic orbits in true vector spaces.</p>
                      </div>
                    </div>
                  </div>

                  {/* Visual Engine Diagnostics Widget */}
                  <div className="border border-white/5 bg-black/40 rounded-xl p-6 flex flex-col justify-between h-64 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-indigo-400 tracking-wider font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                        QUANTUM ENGINE SYNC
                      </span>
                      <span className="text-white/30 text-[10px]">VER_09.4.2</span>
                    </div>
                    <div className="space-y-3 my-4">
                      <div className="flex justify-between">
                        <span className="text-white/40">ANOMALY SIM LOAD:</span>
                        <span className="text-white">12.04%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">VECTOR COMPILATION:</span>
                        <span className="text-green-400">NOMINAL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">MEM CORE CHANNELS:</span>
                        <span className="text-white">1024 / 1024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">DARK ENERGY METRIC:</span>
                        <span className="text-indigo-400 font-bold">1.0927 W/m³</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/30 text-right">
                      READY TO RE-INITIALIZE SIMULATOR
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "hubs" && (
                <motion.div
                  key="hubs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {[
                    { title: "Propulsion Lab", desc: "Modeling quantum hydrogen ion drives for interstellar speed optimization.", loc: "Sector 4-B", status: "ONLINE" },
                    { title: "Simulation Center", desc: "Constructing synthetic solar arrays, hyper-gravity systems, and double moon models.", loc: "Sector 1-A", status: "STABLE" },
                    { title: "Planetary Roster", desc: "Logging orbital periods, atmospheric density, and soil profile for habitable zones.", loc: "Sector 9-G", status: "UPDATING" }
                  ].map((hub, idx) => (
                    <div key={idx} className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-xl p-5 flex flex-col justify-between min-h-[200px]">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-3">
                          <span>{hub.loc}</span>
                          <span className="text-indigo-400 font-semibold">{hub.status}</span>
                        </div>
                        <h4 className="font-heading text-lg text-white mb-2 tracking-wide">{hub.title}</h4>
                        <p className="text-white/50 text-xs font-sans font-light leading-relaxed tracking-wider">
                          {hub.desc}
                        </p>
                      </div>
                      <div className="font-mono text-[9px] text-white/20 mt-4">
                        {"// SECURE SUITE CONNECTION"}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: INTERACTIVE CREW ROSTER ───────────────────────────── */}
      <section className="relative px-4 max-w-6xl mx-auto mt-24">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-mono font-medium">CosmosX Registry</span>
          <h2 className="font-heading text-3xl md:text-4xl text-white tracking-widest mt-2">ACTIVE CREW DOSSIERS</h2>
          <p className="text-white/40 mt-3 text-xs md:text-sm tracking-widest font-light">
            Select a crew specialist below to pull up their encrypted system credentials
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREW.map((member) => (
            <motion.div
              key={member.id}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => setSelectedCrew(member)}
              className="bg-[#080914]/80 border border-white/5 hover:border-indigo-500/40 rounded-xl p-5 cursor-pointer flex flex-col items-center justify-between text-center relative overflow-hidden group transition-all duration-300"
            >
              {/* Corner Sci-fi accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>

              {/* Glowing Avatar circle */}
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.avatarColor} border flex items-center justify-center relative overflow-hidden mb-4 shadow-[0_0_20px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_25px_${member.glowColor}] transition-all duration-300`}>
                <Users className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
                {/* Scanner pulse overlay */}
                <div className="absolute inset-0 bg-indigo-500/10 -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-linear"></div>
              </div>

              <div>
                <span className="text-[9px] font-mono text-white/30 tracking-widest block mb-1">{member.tag}</span>
                <h4 className="font-heading text-base text-white font-bold tracking-wide group-hover:text-indigo-300 transition-colors">
                  {member.name}
                </h4>
                <p className="text-white/50 text-[11px] mt-1 tracking-wider uppercase font-mono">
                  {member.role}
                </p>
              </div>

              <div className="mt-5 text-[10px] font-mono text-indigo-400/80 tracking-widest border-t border-white/5 pt-3 w-full group-hover:text-white transition-colors flex items-center justify-center gap-1">
                ACCESS SYSTEM CREDS <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dossier Modal Overlay */}
        <AnimatePresence>
          {selectedCrew && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCrew(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0b0c16] border border-indigo-500/30 w-full max-w-lg rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(99,102,241,0.2)] cursor-default"
              >
                {/* Top Glowing Header */}
                <div className="bg-indigo-950/40 p-6 border-b border-indigo-500/20 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 tracking-[0.2em]">{selectedCrew.tag} {"// ENCRYPTED DOSSIER"}</span>
                    <h3 className="font-heading text-xl text-white tracking-widest mt-1">{selectedCrew.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedCrew(null)}
                    className="text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-lg p-2 transition-all font-mono text-xs"
                  >
                    CLOSE [X]
                  </button>
                </div>

                {/* Dossier Stats & Bio */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl font-mono text-xs">
                    <div>
                      <span className="text-white/40 block mb-1">SYSTEM ASSIGNMENT:</span>
                      <span className="text-white font-medium">{selectedCrew.role}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-heading text-xs text-indigo-300 tracking-[0.15em] mb-2 uppercase flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5" /> Background Dossier
                    </h4>
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed tracking-wider font-light">
                      {selectedCrew.bio}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <span className="text-[11px] font-mono text-white/40">SYSTEM RECREATION CODE:</span>
                    <span className="text-white text-xs block mt-1 italic tracking-wider">&quot;{selectedCrew.hobbies}&quot;</span>
                  </div>
                </div>

                {/* Footer Scanning lines */}
                <div className="bg-indigo-950/20 p-4 border-t border-white/5 font-mono text-[9px] text-white/30 tracking-widest text-center">
                  COSMOSX CLASSIFIED INFORMATION DATASTREAM v2.0
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── SECTION 3: MISSION ROLE FINDER (QUIZ) ───────────────────────── */}
      <section className="relative px-4 max-w-4xl mx-auto mt-24">
        <div className="bg-gradient-to-b from-indigo-950/30 to-[#070815]/90 border border-indigo-500/20 rounded-2xl p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-mono font-medium">CosmosX Interactive Assessment</span>
            <h2 className="font-heading text-2xl md:text-3xl text-white tracking-widest mt-1">FIND YOUR COSMIC SECTOR</h2>
            <p className="text-white/40 mt-2 text-xs md:text-sm font-sans font-light">
              Respond to the telemetry diagnostics to locate your assignment in the CosmosX exploration crew.
            </p>
          </div>

          <div className="relative z-10 min-h-[240px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {quizResult === null ? (
                <motion.div
                  key={quizStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4 font-mono text-xs text-indigo-300">
                    <span className="px-2 py-0.5 bg-indigo-500/20 rounded-full font-bold">
                      SYSTEM DETECTOR {quizStep + 1} / {QUIZ_QUESTIONS.length}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg md:text-xl text-white font-medium tracking-wide mb-6">
                    {QUIZ_QUESTIONS[quizStep].question}
                  </h3>

                  <div className="space-y-3">
                    {QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(opt.value)}
                        className="w-full text-left bg-black/40 hover:bg-indigo-950/20 border border-white/10 hover:border-indigo-500/40 rounded-xl p-4 transition-all duration-300 group flex justify-between items-center cursor-pointer hover:shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                      >
                        <span className="text-xs md:text-sm text-white/70 group-hover:text-white transition-colors">
                          {opt.text}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="text-center flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-pulse">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>

                  <span className="text-[10px] font-mono text-indigo-400 tracking-[0.2em] uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-2">
                    ROLE ASSIGNED: {QUIZ_RESULTS[quizResult].badge}
                  </span>

                  <h3 className="font-heading text-2xl md:text-3xl text-white font-bold tracking-widest uppercase mt-2">
                    {QUIZ_RESULTS[quizResult].title}
                  </h3>

                  <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-xl mt-4 font-sans font-light tracking-wide">
                    {QUIZ_RESULTS[quizResult].desc}
                  </p>

                  <button
                    onClick={resetQuiz}
                    className="mt-8 bg-indigo-900/40 border border-indigo-500/40 hover:bg-indigo-900/60 text-white px-6 py-2.5 rounded-lg font-mono text-xs tracking-widest font-bold transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> RE-ALIGN DETECTORS
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOLOGRAPHIC TRANSMISSION (CONTACT) ────────────────── */}
      <section className="relative px-4 max-w-2xl mx-auto mt-24">
        <div className="border border-white/10 rounded-2xl bg-[#080914]/80 p-8 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-indigo-500/30"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-indigo-500/30"></div>

          <div className="mb-8 text-center">
            <h2 className="font-heading text-xl md:text-2xl text-white tracking-widest">SUB-SPACE TRANSMISSION</h2>
            <p className="text-white/40 text-xs tracking-widest font-mono mt-2 uppercase">
              Establish a secure communication link to CosmosX Mission Control
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] tracking-widest font-mono text-white/50 uppercase mb-2">
                Sender Unit Name / Identifier
              </label>
              <input
                type="text"
                required
                disabled={formStatus !== "idle"}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Commander Marcus"
                className="w-full bg-black/50 border border-white/10 focus:border-indigo-500/80 rounded-lg p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest font-mono text-white/50 uppercase mb-2">
                Sub-Space Channel ID (Email Address)
              </label>
              <input
                type="email"
                required
                disabled={formStatus !== "idle"}
                value={formData.channel}
                onChange={e => setFormData({ ...formData, channel: e.target.value })}
                placeholder="e.g. marcus@outer-orbit.com"
                className="w-full bg-black/50 border border-white/10 focus:border-indigo-500/80 rounded-lg p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-widest font-mono text-white/50 uppercase mb-2">
                Telemetry Log / Message Contents
              </label>
              <textarea
                required
                rows={4}
                disabled={formStatus !== "idle"}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your logs or message here..."
                className="w-full bg-black/50 border border-white/10 focus:border-indigo-500/80 rounded-lg p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all font-sans resize-none"
              />
            </div>

            {/* Form Button or Feedback */}
            <div className="border-t border-white/5 pt-6">
              {formStatus === "idle" && (
                <button
                  type="submit"
                  className="w-full bg-indigo-900/50 hover:bg-indigo-900/80 border border-indigo-500/40 text-white py-3 rounded-lg font-mono text-xs tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> ESTABLISH BEAM TRANSMISSION
                </button>
              )}

              {formStatus === "transmitting" && (
                <div className="space-y-3">
                  <div className="flex justify-between font-mono text-[10px] text-indigo-400">
                    <span className="animate-pulse">TRANSMITTING OVER SUB-SPACE WAVEFRONT...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-75 shadow-[0_0_8px_#6366f1]" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {formStatus === "securely_dispatched" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/40 p-4 rounded-xl text-center space-y-2"
                >
                  <div className="text-green-400 font-mono text-xs font-bold tracking-widest">
                    ✔ TRANSMISSION DISPATCHED SECURELY
                  </div>
                  <p className="text-white/60 text-[11px] font-sans font-light tracking-wide">
                    Your transmission has bypassed atmospheric ionization and is logged in the CosmosX archives.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormStatus("idle");
                      setFormData({ name: "", channel: "", message: "" });
                    }}
                    className="mt-3 text-indigo-400 hover:text-indigo-300 font-mono text-[9px] tracking-widest uppercase underline cursor-pointer"
                  >
                    SEND NEW BEAM SIGNAL
                  </button>
                </motion.div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="relative py-10 text-center text-white/25 text-xs tracking-widest z-10 border-t border-white/5 mt-24 max-w-6xl mx-auto">
        <p>COSMOSX INTERACTIVE EXPERIENCE © 2026</p>
      </footer>
    </main>
  );
}
