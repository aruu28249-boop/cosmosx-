import React from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';

/**
 * TeamCard – displays a crew member with hover glow and click interaction.
 * Props:
 *   crew: crew object defined in page.tsx
 *   onClick: handler to set selected crew
 */
export default function TeamCard({ crew, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onClick}
      className="bg-[#080914]/80 border border-white/5 hover:border-indigo-500/40 rounded-xl p-5 cursor-pointer flex flex-col items-center justify-between text-center relative overflow-hidden group transition-all duration-300"
    >
      {/* Corner sci‑fi accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

      {/* Avatar */}
      <div
        className={`w-20 h-20 rounded-full bg-gradient-to-br ${crew.avatarColor} border flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_25px_${crew.glowColor}] transition-all duration-300`}
      >
        <Users className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
        <div className="absolute inset-0 bg-indigo-500/10 -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-linear" />
      </div>

      <div>
        <span className="text-[9px] font-mono text-white/30 tracking-widest block mb-1">{crew.tag}</span>
        <h4 className="font-heading text-base text-white font-bold tracking-wide group-hover:text-indigo-300 transition-colors">
          {crew.name}
        </h4>
        <p className="text-white/50 text-[11px] mt-1 tracking-wider uppercase font-mono">
          {crew.role}
        </p>
      </div>

      <div className="mt-5 text-[10px] font-mono text-indigo-400/80 tracking-widest border-t border-white/5 pt-3 w-full flex items-center justify-center gap-1">
        ACCESS SYSTEM CREDS <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}
