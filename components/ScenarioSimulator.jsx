'use client'

import { useState, useRef } from 'react'
import { triggerEffect, resetAll } from '@/components/SolarSystem'


const SCENARIOS = [
  {
    id: 'two-moons',
    label: 'Two Moons',
    question: 'What if Earth had two moons?',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.3)',
  },
  {
    id: 'jupiter-disappear',
    label: 'Jupiter Vanishes',
    question: 'What if Jupiter disappeared?',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'asteroid-hit-mars',
    label: 'Asteroid Strikes',
    question: 'What if an asteroid hit Mars?',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
  },
  {
    id: 'sun-brighter',
    label: 'Sun Gets Brighter',
    question: 'What if the Sun became brighter?',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.3)',
  },
]

export default function ScenarioSimulator({ onScenarioSelect }) {
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const speak = (text, delayMs = 0) => {
    stopSpeaking()
    if (!('speechSynthesis' in window)) return

    const run = () => {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate  = 1.05
      utter.pitch = 1.0
      // Prefer a natural-sounding voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v =>
        /google|natural|premium|enhanced/i.test(v.name)
      ) || voices.find(v => v.lang.startsWith('en')) || null
      if (preferred) utter.voice = preferred
      utter.onstart  = () => setSpeaking(true)
      utter.onend    = () => setSpeaking(false)
      utter.onerror  = () => setSpeaking(false)
      utteranceRef.current = utter
      window.speechSynthesis.speak(utter)
    }

    if (delayMs > 0) {
      setTimeout(run, delayMs)
    } else {
      run()
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    utteranceRef.current = null
    setSpeaking(false)
  }


  const handleScenario = async (scenario) => {
    stopSpeaking()
    setActiveId(scenario.id)
    setResult(null)
    setError(null)
    setLoading(true)
    triggerEffect(scenario.id)

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenario.id }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      onScenarioSelect?.(scenario.id)
      if (data.explanation) {
        speak(data.explanation, scenario.id === 'asteroid-hit-mars' ? 2200 : 0)
      }
    } catch (err) {
      setError('Could not reach AI. Visual effect is still active.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    stopSpeaking()
    resetAll()
    setActiveId(null)
    setResult(null)
    setError(null)
    setLoading(false)
  }

  const active = SCENARIOS.find(s => s.id === activeId)

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>


      {/* ── Scenario Cards (left panel) ─────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'auto',
        width: '220px',
      }}>
        <div style={{
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '4px',
          paddingLeft: '2px',
        }}>
          ✦ AI SCENARIO SIMULATOR
        </div>

        {SCENARIOS.map(s => {
          const isActive = s.id === activeId
          return (
            <button
              key={s.id}
              onClick={() => handleScenario(s)}
              style={{
                padding: '11px 14px',
                borderRadius: '12px',
                border: isActive ? `1.5px solid ${s.color}99` : '1.5px solid rgba(255,255,255,0.1)',
                background: isActive
                  ? `linear-gradient(135deg, ${s.color}20 0%, ${s.color}08 100%)`
                  : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)',
                color: isActive ? s.color : 'rgba(255,255,255,0.7)',
                fontSize: '11px',
                letterSpacing: '0.05em',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 0 20px ${s.glow}` : 'none',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 400 }}>{s.question}</div>
            </button>
          )
        })}

        {/* Reset button */}
        <button
          onClick={handleReset}
          title="Reset"
          style={{
            marginTop: '4px',
            alignSelf: 'flex-start',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: activeId ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
            background: activeId ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            color: activeId ? '#fca5a5' : 'rgba(255,255,255,0.3)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ↺
        </button>
      </div>

      {/* ── Result Panel (right side) ────────────────────────────────── */}
      {(loading || result || error) && (
        <div style={{
          position: 'absolute',
          right: '24px',
          top: '80px',
          bottom: '80px',
          width: '300px',
          pointerEvents: 'auto',
          background: 'rgba(4,7,20,0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${active?.color ?? 'rgba(255,255,255,0.12)'}44`,
          borderRadius: '16px',
          padding: '20px',
          boxShadow: `0 0 40px ${active?.glow ?? 'transparent'}`,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: active?.color ?? 'rgba(255,255,255,0.4)' }}>
              ✦ AI ANALYSIS
            </div>
            {result && (
              <button
                onClick={() => {
                  if (speaking) { stopSpeaking(); return }
                  speak(result.explanation)
                }}
                style={{
                  background: 'none', border: `1px solid ${active?.color ?? 'rgba(255,255,255,0.2)'}55`,
                  borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                  color: speaking ? active?.color : 'rgba(255,255,255,0.4)',
                  fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                }}
              >
                {speaking ? '⏹ stop' : '🔊 speak'}
              </button>
            )}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${active?.color ?? '#fff'}33`,
                borderTopColor: active?.color ?? '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0,
              }} />
              Analysing cosmic scenario…
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <p style={{ color: 'rgba(255,100,100,0.8)', fontSize: '12px', lineHeight: 1.6 }}>{error}</p>
          )}

          {/* Result */}
          {result && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Explanation */}
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '12px', lineHeight: 1.7 }}>
                {result.explanation}
              </p>

              {/* Impact analysis */}
              {result.impact?.length > 0 && (
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '7px' }}>
                    IMPACT ANALYSIS
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {result.impact.map((point, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                        <span style={{ color: active?.color, flexShrink: 0, marginTop: '1px' }}>▸</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline */}
              {result.timeline && (
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                    FUTURE TIMELINE
                  </div>
                  {[
                    { label: '1 YEAR', value: result.timeline.oneYear },
                    { label: '10 YEARS', value: result.timeline.tenYears },
                    { label: '100 YEARS', value: result.timeline.hundredYears },
                  ].map(({ label, value }) => value && (
                    <div key={label} style={{ marginBottom: '8px', paddingLeft: '10px', borderLeft: `2px solid ${active?.color}55` }}>
                      <div style={{ fontSize: '9px', color: active?.color, letterSpacing: '0.12em', marginBottom: '3px' }}>{label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  )
}
