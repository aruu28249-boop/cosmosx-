"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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
      "On 4 October 1957 the Soviet Union launched a 58 cm aluminium sphere into orbit. Its faint radio beep, heard by amateur operators worldwide, proved that humanity could place objects beyond the atmosphere — and triggered the Space Race overnight.",
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
      "Launched to study the outer planets, Voyager 1 is now over 24 billion km away in interstellar space — the most distant human-made object ever. It still carries the Golden Record, a message of sounds and images from Earth for any civilisation that may find it.",
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
    facts: ["6.5 m gold-coated mirror", "Sees infrared light", "Orbits Sun–Earth L2"],
    align: "right",
  },
  {
    id: "chandrayaan",
    title: "Chandrayaan-3",
    date: "2023",
    agency: "ISRO",
    desc: "First to land on the lunar south pole.",
    detail:
      "India became the fourth nation to soft-land on the Moon and the very first to touch down near its south pole — a region of scientific interest for its water-ice deposits. The Pragyan rover then explored the surface and confirmed the presence of sulphur.",
    facts: ["First at the south pole", "4th nation to soft-land", "Confirmed surface sulphur"],
    align: "left",
  },
];

function MissionNode({ mission }: { mission: Mission }) {
  const [open, setOpen] = useState(false);
  const isLeft = mission.align === "left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 1, ease: "easeOut" }}
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
        {open ? "− Close" : "+ Explain this milestone"}
      </div>
    </button>
  );
}

export default function ConstellationTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto py-32 z-10">

      {/* ── Vertical spine line (real DOM, always at 50%) ── */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="relative w-px h-full">
          {/* Faint static line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(150,200,255,0.15)] to-transparent" />
          {/* Animated fill driven by scroll */}
          <motion.div
            className="absolute top-0 left-0 right-0 origin-top bg-gradient-to-b from-transparent via-[rgba(150,200,255,0.7)] to-transparent"
            style={{ scaleY: pathLength }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-24">
        {MISSIONS.map((mission) => (
          <MissionNode key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}
