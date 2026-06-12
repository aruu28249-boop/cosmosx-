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
      className={`flex w-full ${isLeft ? "justify-start" : "justify-end"}`}
    >
      <div className={`relative flex items-start gap-6 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
        {/* Star Node */}
        <div className="relative mt-2 shrink-0">
          <div className="w-2 h-2 bg-white rounded-full animate-twinkle shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          <div
            className="absolute inset-0 -m-1 w-4 h-4 rounded-full border border-white/20 animate-ping"
            style={{ animationDuration: "3s" }}
          />
        </div>

        {/* Content card — clickable to reveal the full explanation */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`group ${isLeft ? "text-left" : "text-right"} max-w-sm rounded-xl border px-5 py-4 transition-all duration-300 cursor-pointer
            ${open ? "border-indigo-300/40 bg-white/[0.06] shadow-[0_0_30px_rgba(129,140,248,0.18)]" : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"}`}
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
      </div>
    </motion.div>
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
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <svg
          className="w-full h-full drop-shadow-[0_0_12px_rgba(150,200,255,0.7)]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(150,200,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {/* Faint full path so the constellation shape is always hinted */}
          <path
            d="M 20 6 C 50 6, 50 21, 80 21 C 50 21, 50 36, 20 36 C 50 36, 50 50, 80 50 C 50 50, 50 64, 20 64 C 50 64, 50 79, 80 79 C 50 79, 50 94, 20 94"
            fill="transparent"
            stroke="rgba(150,200,255,0.12)"
            strokeWidth="0.4"
          />
          {/* Bright path that draws in as the section scrolls into view */}
          <motion.path
            d="M 20 6 C 50 6, 50 21, 80 21 C 50 21, 50 36, 20 36 C 50 36, 50 50, 80 50 C 50 50, 50 64, 20 64 C 50 64, 50 79, 80 79 C 50 79, 50 94, 20 94"
            fill="transparent"
            stroke="url(#lineGrad)"
            strokeWidth="0.6"
            style={{ pathLength }}
          />
        </svg>
      </div>

      <div className="flex flex-col gap-28">
        {MISSIONS.map((mission) => (
          <MissionNode key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}
