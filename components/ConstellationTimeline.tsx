"use client";

import { useRef, useState, useCallback } from "react";
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

// ── CardButton (hardcoded milestone, with AI explanation on open) ─────────────
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

  return (
    <button
      onClick={() => setOpen((v) => !v)}
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
        {open ? "− Close" : "+ View details"}
      </div>
    </button>
  );
}

// ── MissionNode (timeline spine layout wrapper) ───────────────────────────────
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
        The spine column has 0 width — the node dot is positioned
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

// ── AiMissionCard (AI-fetched result, centred, cyan-themed) ───────────────────
function AiMissionCard({ mission }: { mission: Omit<Mission, "align"> }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full flex justify-center"
    >
      <div className="relative w-full max-w-sm">
        {/* AI badge */}
        <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-400/35 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
          <span className="text-[9px] tracking-[0.15em] uppercase text-indigo-300/80 font-mono">AI Result</span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`group w-full rounded-xl border px-5 py-4 text-left transition-all duration-300 cursor-pointer
            ${open
              ? "border-indigo-300/40 bg-white/[0.06] shadow-[0_0_30px_rgba(129,140,248,0.18)]"
              : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
            }`}
        >
          <div className="flex items-baseline gap-3">
            <div className="font-heading text-3xl text-white tracking-wider">{mission.title}</div>
            <div className="text-indigo-200 text-sm font-mono">{mission.date}</div>
          </div>

          <div className="mt-1 text-[10px] tracking-[0.25em] uppercase text-indigo-300/70">
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
                <p className="text-white/75 text-sm leading-relaxed mt-4 pt-4 border-t border-indigo-400/10">
                  {mission.detail}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
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

          <div className="mt-3 text-[10px] tracking-[0.2em] uppercase text-indigo-300/50 transition-colors group-hover:text-indigo-200">
            {open ? "− Close" : "+ View details"}
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ConstellationTimeline ────────────────────────────────────────────────
export default function ConstellationTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // AI search state
  const [aiResult, setAiResult] = useState<Omit<Mission, "align"> | null>(null);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueriedRef = useRef("");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const filteredMissions = MISSIONS.filter((mission) => {
    const q = searchQuery.toLowerCase();
    return (
      mission.title.toLowerCase().includes(q) ||
      mission.desc.toLowerCase().includes(q) ||
      mission.detail.toLowerCase().includes(q) ||
      mission.agency.toLowerCase().includes(q) ||
      mission.date.includes(q)
    );
  });

  // AI-result is a duplicate if a hardcoded card already shows that title
  const isAiDuplicate =
    aiResult != null &&
    filteredMissions.some(
      (m) =>
        m.title.toLowerCase().includes(aiResult.title.toLowerCase()) ||
        aiResult.title.toLowerCase().includes(m.title.toLowerCase())
    );
  const showAiResult = aiResult != null && !isAiDuplicate;

  // ── AI search trigger ────────────────────────────────────────────────────
  const triggerAiSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q || q === lastQueriedRef.current) return;
    lastQueriedRef.current = q;
    setAiSearchLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/timeline-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data?.title && data?.date) {
        setAiResult({
          id: "ai-result",
          title: data.title,
          date: data.date,
          agency: data.agency ?? "",
          desc: data.desc ?? "",
          detail: data.detail ?? "",
          facts: Array.isArray(data.facts) ? data.facts : [],
        });
      } else {
        setAiResult(null);
      }
    } catch {
      setAiResult(null);
    } finally {
      setAiSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    if (!value.trim()) {
      setAiResult(null);
      setAiSearchLoading(false);
      lastQueriedRef.current = "";
      return;
    }
    // Auto-trigger AI after 850 ms of no typing
    aiDebounceRef.current = setTimeout(() => triggerAiSearch(value), 850);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
      triggerAiSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAiResult(null);
    setAiSearchLoading(false);
    lastQueriedRef.current = "";
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
  };

  // Calculate some simple stats
  const years = filteredMissions.map((m) => parseInt(m.date)).filter((y) => !isNaN(y));
  const spanYears = years.length > 0 ? `${Math.min(...years)} – ${Math.max(...years)}` : "N/A";
  const uniqueAgencies = new Set(filteredMissions.flatMap((m) => m.agency.split(" / "))).size;

  const hasAiSection = searchQuery.trim().length > 0 && (aiSearchLoading || showAiResult);

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
              placeholder="Search any mission — Apollo, Perseverance, Vostok, Mars… ⏎ Enter for instant AI search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-indigo-400/50 hover:border-white/20 text-white rounded-xl pl-10 pr-16 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-400/30 font-sans tracking-wide placeholder-white/25"
            />
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
              {aiSearchLoading && (
                <svg className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="text-white/40 hover:text-white/80 transition-colors text-xs font-mono"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI search hint */}
        {searchQuery.trim() && (
          <p className="text-[10px] text-indigo-400/50 font-mono tracking-widest -mt-2 relative z-10 flex items-center gap-1.5">
            <Sparkles className="w-2.5 h-2.5" />
            {aiSearchLoading
              ? "Scanning cosmic archives…"
              : showAiResult
              ? `AI found: ${aiResult?.title}`
              : isAiDuplicate
              ? "Already shown above ↑"
              : lastQueriedRef.current === searchQuery.trim() && !aiResult
              ? "No cosmic records found"
              : "AI will search all of space history"}
          </p>
        )}


      </div>

      {/* ── Vertical spine line ── */}
      {filteredMissions.length > 0 && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none mt-48 mb-16">
          <div className="relative w-px h-full">
            <div className="absolute inset-y-0 bg-gradient-to-b from-transparent via-[rgba(150,200,255,0.15)] to-transparent w-px" />
            <motion.div
              className="absolute top-0 left-0 right-0 origin-top bg-gradient-to-b from-transparent via-[rgba(150,200,255,0.7)] to-transparent w-px"
              style={{ scaleY: pathLength }}
            />
          </div>
        </div>
      )}

      {/* ── Hardcoded Missions List ── */}
      <div className="flex flex-col gap-24 relative">
        <AnimatePresence mode="popLayout">
          {filteredMissions.map((mission) => (
            <MissionNode key={mission.id} mission={mission} />
          ))}
        </AnimatePresence>

        {/* Empty state — only if there's no AI section coming */}
        {filteredMissions.length === 0 && !hasAiSection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
          >
            <Compass className="w-10 h-10 text-white/20 mx-auto mb-4 animate-pulse" />
            <p className="text-white/60 font-sans tracking-wide text-sm font-medium">
              No milestones matched. Try the AI search above.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 font-mono tracking-widest uppercase cursor-pointer underline underline-offset-4"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>

      {/* ── AI Expanded Search Section ── */}
      <AnimatePresence>
        {hasAiSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mt-20"
          >
            {/* Separator */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
              <div className="flex items-center gap-2 text-[9px] tracking-[0.22em] uppercase text-indigo-400/55 font-mono shrink-0">
                <Sparkles className="w-3 h-3" />
                Cosmic AI Search
                <Sparkles className="w-3 h-3" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
            </div>

            {/* Loading state */}
            {aiSearchLoading && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-indigo-400/60">
                <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-xs font-mono tracking-[0.2em] uppercase">Scanning cosmic archives…</p>
              </div>
            )}

            {/* AI Result Card */}
            {!aiSearchLoading && showAiResult && aiResult && (
              <AnimatePresence mode="popLayout">
                <AiMissionCard key="ai-card" mission={aiResult} />
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
