'use client'

import { useEffect, useRef } from 'react'

export default function Hero() {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.65
  }, [])

  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">

      {/* Milky Way background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-125"
        style={{ filter: 'brightness(0.55)' }}
      >
        <source src="/milkyway.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-5">
          Welcome to
        </p>

        <h1 className="text-7xl font-extrabold mb-5 tracking-tight bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-none">
          CosmosX
        </h1>

        <p className="text-white/60 text-lg mb-10 whitespace-nowrap">
          Explore the Past. &nbsp;Visualize the Present. &nbsp;Simulate the Future.
        </p>

        <a
          href="#solar-system"
          className="group inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/25 text-white/80 hover:text-white hover:border-white/60 hover:bg-white/10 transition-all duration-300 text-sm backdrop-blur-sm"
        >
          Start Exploring
          <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
        </a>
      </div>

      {/* Bottom fade to black */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  )
}
