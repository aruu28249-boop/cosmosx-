'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export interface Mission {
  id: string;
  name: string;
  date: string;
  agency: string;
  destination: string;
  description: string;
  color: string;
}

interface MissionFlashcardProps {
  mission: Mission;
  index: number;
}

export default function MissionFlashcard({ mission, index }: MissionFlashcardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10, boxShadow: `0 20px 40px -10px ${mission.color}40` }}
      className="relative flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden h-full min-h-[300px]"
    >
      {/* Decorative Glow */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
        style={{ backgroundColor: mission.color }}
      />

      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-heading text-2xl font-bold text-white mb-1 tracking-wider">{mission.name}</h3>
            <div className="flex gap-2 text-xs font-sans tracking-widest font-semibold uppercase" style={{ color: mission.color }}>
              <span>{mission.agency}</span>
              <span>•</span>
              <span>{mission.destination}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs tracking-widest uppercase mb-1">Target Date</div>
            <div className="text-white/90 font-bold tracking-widest">{mission.date}</div>
          </div>
        </div>

        <p className="text-white/60 text-sm leading-relaxed tracking-wide font-sans mb-8">
          {mission.description}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <Link 
          href="/#history" 
          className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 group-hover:text-white transition-colors">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className="text-xs font-bold tracking-widest text-white/80 group-hover:text-white uppercase transition-colors">
            View on Timeline
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
