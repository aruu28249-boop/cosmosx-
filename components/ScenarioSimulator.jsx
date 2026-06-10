'use client'
import { useState } from 'react'
import { triggerEffect, resetAll } from '@/components/SolarSystem'

const SCENARIOS = [
  {
    id: 'jupiter-disappear',
    label: 'JUPITER VANISHES',
    icon: '💫',
    description: 'What if Jupiter suddenly vanished from the solar system?',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
  },
  {
    id: 'asteroid-hit-mars',
    label: 'ASTEROID STRIKES',
    icon: '☄️',
    description: 'What if a massive asteroid collided with Mars?',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.35)',
  },
  {
    id: 'two-moons',
    label: 'TWO MOONS',
    icon: '🌕',
    description: 'What if Earth had a second moon in orbit?',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.35)',
  },
]

export default function ScenarioSimulator() {
  const [activeId, setActiveId] = useState(null)
  const [aiText,   setAiText]   = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleScenario = async (scenario) => {
    triggerEffect(scenario.id)
    setActiveId(scenario.id)
    setAiText('')
    setLoading(true)

    try {
      const res  = await fetch('/api/scenario', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ scenario: scenario.description }),
      })
      const data = await res.json()
      setAiText(data.explanation ?? 'No explanation returned.')
    } catch {
      setAiText('Could not reach AI service. Visual effect is still active.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    resetAll()          // resets effects + camera + selected planet
    setActiveId(null)
    setAiText('')
    setLoading(false)
  }

  const activeScenario = SCENARIOS.find(s => s.id === activeId)

  return (
    /* Full-screen overlay, pointer-events off by default */
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      zIndex: 20,
    }}>

      {/* ══ LEFT PANEL ════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto',
        width: '210px',
      }}>

        {/* Panel header */}
        <div style={{
          fontSize: '10px',
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'sans-serif',
          paddingLeft: '4px',
          marginBottom: '2px',
        }}>
          ✦ SCENARIOS
        </div>

        {/* Scenario buttons — stacked vertically */}
        {SCENARIOS.map(s => {
          const isActive = s.id === activeId
          return (
            <button
              key={s.id}
              onClick={() => handleScenario(s)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '14px',
                border: isActive
                  ? `1.5px solid ${s.color}aa`
                  : '1.5px solid rgba(255,255,255,0.12)',
                background: isActive
                  ? `linear-gradient(135deg, ${s.color}22 0%, ${s.color}0a 100%)`
                  : 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(14px)',
                color: isActive ? s.color : 'rgba(255,255,255,0.75)',
                fontSize: '11px',
                fontFamily: 'sans-serif',
                letterSpacing: '0.1em',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 0 18px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          )
        })}

        {/* ── AI Analysis card ───────────────────────────────────────── */}
        {(loading || aiText) && (
          <div style={{
            marginTop: '6px',
            padding: '13px 15px',
            borderRadius: '14px',
            background: 'rgba(5,8,22,0.90)',
            backdropFilter: 'blur(18px)',
            border: `1px solid ${activeScenario?.color ?? 'rgba(255,255,255,0.12)'}55`,
            boxShadow: `0 0 30px ${activeScenario?.glow ?? 'transparent'}`,
            color: 'rgba(255,255,255,0.82)',
            fontFamily: 'sans-serif',
            fontSize: '12px',
            lineHeight: '1.7',
            letterSpacing: '0.02em',
          }}>
            <div style={{
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: activeScenario?.color ?? 'rgba(255,255,255,0.4)',
              marginBottom: '7px',
              opacity: 0.85,
            }}>
              ✦ AI ANALYSIS
            </div>
            {loading
              ? <span style={{ opacity: 0.55, fontStyle: 'italic' }}>Analysing cosmic scenario…</span>
              : aiText
            }
          </div>
        )}

        {/* ── Reset icon button ──────────────────────────────────────── */}
        <button
          onClick={handleReset}
          title="Reset effects, camera & view"
          style={{
            marginTop: '8px',
            alignSelf: 'flex-start',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: activeId
              ? '1.5px solid rgba(239,68,68,0.55)'
              : '1.5px solid rgba(255,255,255,0.13)',
            background: activeId
              ? 'rgba(239,68,68,0.18)'
              : 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            color: activeId ? '#fca5a5' : 'rgba(255,255,255,0.3)',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: activeId ? '0 0 16px rgba(239,68,68,0.35)' : 'none',
            lineHeight: 1,
          }}
        >
          ↺
        </button>

      </div>
      {/* ══ END LEFT PANEL ════════════════════════════════════════════════ */}

    </div>
  )
}