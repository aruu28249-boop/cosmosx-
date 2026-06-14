'use client'

import { useState, useRef, useCallback } from 'react'
import { triggerEffect, resetAll, setTimeMachineDate } from '@/components/SolarSystem'
import { RotateCcw, RefreshCw, Sparkles, Flame, Link2, Volume2, Square, Check, X, ChevronRight, Diamond, Layers } from 'lucide-react'
import { QUIZ_QUESTIONS } from '@/data/quizQuestions'

function pickTenQuestions() {
  return [...QUIZ_QUESTIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map(q => {
      const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
      return {
        ...q,
        options: order.map(i => q.options[i]),
        correct: order.indexOf(q.correct),
      }
    })
}

function quizRating(score) {
  if (score === 10) return { label: 'Perfect! 🚀 Cosmic Genius', color: '#c084fc' }
  if (score >= 8)  return { label: 'Stellar! ⭐ Space Expert',  color: '#818cf8' }
  if (score >= 6)  return { label: 'Great! 🌙 Star Cadet',      color: '#34d399' }
  if (score >= 4)  return { label: 'Not bad! 🪐 Space Tourist',  color: '#60a5fa' }
  return             { label: 'Keep exploring! ☄️ Earthling',    color: '#f87171' }
}

const SCENARIOS = [
  { id: 'two-moons',         label: 'Two Moons',         question: 'What if Earth had two moons?',                      color: '#a78bfa', glow: 'rgba(167,139,250,0.25)' },
  { id: 'jupiter-disappear', label: 'Jupiter Vanishes',  question: 'What if Jupiter disappeared?',                      color: '#f59e0b', glow: 'rgba(245,158,11,0.25)'  },
  { id: 'asteroid-hit-mars', label: 'Asteroid Strikes',  question: 'What if an asteroid hit Mars?',                     color: '#ef4444', glow: 'rgba(239,68,68,0.25)'   },
  { id: 'sun-brighter',      label: 'Sun Gets Brighter', question: 'What if the Sun became brighter?',                  color: '#fbbf24', glow: 'rgba(251,191,36,0.25)'  },
  { id: 'rogue-planet',      label: 'Rogue Planet',      question: 'What if a rogue planet entered our solar system?',  color: '#7c3aed', glow: 'rgba(124,58,237,0.25)'  },
  { id: 'sun-dies',          label: 'Sun Dies Out',      question: 'What if the Sun started dying?',                    color: '#dc2626', glow: 'rgba(220,38,38,0.25)'   },
  { id: 'earth-stops',       label: 'Earth Stops',       question: 'What if Earth stopped rotating?',                   color: '#0ea5e9', glow: 'rgba(14,165,233,0.25)'  },
  { id: 'solar-flare',       label: 'Solar Flare',       question: 'What if a massive solar flare hit Earth?',          color: '#f97316', glow: 'rgba(249,115,22,0.25)'  },
]

function pickEffect(q) {
  const s = q.toLowerCase()
  if (s.includes('moon') || s.includes('lunar'))                                                                              return 'two-moons'
  if (s.includes('jupiter') || s.includes('vanish') || s.includes('disappear') || s.includes('gas giant'))                   return 'jupiter-disappear'
  if (s.includes('asteroid') || s.includes('comet') || s.includes('impact') || s.includes('hit') || s.includes('meteor'))    return 'asteroid-hit-mars'
  if (s.includes('rogue') || s.includes('interloper') || s.includes('foreign planet') || s.includes('nomad planet'))         return 'rogue-planet'
  if (s.includes('dies') || s.includes('dying') || s.includes('dead') || s.includes('expan') || s.includes('red giant') || s.includes('collapse') || s.includes('supernova')) return 'sun-dies'
  if (s.includes('stop') || s.includes('rotat') || s.includes('spin') || s.includes('tidal lock'))                           return 'earth-stops'
  if (s.includes('flare') || s.includes('cme') || s.includes('coronal') || s.includes('geomagnetic') || s.includes('storm')) return 'solar-flare'
  if (s.includes('sun') || s.includes('solar') || s.includes('bright') || s.includes('hot') || s.includes('star'))           return 'sun-brighter'
  return null
}

const HR = <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />

// ── Quiz helpers ──────────────────────────────────────────────────────────────
function loadQuizStore() {
  try { return JSON.parse(localStorage.getItem('cosmosx_quiz') ?? '{}') } catch { return {} }
}
function saveQuizStore(obj) {
  try { localStorage.setItem('cosmosx_quiz', JSON.stringify(obj)) } catch {}
}

// ── Shared panel styles ───────────────────────────────────────────────────────
const panelBase = {
  position: 'absolute', right: '24px', top: '80px', bottom: '80px', width: '300px',
  pointerEvents: 'auto',
  background: 'rgba(3,5,18,0.95)', backdropFilter: 'blur(24px)',
  borderRadius: '18px', padding: '20px',
  overflowY: 'auto', scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255,255,255,0.08) transparent',
}

export default function ScenarioSimulator({ onScenarioSelect }) {
  // ── Scenario state ────────────────────────────────────────────────────────
  const [activeId,    setActiveId]    = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [error,       setError]       = useState(null)
  const [speaking,    setSpeaking]    = useState(false)
  const audioRef      = useRef(null)
  // Generation counter — incremented on every new runScenario / reset call.
  // Stale async completions compare their captured gen to this and bail early.
  const generationRef = useRef(0)

  // ── Custom question ───────────────────────────────────────────────────────
  const [customQ,         setCustomQ]         = useState('')
  const [customSending,   setCustomSending]   = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // ── Time machine ──────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear()
  const [tmOpen,    setTmOpen]    = useState(false)
  const [tmYear,    setTmYear]    = useState(currentYear)
  const [tmEvent,   setTmEvent]   = useState(null)
  const [tmLoading, setTmLoading] = useState(false)
  const tmTimeoutRef = useRef(null)

  // ── Share ─────────────────────────────────────────────────────────────────
  const [copied,     setCopied]     = useState(false)
  const [quizCopied, setQuizCopied] = useState(false)

  // ── Quiz ──────────────────────────────────────────────────────────────────
  const [quizOpen,      setQuizOpen]      = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizIndex,     setQuizIndex]     = useState(0)
  const [quizAnswers,   setQuizAnswers]   = useState([])
  const [quizDone,      setQuizDone]      = useState(false)
  const [streak,        setStreak]        = useState(0)

  // ── TTS ───────────────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setSpeaking(false)
  }, [])

  // speak(text, gen) — starts streaming TTS audio.
  // gen must equal generationRef.current when the TTS fetch resolves,
  // otherwise the result is silently discarded (user already moved to a new card).
  const speak = useCallback(async (text, gen) => {
    stopSpeaking()
    setSpeaking(true)
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('TTS failed')

      // Guard: if user switched cards while the TTS fetch was in flight, discard.
      if (gen !== generationRef.current) { setSpeaking(false); return }

      // Stream via MediaSource so playback starts with the first chunk
      // (much lower latency than waiting for the full blob).
      const mediaSource = new MediaSource()
      const url = URL.createObjectURL(mediaSource)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url) }

      mediaSource.addEventListener('sourceopen', async () => {
        // Bail if stopSpeaking() was called before sourceopen fired
        if (audioRef.current !== audio) {
          try { mediaSource.endOfStream() } catch {}
          URL.revokeObjectURL(url)
          return
        }

        const sb = mediaSource.addSourceBuffer('audio/mpeg')
        const reader = res.body.getReader()
        let playTriggered = false

        const pump = async () => {
          const { done, value } = await reader.read()

          // Stop pumping if audio was replaced by a newer speak() call
          if (audioRef.current !== audio) {
            try { reader.cancel() } catch {}
            return
          }

          if (done) {
            if (!sb.updating) { try { mediaSource.endOfStream() } catch {} }
            else sb.addEventListener('updateend', () => { try { mediaSource.endOfStream() } catch {} }, { once: true })
            return
          }

          sb.appendBuffer(value)
          sb.addEventListener('updateend', async () => {
            // Trigger playback as soon as we have the first decoded chunk ready
            if (!playTriggered && audio.readyState >= 2) {
              playTriggered = true
              const p = audio.play()
              if (p) p.catch(() => { /* interrupted by stopSpeaking — safe to ignore */ })
            }
            await pump()
          }, { once: true })
        }
        await pump()
      }, { once: true })

    } catch { setSpeaking(false) }
  }, [stopSpeaking])

  // ── Core AI call ──────────────────────────────────────────────────────────
  const runScenario = useCallback(async ({ scenarioId, customQuestion, label, color }) => {
    // Stamp this invocation. If a newer call arrives before this fetch resolves,
    // the stale completion will see gen !== generationRef.current and bail out,
    // preventing mismatched or ghost voices.
    const gen = ++generationRef.current
    stopSpeaking()
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const body = customQuestion ? { customQuestion } : { scenarioId }
      const res  = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      // Stale response — a newer scenario was clicked while this was loading
      if (gen !== generationRef.current) return
      if (data.error) throw new Error(data.error)
      setResult({ ...data, label, color })
      onScenarioSelect?.(scenarioId ?? 'custom')
      if (data.explanation) {
        const parts = [data.explanation]
        if (data.impact?.length)         parts.push(data.impact.join('. '))
        if (data.timeline?.oneYear)      parts.push('In the first year: '      + data.timeline.oneYear)
        if (data.timeline?.tenYears)     parts.push('Over ten years: '         + data.timeline.tenYears)
        if (data.timeline?.hundredYears) parts.push('After a hundred years: '  + data.timeline.hundredYears)
        if (data.howItCouldHappen?.length) parts.push('How this could happen: ' + data.howItCouldHappen.join('. '))
        // Pass gen so speak() can discard itself if the user has already switched cards
        speak(parts.join('. '), gen)
      }
    } catch (err) {
      if (gen !== generationRef.current) return
      setError(err.message || 'Could not reach AI. Visual effect is still active.')
    } finally {
      if (gen === generationRef.current) setLoading(false)
    }
  }, [onScenarioSelect, speak, stopSpeaking])

  const handleScenario = (s) => {
    setActiveId(s.id)
    triggerEffect(s.id)
    runScenario({ scenarioId: s.id, label: s.label, color: s.color })
  }

  const handleCustomSubmit = async () => {
    if (!customQ.trim()) return
    setCustomSending(true)
    const effect = pickEffect(customQ)
    setActiveId('custom')
    if (effect) triggerEffect(effect)
    await runScenario({ customQuestion: customQ.trim(), label: 'Custom', color: '#60a5fa' })
    setCustomSending(false)
  }

  const handleTimeMachineChange = (year) => {
    setTmYear(year)
    if (year === currentYear) {
      setTimeMachineDate(null)
      setTmEvent(null)
      if (tmTimeoutRef.current) clearTimeout(tmTimeoutRef.current)
    } else {
      const now = new Date()
      setTimeMachineDate(new Date(year, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()))
      if (tmTimeoutRef.current) clearTimeout(tmTimeoutRef.current)
      setTmLoading(true)
      tmTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/time-machine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year }),
          })
          if (!res.ok) throw new Error('Failed to fetch event')
          const data = await res.json()
          setTmEvent(data.text)
        } catch (err) {
          console.error(err)
          setTmEvent('Temporal archives unavailable for this era.')
        } finally {
          setTmLoading(false)
        }
      }, 800)
    }
  }

  const handleReset = () => {
    generationRef.current++ // cancel any in-flight runScenario
    stopSpeaking()
    resetAll()
    setActiveId(null); setResult(null); setError(null); setLoading(false)
    setCustomQ(''); setTmOpen(false); setTmYear(currentYear); setTmEvent(null)
    if (tmTimeoutRef.current) clearTimeout(tmTimeoutRef.current)
  }

  const handleShare = () => {
    if (!result) return
    const lines = []
    lines.push(`CosmosX AI Scenario: ${result.label ?? 'Custom'}`)
    lines.push('')
    lines.push(result.explanation)
    if (result.impact?.length) {
      lines.push('')
      lines.push('Impact:')
      result.impact.forEach(pt => lines.push(`• ${pt}`))
    }
    if (result.timeline) {
      const tl = result.timeline
      lines.push('')
      lines.push('Timeline:')
      if (tl.oneYear)      lines.push(`1 Year: ${tl.oneYear}`)
      if (tl.tenYears)     lines.push(`10 Years: ${tl.tenYears}`)
      if (tl.hundredYears) lines.push(`100 Years: ${tl.hundredYears}`)
    }
    lines.push('')
    lines.push(`Explore at: ${window.location.origin}`)
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  const openQuiz = () => {
    setQuizQuestions(pickTenQuestions())
    setQuizIndex(0)
    setQuizAnswers([])
    setQuizDone(false)
    setQuizOpen(true)
  }

  const handleQuizAnswer = (i) => {
    if (quizAnswers[quizIndex] !== undefined) return
    const newAnswers = [...quizAnswers]
    newAnswers[quizIndex] = i
    setQuizAnswers(newAnswers)
  }

  const handleQuizNext = () => {
    if (quizIndex < 9) {
      setQuizIndex(q => q + 1)
    } else {
      const score = quizAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length
      if (score === 10) setStreak(s => s + 1); else setStreak(0)
      setQuizDone(true)
    }
  }

  const handleQuizPrev = () => {
    if (quizIndex > 0) setQuizIndex(q => q - 1)
  }

  const handleQuizShare = () => {
    if (!quizDone) return
    const score = quizAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length
    const rating = quizRating(score)
    const lines = [
      `CosmosX Space Quiz — ${score}/10`,
      rating.label,
      '',
      `Play at: ${window.location.origin}`,
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setQuizCopied(true)
      setTimeout(() => setQuizCopied(false), 2000)
    })
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const active    = SCENARIOS.find(s => s.id === activeId) ?? (activeId === 'custom' ? { color: '#60a5fa', glow: 'rgba(96,165,250,0.2)' } : null)
  const tmActive  = tmYear !== currentYear
  const showRight = quizOpen || loading || result || error

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <style>{`
        .cx-panel::-webkit-scrollbar { width: 3px; }
        .cx-panel::-webkit-scrollbar-track { background: transparent; }
        .cx-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        .cx-panel::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }
        .cx-scenario-btn:hover { filter: brightness(1.15); transform: translateX(2px); }
        .cx-quiz-opt:not(:disabled):hover { filter: brightness(1.12); transform: translateX(2px); }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes cx-pulse { 0%,100%{opacity:.7} 50%{opacity:1} }
      `}</style>

      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div className="cx-panel" style={{
        position: 'absolute', left: '20px', top: '72px', bottom: '100px',
        display: 'flex', flexDirection: 'column', gap: '9px',
        pointerEvents: 'auto', width: '256px',
        overflowY: 'auto', overflowX: 'hidden',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        paddingRight: '4px',
      }}>
        {/* Header */}
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', paddingLeft: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Sparkles size={9} /> AI SCENARIO SIMULATOR</span>
          <button onClick={handleReset} title="Reset" style={{
            width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
            border: activeId ? '1.5px solid rgba(239,68,68,0.45)' : '1.5px solid rgba(255,255,255,0.08)',
            background: activeId ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(8px)',
            color: activeId ? '#fca5a5' : 'rgba(255,255,255,0.35)',
            cursor: 'pointer', transition: 'all 0.25s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><RotateCcw size={13} /></button>
        </div>

        {/* Ask anything */}
        <div style={{ display: 'flex', gap: '7px', position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={customQ}
              onChange={e => setCustomQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setShowSuggestions(false); handleCustomSubmit() } }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="What if…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 14px', borderRadius: showSuggestions ? '12px 12px 0 0' : '12px',
                border: activeId === 'custom' ? '1.5px solid rgba(96,165,250,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
                color: 'rgba(255,255,255,0.85)', fontSize: '13px',
                outline: 'none', fontFamily: 'sans-serif', transition: 'border-radius 0.15s',
              }}
            />
            {showSuggestions && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.08)', borderTop: 'none',
                borderRadius: '0 0 12px 12px', overflow: 'hidden',
              }}>
                {[
                  'What if the Moon crashed into Earth?',
                  'What if there were no gravity?',
                  'What if Saturn lost its rings?',
                  'What if a black hole replaced the Sun?',
                  'What if Mars had oceans?',
                  'What if Venus and Earth swapped places?',
                  'What if the Sun exploded tomorrow?',
                  'What if Earth had two suns?',
                ].map(s => (
                  <div
                    key={s}
                    onMouseDown={() => { setCustomQ(s); setShowSuggestions(false) }}
                    style={{
                      padding: '9px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'sans-serif',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >{s}</div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleCustomSubmit} disabled={!customQ.trim() || customSending} style={{
            padding: '10px 14px', borderRadius: '12px',
            border: '1.5px solid rgba(96,165,250,0.35)',
            background: customQ.trim() && !customSending ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
            color: customQ.trim() && !customSending ? '#93c5fd' : 'rgba(255,255,255,0.35)',
            fontSize: '15px', cursor: customQ.trim() && !customSending ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
          }}>
            {customSending ? '…' : '›'}
          </button>
        </div>

        {SCENARIOS.map(s => {
          const isActive = s.id === activeId
          return (
            <button key={s.id} className="cx-scenario-btn" onClick={() => handleScenario(s)} style={{
              padding: '12px 16px', borderRadius: '13px',
              border: isActive ? `1.5px solid ${s.color}88` : '1.5px solid rgba(255,255,255,0.07)',
              background: isActive ? `linear-gradient(135deg, ${s.color}18 0%, ${s.color}07 100%)` : 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              color: isActive ? s.color : 'rgba(255,255,255,0.82)',
              fontSize: '13px', fontWeight: isActive ? '600' : '400',
              cursor: 'pointer', transition: 'all 0.22s ease',
              boxShadow: isActive ? `0 0 18px ${s.glow}` : 'none',
              textAlign: 'left', width: '100%',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '3px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.72, fontWeight: 400 }}>{s.question}</div>
            </button>
          )
        })}
      </div>

      {/* ── Time Machine popup ───────────────────────────────────────── */}
      {tmOpen && (
        <div style={{
          position: 'absolute', right: '24px', top: '80px', pointerEvents: 'auto', width: '300px',
          padding: '16px 18px', borderRadius: '16px',
          border: '1px solid rgba(52,211,153,0.18)',
          background: 'rgba(3,5,18,0.95)', backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(52,211,153,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={10} /> TIME MACHINE</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#6ee7b7' }}>{tmYear}</span>
          </div>
          <input type="range" min={1900} max={2200} value={tmYear}
            onChange={e => handleTimeMachineChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer', height: '3px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.18)' }}>
            <span>1900</span>
            <span style={{ color: tmActive ? 'transparent' : 'rgba(52,211,153,0.35)' }}>today</span>
            <span>2200</span>
          </div>

          {tmActive && (
            <div style={{
              padding: '8px 10px', borderRadius: '8px',
              background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)',
              minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {tmLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(52,211,153,0.5)', fontSize: '10px', letterSpacing: '0.1em' }}>
                  <div style={{ width: '10px', height: '10px', border: '1.5px solid rgba(52,211,153,0.25)', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  SYNCING TIMELINE...
                </div>
              ) : tmEvent ? (
                <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: '11px', lineHeight: 1.55 }}>
                  <div style={{ fontSize: '8px', color: '#34d399', letterSpacing: '0.15em', marginBottom: '3px' }}>TEMPORAL LOG:</div>
                  {tmEvent}
                </div>
              ) : null}
            </div>
          )}

          {tmActive && (
            <button onClick={() => handleTimeMachineChange(currentYear)} style={{
              padding: '5px', borderRadius: '7px',
              border: '1px solid rgba(52,211,153,0.2)', background: 'transparent',
              color: 'rgba(52,211,153,0.6)', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.06em',
            }}>‹ Back to Today</button>
          )}
        </div>
      )}

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '80px', left: '50%',
        transform: 'translateX(-50%)', pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '7px 12px', borderRadius: '40px',
        background: 'rgba(3,5,18,0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <button onClick={() => setTmOpen(o => !o)} style={{
          padding: '8px 17px', borderRadius: '22px',
          border: tmActive ? '1.5px solid rgba(52,211,153,0.45)' : '1px solid rgba(255,255,255,0.08)',
          background: tmActive ? 'rgba(52,211,153,0.1)' : tmOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
          color: tmActive ? '#6ee7b7' : 'rgba(255,255,255,0.75)',
          fontSize: '12px', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <RefreshCw size={12} />{tmActive ? tmYear : 'TIME'}
        </button>
        <button onClick={openQuiz} style={{
          padding: '8px 17px', borderRadius: '22px',
          border: '1.5px solid rgba(129,140,248,0.35)',
          background: quizOpen ? 'rgba(129,140,248,0.18)' : 'rgba(129,140,248,0.07)',
          color: '#a5b4fc',
          fontSize: '12px', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Sparkles size={12} /> QUIZ{streak > 0 ? <>{` ${streak}`}<Flame size={12} /></> : ''}
        </button>
      </div>

      {/* ── Right Panel: Quiz or AI Result ──────────────────────────────── */}
      {showRight && (
        <>
          {/* Backdrop — clicking outside the panel closes it and reverses any active effect */}
          <div
            onClick={() => {
              if (quizOpen) { setQuizOpen(false); return }
              generationRef.current++ // cancel any in-flight runScenario
              stopSpeaking()
              setResult(null); setError(null); setLoading(false); setActiveId(null)
              // Also reset the 3D solar-system effect so visuals are fully reversed
              resetAll()
            }}
            style={{ position: 'fixed', inset: 0, pointerEvents: 'auto', cursor: 'default' }}
          />

          <div className="cx-panel" style={{
            ...panelBase,
            border: quizOpen
              ? '1px solid rgba(129,140,248,0.2)'
              : `1px solid ${active?.color ?? 'rgba(255,255,255,0.1)'}33`,
            boxShadow: quizOpen
              ? '0 8px 48px rgba(129,140,248,0.08), 0 0 0 1px rgba(129,140,248,0.05)'
              : `0 8px 48px rgba(0,0,0,0.6), 0 0 32px ${active?.glow ?? 'transparent'}`,
          }}>

            {/* ── Quiz Content ─────────────────────────────────────── */}
            {quizOpen && (() => {
              const q         = quizQuestions[quizIndex]
              const answered  = quizAnswers[quizIndex] !== undefined
              const chosen    = quizAnswers[quizIndex]
              const score     = quizDone ? quizAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length : 0
              const rating    = quizDone ? quizRating(score) : null

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(129,140,248,0.65)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={9} /> SPACE QUIZ
                    </div>
                    <button onClick={() => setQuizOpen(false)} style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px', color: 'rgba(255,255,255,0.4)',
                      width: '26px', height: '26px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><X size={12} /></button>
                  </div>

                  {!quizDone ? (
                    <>
                      {/* Progress bar */}
                      <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                        {Array.from({ length: 10 }, (_, i) => {
                          const ans    = quizAnswers[i]
                          const isRight = ans === quizQuestions[i]?.correct
                          return (
                            <div key={i} style={{
                              flex: 1, height: '3px', borderRadius: '2px',
                              background: i < quizIndex
                                ? (isRight ? 'rgba(52,211,153,0.85)' : 'rgba(239,68,68,0.75)')
                                : i === quizIndex
                                  ? 'rgba(129,140,248,0.8)'
                                  : 'rgba(255,255,255,0.08)',
                              transition: 'background 0.3s',
                            }} />
                          )
                        })}
                      </div>

                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', letterSpacing: '0.05em' }}>
                        Question {quizIndex + 1} of 10
                      </div>

                      <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', marginBottom: '16px', fontWeight: 500 }}>
                        {q?.q}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q?.options.map((opt, i) => {
                          const OPT_COLORS = [
                            { color: '#a78bfa', glow: 'rgba(167,139,250,0.22)' },
                            { color: '#38bdf8', glow: 'rgba(56,189,248,0.22)'  },
                            { color: '#34d399', glow: 'rgba(52,211,153,0.22)'  },
                            { color: '#fbbf24', glow: 'rgba(251,191,36,0.22)'  },
                          ]
                          const isCorrect = answered && i === q.correct
                          const isWrong   = answered && i === chosen && i !== q.correct
                          const accent    = OPT_COLORS[i]

                          const border = isCorrect
                            ? '1.5px solid rgba(52,211,153,0.75)'
                            : isWrong
                              ? '1.5px solid rgba(239,68,68,0.65)'
                              : `1.5px solid ${accent.color}55`

                          const bg = isCorrect
                            ? 'linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(52,211,153,0.07) 100%)'
                            : isWrong
                              ? 'linear-gradient(135deg, rgba(239,68,68,0.16) 0%, rgba(239,68,68,0.06) 100%)'
                              : `linear-gradient(135deg, ${accent.color}12 0%, ${accent.color}05 100%)`

                          const labelColor = isCorrect ? '#34d399' : isWrong ? '#f87171' : accent.color
                          const textColor  = isCorrect ? '#6ee7b7'  : isWrong ? '#fca5a5'  : 'rgba(255,255,255,0.88)'

                          const shadow = isCorrect
                            ? '0 0 18px rgba(52,211,153,0.22)'
                            : isWrong
                              ? '0 0 18px rgba(239,68,68,0.18)'
                              : `0 0 12px ${accent.glow}`

                          return (
                            <button key={i} className="cx-quiz-opt" onClick={() => handleQuizAnswer(i)} disabled={answered} style={{
                              padding: '12px 14px', borderRadius: '13px',
                              border, background: bg, backdropFilter: 'blur(16px)',
                              color: textColor, boxShadow: shadow,
                              textAlign: 'left', width: '100%',
                              cursor: answered ? 'default' : 'pointer',
                              transition: 'all 0.22s ease', fontFamily: 'sans-serif',
                            }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: labelColor, marginBottom: '4px', letterSpacing: '0.1em' }}>
                                {['A','B','C','D'][i]}
                              </div>
                              <div style={{ fontSize: '12px', lineHeight: 1.5, fontWeight: isCorrect || isWrong ? 500 : 400 }}>
                                {opt}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {answered && q?.fact && (
                        <div style={{
                          marginTop: '12px', padding: '9px 11px', borderRadius: '9px',
                          background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.12)',
                          fontSize: '11px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.6,
                        }}>
                          <Sparkles size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px', color: '#818cf8' }} />
                          {q.fact}
                        </div>
                      )}

                      {/* Nav buttons */}
                      <div style={{ display: 'flex', gap: '7px', marginTop: '14px' }}>
                        <button
                          onClick={handleQuizPrev}
                          disabled={quizIndex === 0}
                          style={{
                            flex: 1, padding: '8px', borderRadius: '9px', cursor: quizIndex === 0 ? 'default' : 'pointer',
                            border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.03)',
                            color: quizIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)',
                            fontSize: '12px', transition: 'all 0.2s',
                          }}
                        >‹ Prev</button>
                        <button
                          onClick={handleQuizNext}
                          disabled={!answered}
                          style={{
                            flex: 1, padding: '8px', borderRadius: '9px', cursor: answered ? 'pointer' : 'default',
                            border: `1px solid ${answered ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.06)'}`,
                            background: answered ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.02)',
                            color: answered ? '#a5b4fc' : 'rgba(255,255,255,0.2)',
                            fontSize: '12px', transition: 'all 0.2s',
                          }}
                        >{quizIndex === 9 ? 'Finish ✓' : 'Next ›'}</button>
                      </div>
                    </>
                  ) : (
                    /* Score screen */
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <div style={{ fontSize: '58px', fontWeight: 800, color: rating.color, lineHeight: 1, marginBottom: '6px' }}>
                        {score}<span style={{ fontSize: '24px', opacity: 0.4 }}>/10</span>
                      </div>
                      <div style={{ fontSize: '13px', color: rating.color, marginBottom: '20px', letterSpacing: '0.04em' }}>
                        {rating.label}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', marginBottom: '18px' }}>
                        {quizQuestions.map((qq, i) => {
                          const right = quizAnswers[i] === qq.correct
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'flex-start', gap: '7px',
                              padding: '7px 9px', borderRadius: '8px',
                              background: right ? 'rgba(52,211,153,0.06)' : 'rgba(239,68,68,0.06)',
                              border: `1px solid ${right ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)'}`,
                              fontSize: '11px',
                            }}>
                              <span style={{ flexShrink: 0, marginTop: '2px', color: right ? '#34d399' : '#f87171' }}>
                                {right ? <Check size={11} /> : <X size={11} />}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.45 }}>
                                {qq.q}
                                {!right && (
                                  <span style={{ display: 'block', color: '#34d399', marginTop: '2px', fontSize: '10px' }}>
                                    ✓ {qq.options[qq.correct]}
                                  </span>
                                )}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: '7px', justifyContent: 'center' }}>
                        <button onClick={openQuiz} style={{
                          padding: '8px 18px', borderRadius: '10px', cursor: 'pointer',
                          border: '1px solid rgba(129,140,248,0.35)', background: 'rgba(129,140,248,0.1)',
                          color: '#a5b4fc', fontSize: '11px', letterSpacing: '0.06em',
                        }}>Play Again</button>
                        <button onClick={handleQuizShare} style={{
                          padding: '8px 18px', borderRadius: '10px', cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                          color: quizCopied ? '#6ee7b7' : 'rgba(255,255,255,0.4)',
                          fontSize: '11px', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px',
                        }}>
                          {quizCopied ? <><Check size={10} /> Copied!</> : <><Link2 size={10} /> Share</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── AI Result Content ─────────────────────────────── */}
            {!quizOpen && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.22em', color: active?.color ?? 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={9} /> AI ANALYSIS
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {(activeId || customQ.trim()) && (
                      <button onClick={handleShare} style={{
                        background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                        color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.55)',
                        fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                      }}>
                        {copied ? <><Check size={10} /> copied</> : <><Link2 size={10} /> share</>}
                      </button>
                    )}
                    {result && (
                      <button onClick={() => { if (speaking) { stopSpeaking(); return } speak(result.explanation) }}
                        style={{
                          background: 'none', border: `1px solid ${active?.color ?? 'rgba(255,255,255,0.18)'}44`,
                          borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                          color: speaking ? active?.color : 'rgba(255,255,255,0.55)',
                          fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                        }}>
                        {speaking ? <><Square size={10} /> stop</> : <><Volume2 size={10} /> speak</>}
                      </button>
                    )}
                  </div>
                </div>

                {result?.label && (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: active?.color ?? 'rgba(255,255,255,0.5)', marginBottom: '10px', opacity: 0.85 }}>
                    {result.label}
                  </div>
                )}

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>
                    <div style={{
                      width: '16px', height: '16px', flexShrink: 0,
                      border: `2px solid ${active?.color ?? '#fff'}22`, borderTopColor: active?.color ?? '#fff',
                      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    }} />
                    Analysing cosmic scenario…
                  </div>
                )}

                {error && !loading && (
                  <p style={{ color: 'rgba(248,113,113,0.85)', fontSize: '12px', lineHeight: 1.6 }}>{error}</p>
                )}

                {result && !loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '12px', lineHeight: 1.7 }}>{result.explanation}</p>

                    {result.impact?.length > 0 && (
                      <div>
                        <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '7px' }}>IMPACT ANALYSIS</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {result.impact.map((pt, i) => (
                            <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>
                              <span style={{ color: active?.color, flexShrink: 0, display: 'flex', alignItems: 'center' }}><ChevronRight size={11} /></span>{pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.timeline && (
                      <div>
                        <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>FUTURE TIMELINE</div>
                        {[
                          { label: '1 YEAR',    value: result.timeline.oneYear },
                          { label: '10 YEARS',  value: result.timeline.tenYears },
                          { label: '100 YEARS', value: result.timeline.hundredYears },
                        ].map(({ label, value }) => value && (
                          <div key={label} style={{ marginBottom: '8px', paddingLeft: '10px', borderLeft: `2px solid ${active?.color}44` }}>
                            <div style={{ fontSize: '9px', color: active?.color, letterSpacing: '0.12em', marginBottom: '3px' }}>{label}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.howItCouldHappen?.length > 0 && (
                      <div>
                        <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Layers size={9} /> HOW IT COULD HAPPEN
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          {result.howItCouldHappen.map((item, i) => (
                            <div key={i} style={{
                              padding: '8px 11px', borderRadius: '8px',
                              background: `${active?.color ?? '#ffffff'}08`,
                              border: `1px solid ${active?.color ?? '#ffffff'}1a`,
                              fontSize: '11px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55,
                            }}>
                              <span style={{ color: active?.color, marginRight: '6px', display: 'inline-flex', alignItems: 'center' }}><Diamond size={9} /></span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
