'use client'
import { useState } from 'react'
import { triggerEffect } from '@/components/SolarSystem'

const SCENARIOS = [
  {
    label: 'JUPITER DISAPPEARS',
    effect: 'jupiter-disappear',
    description: 'What if Jupiter suddenly vanished from the solar system?'
  },
  {
    label: 'ASTEROID HITS MARS',
    effect: 'asteroid-hit-mars',
    description: 'What if a massive asteroid collided with Mars?'
  },
  {
    label: 'TWO MOONS',
    effect: 'two-moons',
    description: 'What if Earth had a second moon in orbit?'
  },
  {
    label: 'SUN GETS BRIGHTER',
    effect: 'sun-brighter',
    description: 'What if the Sun suddenly increased its luminosity?'
  },
]

export default function ScenarioSimulator() {
  const [activeScenario, setActiveScenario] = useState(null)
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScenario = async (scenario) => {
    // 1. Trigger the 3D visual effect immediately
    triggerEffect(scenario.effect)
    setActiveScenario(scenario)
    setAiResponse('')
    setLoading(true)

    // 2. Call Gemini API (or your FastAPI backend)
    try {
      const response = await fetch('/api/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario.description })
      })
      const data = await response.json()
      setAiResponse(data.explanation)
    } catch (err) {
      setAiResponse('Could not load AI explanation. Visual effect is still active.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    triggerEffect(null)        // clears the effect in SolarSystem
    setActiveScenario(null)
    setAiResponse('')
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 p-8 flex flex-col justify-between">

      {/* Metrics Panel */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl w-72 shadow-[0_4px_30px_rgba(0,0,0,0.1)] pointer-events-auto">
        <h3 className="font-heading text-lg tracking-[0.2em] mb-6 text-white/80">SYSTEM METRICS</h3>

        <div className="flex flex-col gap-4 font-sans text-xs tracking-wider text-white/60">
          <div className="flex justify-between items-center">
            <span>SOLAR MASS:</span>
            <span className="text-white/90">1.0 M☉</span>
          </div>
          <div className="flex justify-between items-center">
            <span>LUMINOSITY:</span>
            <span className="text-white/90">3.828 × 10²⁶ W</span>
          </div>
          <div className="flex justify-between items-center">
            <span>STATUS:</span>
            <span className={activeScenario ? 'text-red-400' : 'text-[#a1e5e0]'}>
              {activeScenario ? 'SCENARIO ACTIVE' : 'STABLE'}
            </span>
          </div>
        </div>

        {/* AI Response Box - appears after scenario triggered */}
        {(loading || aiResponse) && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/70 leading-relaxed">
            {loading ? (
              <span className="animate-pulse">Analyzing scenario...</span>
            ) : (
              aiResponse
            )}
          </div>
        )}
      </div>

      {/* Scenario Buttons */}
      <div className="flex flex-wrap justify-center gap-4 pointer-events-auto mb-4">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.effect}
            onClick={() => handleScenario(scenario)}
            className={`
              px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-300
              text-xs tracking-widest shadow-[0_4px_30px_rgba(0,0,0,0.1)]
              ${activeScenario?.effect === scenario.effect
                ? 'bg-white/20 border-white/50 text-white'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 text-white/80'
              }
            `}
          >
            {scenario.label}
          </button>
        ))}

        {/* Reset button - only shows when a scenario is active */}
        {activeScenario && (
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-2xl backdrop-blur-xl bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 transition-all duration-300 text-xs tracking-widest text-red-300"
          >
            RESET
          </button>
        )}
      </div>

    </div>
  )
}