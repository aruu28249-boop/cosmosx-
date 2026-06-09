"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const MISSIONS = [
  { id: "sputnik", title: "Sputnik 1", date: "1957", desc: "The first artificial Earth satellite.", align: "left" },
  { id: "apollo", title: "Apollo 11", date: "1969", desc: "First humans on the Moon.", align: "right" },
  { id: "voyager", title: "Voyager 1", date: "1977", desc: "Farthest human-made object.", align: "left" },
  { id: "iss", title: "ISS", date: "1998", desc: "International Space Station launched.", align: "right" },
  { id: "jwst", title: "James Webb", date: "2021", desc: "Unveiling the early universe.", align: "left" },
  { id: "chandrayaan", title: "Chandrayaan-3", date: "2023", desc: "First to land on the lunar south pole.", align: "right" },
];

export default function ConstellationTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto py-32 z-10">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(150,200,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 20 8 C 50 8, 50 25, 80 25 C 50 25, 50 42, 20 42 C 50 42, 50 58, 80 58 C 50 58, 50 75, 20 75 C 50 75, 50 92, 80 92"
            fill="transparent"
            stroke="url(#lineGrad)"
            strokeWidth="0.4"
            style={{ pathLength }}
          />
        </svg>
      </div>

      <div className="flex flex-col gap-32">
        {MISSIONS.map((mission, idx) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`flex w-full ${mission.align === "left" ? "justify-start" : "justify-end"}`}
          >
            <div className={`relative flex items-center gap-6 ${mission.align === "left" ? "flex-row" : "flex-row-reverse"}`}>
              {/* Star Node */}
              <div className="relative">
                <div className="w-2 h-2 bg-white rounded-full animate-twinkle shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                <div className="absolute inset-0 -m-1 w-4 h-4 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '3s' }} />
              </div>

              {/* Content */}
              <div className={`text-${mission.align === "left" ? "left" : "right"}`}>
                <div className="font-heading text-3xl text-white mb-1 tracking-wider">{mission.title}</div>
                <div className="text-indigo-200 text-sm font-mono mb-2">{mission.date}</div>
                <div className="text-white/60 max-w-xs leading-relaxed">{mission.desc}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
