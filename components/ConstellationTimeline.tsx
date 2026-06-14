"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, Compass, Sparkles } from "lucide-react";

type Mission = {
  id: string;
  title: string;
  date: string;
  agency: string;
  desc: string;
  detail: string;
  facts: string[];
  align: "left" | "right";
};

const MISSIONS: Mission[] = [
  {
    id: "sputnik",
    title: "Sputnik 1",
    date: "1957",
    agency: "USSR",
    desc: "The first artificial Earth satellite.",
    detail:
      "On 4 October 1957 the Soviet Union launched a 58 cm aluminium sphere into orbit. Its faint radio beep, heard by amateur operators worldwide, proved that humanity could place objects beyond the atmosphere and triggered the Space Race overnight.",
    facts: ["Orbited every 96 minutes", "Transmitted for 21 days", "Re-entered after 3 months"],
    align: "left",
  },
  {
    id: "apollo",
    title: "Apollo 11",
    date: "1969",
    agency: "NASA",
    desc: "First humans on the Moon.",
    detail:
      "Neil Armstrong and Buzz Aldrin became the first people to walk on another world, while Michael Collins orbited above. The landing was watched live by an estimated 600 million people and returned 21.5 kg of lunar samples to Earth.",
    facts: ["Crew of 3", "21h 36m on the surface", "600M+ live viewers"],
    align: "right",
  },
  {
    id: "voyager",
    title: "Voyager 1",
    date: "1977",
    agency: "NASA",
    desc: "Farthest human-made object.",
    detail:
      "Launched to study the outer planets, Voyager 1 is now over 24 billion km away in interstellar space, making it the most distant human-made object ever built. It still carries the Golden Record, a message of sounds and images from Earth for any civilisation that may find it.",
    facts: ["Interstellar since 2012", "Golden Record aboard", "Still transmitting"],
    align: "left",
  },
  {
    id: "hubble",
    title: "Hubble Telescope",
    date: "1990",
    agency: "NASA / ESA",
    desc: "Our window on the deep universe.",
    detail:
      "Orbiting above the atmosphere's blur, Hubble has captured the sharpest visible-light images of galaxies, nebulae and the Deep Field. Its data helped pin down the age of the universe at roughly 13.8 billion years.",
    facts: ["1.5M+ observations", "Refined the universe's age", "Serviced 5 times in orbit"],
    align: "right",
  },
  {
    id: "iss",
    title: "ISS",
    date: "1998",
    agency: "International",
    desc: "International Space Station launched.",
    detail:
      "The largest structure humans have ever placed in space, assembled module by module by five space agencies. It has hosted a continuous human presence in orbit since November 2000, serving as a microgravity laboratory for thousands of experiments.",
    facts: ["Crewed since 2000", "Orbits at ~28,000 km/h", "Size of a football field"],
    align: "left",
  },
  {
    id: "jwst",
    title: "James Webb",
    date: "2021",
    agency: "NASA / ESA / CSA",
    desc: "Unveiling the early universe.",
    detail:
      "The most powerful space telescope ever built observes in infrared from a vantage point 1.5 million km from Earth. It can see the light of the very first galaxies, formed just a few hundred million years after the Big Bang.",
    facts: ["6.5 m gold-coated mirror", "Sees infrared light", "Orbits Sun-Earth L2"],
    align: "right",
  },
  {
    id: "chandrayaan",
    title: "Chandrayaan-3",
    date: "2023",
    agency: "ISRO",
    desc: "First to land on the lunar south pole.",
    detail:
      "India became the fourth nation to soft-land on the Moon and the very first to touch down near its south pole, a region of scientific interest for its water-ice deposits. The Pragyan rover then explored the surface and confirmed the presence of sulphur.",
    facts: ["First at the south pole", "4th nation to soft-land", "Confirmed surface sulphur"],
    align: "left",
  },
];

function MissionNode({ mission }: { mission: Mission }) {
  const [open, setOpen] = useState(false);
  const isLeft = mission.align === "left";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/*
        3-column grid: [card area | spine | card area]
        The spine column has 0 width -the node dot is positioned
        absolutely on it so it never moves when the card resizes.
      */}
      <div className="grid grid-cols-[1fr_0px_1fr] items-start">

        {/* ── Left slot ── */}
        <div className={`pr-8 flex ${isLeft ? "justify-end" : ""}`}>
          {isLeft && (
            <CardButton mission={mission} open={open} setOpen={setOpen} align="left" />
          )}
        </div>

        {/* ── Centre spine node (always centred on the line) ── */}
        <div className="relative flex justify-center">
          {/* Dot is pulled out of flow so it doesn't affect column width */}
          <div className="absolute top-5 -translate-x-1/2 left-0 z-10">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
            <div
              className="absolute inset-0 -m-1 w-4.5 h-4.5 rounded-full border border-white/20 animate-ping"
              style={{ animationDuration: "3s" }}
            />
          </div>
        </div>

        {/* ── Right slot ── */}
        <div className={`pl-8 flex ${!isLeft ? "justify-start" : ""}`}>
          {!isLeft && (
            <CardButton mission={mission} open={open} setOpen={setOpen} align="right" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CardButton({
  mission,
  open,
  setOpen,
  align,
}: {
  mission: Mission;
  open: boolean;
  setOpen: (fn: (v: boolean) => boolean) => void;
  align: "left" | "right";
}) {
  const isLeft = align === "left";
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen((v) => !v);
    // Fetch AI explanation on first open
    if (willOpen && !aiExplanation && !aiLoading) {
      setAiLoading(true);
      try {
        const res = await fetch('/api/scenario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: `${mission.title} (${mission.date}): ${mission.desc} — ${mission.detail}`,
          }),
        });
        const data = await res.json();
        setAiExplanation(data?.explanation ?? null);
      } catch {
        setAiExplanation(null);
      } finally {
        setAiLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-expanded={open}
      className={`group w-full max-w-sm rounded-xl border px-5 py-4 transition-all duration-300 cursor-pointer
        ${isLeft ? "text-left" : "text-right"}
        ${open
          ? "border-indigo-300/40 bg-white/[0.06] shadow-[0_0_30px_rgba(129,140,248,0.18)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
        }`}
    >
      <div className={`flex items-baseline gap-3 ${isLeft ? "" : "flex-row-reverse"}`}>
        <div className="font-heading text-3xl text-white tracking-wider">{mission.title}</div>
        <div className="text-indigo-200 text-sm font-mono">{mission.date}</div>
      </div>

      <div className={`mt-1 text-[10px] tracking-[0.25em] uppercase text-indigo-300/70 ${isLeft ? "" : "text-right"}`}>
        {mission.agency}
      </div>

      <div className="text-white/60 leading-relaxed mt-2">{mission.desc}</div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-white/75 text-sm leading-relaxed mt-4 pt-4 border-t border-white/10">
              {mission.detail}
            </p>

            {/* AI explanation section */}
            <div className={`mt-4 pt-3 border-t border-indigo-400/10`}>
              <div className={`flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase text-indigo-300/60 mb-2 ${isLeft ? "" : "justify-end"}`}>
                <Sparkles className="w-2.5 h-2.5" />
                AI Analysis
              </div>
              {aiLoading ? (
                <div className={`flex items-center gap-2 text-indigo-300/50 text-xs ${isLeft ? "" : "justify-end"}`}>
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Consulting the cosmos…
                </div>
              ) : aiExplanation ? (
                <p className={`text-indigo-100/70 text-xs leading-relaxed italic ${isLeft ? "" : "text-right"}`}>
                  {aiExplanation}
                </p>
              ) : null}
            </div>

            <div className={`flex flex-wrap gap-2 mt-4 ${isLeft ? "justify-start" : "justify-end"}`}>
              {mission.facts.map((fact) => (
                <span
                  key={fact}
                  className="text-[11px] text-indigo-100/80 bg-indigo-400/10 border border-indigo-300/20 rounded-full px-3 py-1"
                >
                  {fact}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`mt-3 text-[10px] tracking-[0.2em] uppercase text-indigo-300/60 transition-colors group-hover:text-indigo-200 ${isLeft ? "" : "text-right"}`}
      >
        {open ? "− Close" : "+ Explain this milestone"}
      </div>
    </button>
  );
}

export default function ConstellationTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("All");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const agencies = ["All", "NASA", "USSR", "ISRO", "ESA", "International"];

  const filteredMissions = MISSIONS.filter((mission) => {
    const matchesAgency =
      selectedAgency === "All" ||
      mission.agency.toLowerCase().includes(selectedAgency.toLowerCase());
    
    const matchesSearch =
      mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.date.includes(searchQuery);

    return matchesAgency && matchesSearch;
  });

  // Calculate some simple stats
  const years = filteredMissions.map((m) => parseInt(m.date)).filter((y) => !isNaN(y));
  const spanYears = years.length > 0 ? `${Math.min(...years)} – ${Math.max(...years)}` : "N/A";
  const uniqueAgencies = new Set(filteredMissions.flatMap((m) => m.agency.split(" / "))).size;

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto py-12 px-4 z-10">
      
      {/* ── Search & Filter Controls ── */}
      <div className="mb-16 flex flex-col gap-6 p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between relative z-10">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search cosmic milestones (e.g. Sputnik, Apollo, 2021)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-400/50 hover:border-white/20 text-white rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-400/30 font-sans tracking-wide placeholder-white/30"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/80 transition-colors text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Agency Filter pills */}
        <div className="flex flex-col gap-3 relative z-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Filter by Space Agency</span>
          <div className="flex flex-wrap gap-2">
            {agencies.map((agency) => {
              const active = selectedAgency === agency;
              return (
                <button
                  key={agency}
                  onClick={() => setSelectedAgency(agency)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer border
                    ${active 
                      ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.25)]" 
                      : "bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:border-white/15"
                    }`}
                >
                  {agency}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini stats block */}
        <div className="grid grid-cols-3 gap-4 pt-6 mt-2 border-t border-white/5 text-center relative z-10">
          <div>
            <div className="text-white/45 text-[9px] uppercase tracking-widest font-sans mb-1">Milestones</div>
            <div className="text-white font-mono text-xl font-bold tracking-wide">{filteredMissions.length}</div>
          </div>
          <div>
            <div className="text-white/45 text-[9px] uppercase tracking-widest font-sans mb-1">Agencies</div>
            <div className="text-white font-mono text-xl font-bold tracking-wide">{uniqueAgencies}</div>
          </div>
          <div>
            <div className="text-white/45 text-[9px] uppercase tracking-widest font-sans mb-1">Time Span</div>
            <div className="text-white font-mono text-sm md:text-base font-bold tracking-wide mt-1.5 md:mt-0">{spanYears}</div>
          </div>
        </div>
      </div>

      {/* ── Vertical spine line (real DOM, always at 50%) ── */}
      {filteredMissions.length > 0 && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none mt-72 mb-16">
          <div className="relative w-px h-full">
            {/* Faint static line */}
            <div className="absolute inset-y-0 bg-gradient-to-b from-transparent via-[rgba(150,200,255,0.15)] to-transparent w-px" />
            {/* Animated fill driven by scroll */}
            <motion.div
              className="absolute top-0 left-0 right-0 origin-top bg-gradient-to-b from-transparent via-[rgba(150,200,255,0.7)] to-transparent w-px"
              style={{ scaleY: pathLength }}
            />
          </div>
        </div>
      )}

      {/* ── Missions List ── */}
      <div className="flex flex-col gap-24 relative">
        <AnimatePresence mode="popLayout">
          {filteredMissions.map((mission) => (
            <MissionNode key={mission.id} mission={mission} />
          ))}
        </AnimatePresence>

        {filteredMissions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
          >
            <Compass className="w-10 h-10 text-white/20 mx-auto mb-4 animate-pulse" />
            <p className="text-white/60 font-sans tracking-wide text-sm font-medium">No space milestones found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAgency("All");
              }}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 font-mono tracking-widest uppercase cursor-pointer underline underline-offset-4"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
