'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { triggerEffect, resetAll, setTimeMachineDate } from '@/components/SolarSystem'
import { RotateCcw, RefreshCw, Sparkles, Flame, Link2, Volume2, Square, Check, X, ChevronRight, Diamond, Layers, Globe } from 'lucide-react'

const SCENARIOS = [
  { id: 'two-moons',         label: 'Two Moons',         question: 'What if Earth had two moons?',                      color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
  { id: 'jupiter-disappear', label: 'Jupiter Vanishes',  question: 'What if Jupiter disappeared?',                      color: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  { id: 'asteroid-hit-mars', label: 'Asteroid Strikes',  question: 'What if an asteroid hit Mars?',                     color: '#ef4444', glow: 'rgba(239,68,68,0.3)'   },
  { id: 'sun-brighter',      label: 'Sun Gets Brighter', question: 'What if the Sun became brighter?',                  color: '#fbbf24', glow: 'rgba(251,191,36,0.3)'  },
  { id: 'rogue-planet',      label: 'Rogue Planet',      question: 'What if a rogue planet entered our solar system?',  color: '#7c3aed', glow: 'rgba(124,58,237,0.3)'  },
  { id: 'sun-dies',          label: 'Sun Dies Out',      question: 'What if the Sun started dying?',                    color: '#dc2626', glow: 'rgba(220,38,38,0.3)'   },
  { id: 'earth-stops',       label: 'Earth Stops',       question: 'What if Earth stopped rotating?',                   color: '#0ea5e9', glow: 'rgba(14,165,233,0.3)'  },
  { id: 'solar-flare',       label: 'Solar Flare',       question: 'What if a massive solar flare hit Earth?',          color: '#f97316', glow: 'rgba(249,115,22,0.3)'  },
]

function pickEffect(q) {
  const s = q.toLowerCase()
  if (s.includes('moon') || s.includes('lunar'))                                                                            return 'two-moons'
  if (s.includes('jupiter') || s.includes('vanish') || s.includes('disappear') || s.includes('gas giant'))                 return 'jupiter-disappear'
  if (s.includes('asteroid') || s.includes('comet') || s.includes('impact') || s.includes('hit') || s.includes('meteor'))  return 'asteroid-hit-mars'
  if (s.includes('rogue') || s.includes('interloper') || s.includes('foreign planet') || s.includes('nomad planet'))       return 'rogue-planet'
  if (s.includes('dies') || s.includes('dying') || s.includes('dead') || s.includes('expan') || s.includes('red giant') || s.includes('collapse') || s.includes('supernova')) return 'sun-dies'
  if (s.includes('stop') || s.includes('rotat') || s.includes('spin') || s.includes('tidal lock'))                         return 'earth-stops'
  if (s.includes('flare') || s.includes('cme') || s.includes('coronal') || s.includes('geomagnetic') || s.includes('storm')) return 'solar-flare'
  if (s.includes('sun') || s.includes('solar') || s.includes('bright') || s.includes('hot') || s.includes('star'))         return 'sun-brighter'
  return null
}

const HR = <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '6px 0' }} />

// ── Quiz helpers ──────────────────────────────────────────────────────────────
function loadQuizStore() {
  try { return JSON.parse(localStorage.getItem('cosmosx_quiz') ?? '{}') } catch { return {} }
}
function saveQuizStore(obj) {
  try { localStorage.setItem('cosmosx_quiz', JSON.stringify(obj)) } catch {}
}

export default function ScenarioSimulator({ onScenarioSelect }) {
  // ── Scenario state ────────────────────────────────────────────────────────
  const [activeId,      setActiveId]      = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(null)
  const [error,         setError]         = useState(null)
  const [speaking,      setSpeaking]      = useState(false)
  const audioRef = useRef(null)
  const utteranceRef = useRef(null)

  // ── Custom question ───────────────────────────────────────────────────────
  const [customQ,         setCustomQ]         = useState('')
  const [customSending,   setCustomSending]   = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // ── Time machine ──────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear()
  const [tmOpen,  setTmOpen]  = useState(false)
  const [tmYear,  setTmYear]  = useState(currentYear)
  const [tmEvent, setTmEvent] = useState(null)
  const [tmLoading, setTmLoading] = useState(false)
  const tmTimeoutRef = useRef(null)

  // ── Share ─────────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false)
  const [quizCopied, setQuizCopied] = useState(false)

  // ── Quiz ──────────────────────────────────────────────────────────────────
  const [quizOpen,    setQuizOpen]    = useState(false)
  const [quizData,    setQuizData]    = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizSelected, setQuizSelected] = useState(null)
  const [streak,      setStreak]      = useState(0)
  const quizFetchedRef = useRef(false)

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speak = async (text) => {
    stopSpeaking()
    setSpeaking(true)
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('TTS failed')
      const mediaSource = new MediaSource()
      const url = URL.createObjectURL(mediaSource)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play()
      mediaSource.addEventListener('sourceopen', async () => {
        const sb = mediaSource.addSourceBuffer('audio/mpeg')
        const reader = res.body.getReader()
        const pump = async () => {
          const { done, value } = await reader.read()
          if (done) {
            if (!sb.updating) mediaSource.endOfStream()
            else sb.addEventListener('updateend', () => mediaSource.endOfStream(), { once: true })
            return
          }
          sb.appendBuffer(value)
          sb.addEventListener('updateend', pump, { once: true })
        }
        await pump()
      })
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url) }
    } catch { setSpeaking(false) }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setSpeaking(false)
  }

  // ── Core AI call ──────────────────────────────────────────────────────────
  const runScenario = useCallback(async ({ scenarioId, customQuestion, label, color }) => {
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
      if (data.error) throw new Error(data.error)
      setResult({ ...data, label, color })
      onScenarioSelect?.(scenarioId ?? 'custom')
      if (data.explanation) {
        const parts = [data.explanation]
        if (data.impact?.length)                         parts.push(data.impact.join('. '))
        if (data.timeline?.oneYear)                      parts.push('In the first year: '     + data.timeline.oneYear)
        if (data.timeline?.tenYears)                     parts.push('Over ten years: '        + data.timeline.tenYears)
        if (data.timeline?.hundredYears)                 parts.push('After a hundred years: ' + data.timeline.hundredYears)
        if (data.howItCouldHappen?.length)               parts.push('How this could happen: ' + data.howItCouldHappen.join('. '))
        speak(parts.join('. '))
      }
} catch (err) {
      setError(err.message || 'Could not reach AI. Visual effect is still active.')
    } finally {
      setLoading(false)
    }
  }, [onScenarioSelect, speak])

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
      // Use current month, day, and time but with the selected year
      const now = new Date()
      setTimeMachineDate(new Date(year, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()))
      
      // Debounce the AI fetch
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
    stopSpeaking()
    resetAll()
    setActiveId(null); setResult(null); setError(null); setLoading(false)
    setCustomQ(''); setTmOpen(false); setTmYear(currentYear); setTmEvent(null);
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
  useEffect(() => {
    const store = loadQuizStore()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(store.streak ?? 0)
  }, [])

  const openQuiz = async () => {
    setQuizOpen(true)
    if (quizFetchedRef.current) return
    quizFetchedRef.current = true
    setQuizLoading(true)
    try {
      const store = loadQuizStore()
      const today = new Date().toISOString().slice(0, 10)

      if (store.todayQuizDate === today && store.todayQuizData) {
        setQuizData(store.todayQuizData)
        if (store.date === today && store.answered) {
          setQuizSelected(store.selected)
        }
        setQuizLoading(false)
        return
      }

      const res = await fetch('/api/quiz')
      const data = await res.json()
      setQuizData(data)

      const updatedStore = {
        ...store,
        todayQuizDate: today,
        todayQuizData: data
      }

      if (store.date === today) {
        updatedStore.answered = false
        updatedStore.selected = null
      }

      saveQuizStore(updatedStore)
    } catch {}
    finally { setQuizLoading(false) }
  }

  const handleQuizAnswer = (i) => {
    if (quizSelected !== null || !quizData) return
    setQuizSelected(i)

    const today = new Date().toISOString().slice(0, 10)
    const store = loadQuizStore()
    const isCorrect = i === quizData.correct

    // Streak: consecutive correct days
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const prevDay = yesterday.toISOString().slice(0, 10)
    let newStreak = 0;
    if (isCorrect) {
      if (store.date === prevDay && store.correct) {
        newStreak = (store.streak ?? 0) + 1;
      } else if (store.date === today && store.correct) {
        newStreak = store.streak ?? 1;
      } else {
        newStreak = 1;
      }
    }

    saveQuizStore({ 
      ...store, 
      date: today, 
      answered: true, 
      selected: i, 
      correct: isCorrect, 
      streak: newStreak 
    })
    setStreak(newStreak)
  }

  const handleQuizShare = () => {
    if (!quizData || quizSelected === null) return
    const isCorrect = quizSelected === quizData.correct
    const letters = ['A', 'B', 'C', 'D']
    const lines = []
    lines.push('CosmosX Daily Space Quiz')
    lines.push('')
    lines.push(`Q: ${quizData.question}`)
    lines.push('')
    lines.push(`My answer: ${letters[quizSelected]}. ${quizData.options[quizSelected]} ${isCorrect ? '(Correct)' : '(Wrong)'}`)
    if (!isCorrect) {
      lines.push(`Correct answer: ${letters[quizData.correct]}. ${quizData.options[quizData.correct]}`)
    }
    lines.push('')
    lines.push(quizData.explanation)
    if (quizData.fact) {
      lines.push('')
      lines.push(quizData.fact)
    }
    lines.push('')
    lines.push(`Play at: ${window.location.origin}`)
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setQuizCopied(true)
      setTimeout(() => setQuizCopied(false), 2000)
    })
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const active   = SCENARIOS.find(s => s.id === activeId) ?? (activeId === 'custom' ? { color: '#60a5fa', glow: 'rgba(96,165,250,0.3)' } : null)
  const tmActive = tmYear !== currentYear

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      <style>{`
        .cosmosx-panel::-webkit-scrollbar { width: 3px; }
        .cosmosx-panel::-webkit-scrollbar-track { background: transparent; }
        .cosmosx-panel::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 99px;
          transition: background 0.2s;
        }
        .cosmosx-panel::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.28); }
      `}</style>

      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div className="cosmosx-panel" style={{
        position: 'absolute', left: '20px', top: '72px', bottom: '100px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        pointerEvents: 'auto', width: '256px',
        overflowY: 'auto', overflowX: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.12) transparent',
        paddingRight: '4px',
      }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#ffffff', paddingLeft: '2px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Sparkles size={9} /> AI SCENARIO SIMULATOR</span>
          <button onClick={handleReset} title="Reset" style={{
            width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
            border: activeId ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.12)',
            background: activeId ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
            color: activeId ? '#fca5a5' : 'rgba(255,255,255,0.45)',
            cursor: 'pointer', transition: 'all 0.3s ease',
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
                border: activeId === 'custom' ? '1.5px solid #60a5fa66' : '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
                color: 'rgba(255,255,255,0.82)', fontSize: '13px',
                outline: 'none', fontFamily: 'sans-serif', transition: 'border-radius 0.15s',
              }}
            />
            {showSuggestions && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: 'rgba(8,10,22,0.96)', backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.1)', borderTop: 'none',
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
                ].map((s) => (
                  <div
                    key={s}
                    onMouseDown={() => { setCustomQ(s); setShowSuggestions(false) }}
                    style={{
                      padding: '9px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.75)',
                      cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'sans-serif',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleCustomSubmit} disabled={!customQ.trim() || customSending} style={{
            padding: '10px 14px', borderRadius: '12px',
            border: '1.5px solid rgba(96,165,250,0.4)',
            background: customQ.trim() && !customSending ? 'rgba(96,165,250,0.18)' : 'rgba(255,255,255,0.04)',
            color: customQ.trim() && !customSending ? '#93c5fd' : 'rgba(255,255,255,0.55)',
            fontSize: '15px', cursor: customQ.trim() && !customSending ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
          }}>
            {customSending ? '…' : '›'}
          </button>
        </div>


        {SCENARIOS.map(s => {
          const isActive = s.id === activeId
          return (
            <button key={s.id} onClick={() => handleScenario(s)} style={{
              padding: '13px 16px', borderRadius: '14px',
              border: isActive ? `1.5px solid ${s.color}99` : '1.5px solid rgba(255,255,255,0.1)',
              background: isActive ? `linear-gradient(135deg, ${s.color}20 0%, ${s.color}08 100%)` : 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              color: isActive ? s.color : 'rgba(255,255,255,0.88)',
              fontSize: '13px', letterSpacing: '0.05em', fontWeight: isActive ? '600' : '400',
              cursor: 'pointer', transition: 'all 0.25s ease',
              boxShadow: isActive ? `0 0 20px ${s.glow}` : 'none',
              textAlign: 'left', width: '100%',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '3px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.78, fontWeight: 400 }}>{s.question}</div>
            </button>
          )
        })}

      </div>

      {/* ── Time Machine popup ───────────────────────────────────────── */}
      {tmOpen && (
        <div style={{
          position: 'absolute', bottom: '150px', left: '50%',
          transform: 'translateX(-50%)', pointerEvents: 'auto', width: '380px',
          padding: '20px 22px', borderRadius: '16px',
          border: '1.5px solid rgba(52,211,153,0.25)',
          background: 'rgba(4,8,22,0.92)', backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', gap: '12px',
          transition: 'height 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(52,211,153,0.6)', display: 'flex', alignItems: 'center', gap: '5px' }}><RefreshCw size={12} /> TIME MACHINE</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#6ee7b7' }}>{tmYear}</span>
          </div>
          <input type="range" min={1900} max={2200} value={tmYear}
            onChange={e => handleTimeMachineChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>
            <span>1900</span>
            <span style={{ color: tmActive ? 'transparent' : 'rgba(52,211,153,0.45)' }}>today</span>
            <span>2200</span>
          </div>

          {/* Temporal Event HUD */}
          {tmActive && (
            <div style={{
              marginTop: '8px', padding: '12px', borderRadius: '10px',
              background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)',
              minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {tmLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(52,211,153,0.6)', fontSize: '11px', letterSpacing: '0.1em' }}>
                  <div style={{
                    width: '12px', height: '12px', border: '1.5px solid rgba(52,211,153,0.3)',
                    borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                  }} />
                  SYNCING TIMELINE...
                </div>
              ) : tmEvent ? (
                <div style={{ 
                  color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: 1.5, 
                  textShadow: '0 0 10px rgba(52,211,153,0.2)' 
                }}>
                  <div style={{ fontSize: '9px', color: '#34d399', letterSpacing: '0.15em', marginBottom: '4px' }}>TEMPORAL LOG:</div>
                  {tmEvent}
                </div>
              ) : null}
            </div>
          )}

          {tmActive && (
            <button onClick={() => handleTimeMachineChange(currentYear)} style={{
              padding: '7px', borderRadius: '8px',
              border: '1px solid rgba(52,211,153,0.3)', background: 'transparent',
              color: 'rgba(52,211,153,0.7)', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.08em',
            }}>‹ Back to Today</button>
          )}
        </div>
      )}

      {/* ── Bottom bar: TIME + QUIZ ──────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '80px', left: '50%',
        transform: 'translateX(-50%)', pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 14px', borderRadius: '40px',
        background: 'rgba(5,8,22,0.75)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <button onClick={() => setTmOpen(o => !o)} style={{
          padding: '9px 18px', borderRadius: '22px',
          border: tmActive ? '1.5px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.1)',
          background: tmActive ? 'rgba(52,211,153,0.12)' : tmOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
          color: tmActive ? '#6ee7b7' : 'rgba(255,255,255,0.82)',
          fontSize: '13px', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s ease',
        }}>
          <><RefreshCw size={13} />{tmActive ? ` ${tmYear}` : ' TIME'}</>
        </button>
        <button onClick={openQuiz} style={{
          padding: '9px 18px', borderRadius: '22px',
          border: '1.5px solid rgba(250,204,21,0.3)',
          background: 'rgba(250,204,21,0.07)',
          color: 'rgba(250,204,21,1)',
          fontSize: '13px', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Sparkles size={13} /> QUIZ{streak > 0 ? <>{` ${streak}`}<Flame size={13} /></> : ''}
        </button>
      </div>

      {/* ── Result Panel ────────────────────────────────────────────────── */}
      {(loading || result || error) && (
        <>
          {/* Backdrop — click anywhere to dismiss */}
          <div
            onClick={() => {
              setResult(null)
              setError(null)
              setLoading(false)
              setActiveId(null)
              stopSpeaking()
            }}
            style={{
              position: 'fixed', inset: 0,
              pointerEvents: 'auto',
              cursor: 'default',
            }}
          />
          <div style={{
            position: 'absolute', right: '24px', top: '80px', bottom: '80px', width: '300px',
            pointerEvents: 'auto', background: 'rgba(4,7,20,0.92)', backdropFilter: 'blur(20px)',
            border: `1px solid ${active?.color ?? 'rgba(255,255,255,0.12)'}44`,
            borderRadius: '16px', padding: '20px',
            boxShadow: `0 0 40px ${active?.glow ?? 'transparent'}`,
            overflowY: 'auto', scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: active?.color ?? 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={9} /> AI ANALYSIS
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {(activeId || customQ.trim()) && (
                <button onClick={handleShare} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                  color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.7)',
                  fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                }}>
                  {copied ? <><Check size={11} /> copied</> : <><Link2 size={11} /> share</>}
                </button>
              )}
              {result && (
                <button onClick={() => { if (speaking) { stopSpeaking(); return } speak(result.explanation) }}
                style={{
                  background: 'none', border: `1px solid ${active?.color ?? 'rgba(255,255,255,0.2)'}55`,
                  borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                  color: speaking ? active?.color : 'rgba(255,255,255,0.7)',
                  fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                }}>
                  {speaking ? <><Square size={11} /> stop</> : <><Volume2 size={11} /> speak</>}
                </button>
              )}
            </div>
          </div>

          {result?.label && (
            <div style={{ fontSize: '11px', fontWeight: 600, color: active?.color ?? 'rgba(255,255,255,0.6)', marginBottom: '10px', opacity: 0.8 }}>
              {result.label}
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
              <div style={{
                width: '16px', height: '16px', flexShrink: 0,
                border: `2px solid ${active?.color ?? '#fff'}33`, borderTopColor: active?.color ?? '#fff',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              Analysing cosmic scenario…
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {error && !loading && (
            <p style={{ color: 'rgba(255,100,100,0.8)', fontSize: '12px', lineHeight: 1.6 }}>{error}</p>
          )}

          {result && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '12px', lineHeight: 1.7 }}>{result.explanation}</p>
              {result.impact?.length > 0 && (
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.65)', marginBottom: '7px' }}>IMPACT ANALYSIS</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {result.impact.map((pt, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                        <span style={{ color: active?.color, flexShrink: 0, display: 'flex', alignItems: 'center' }}><ChevronRight size={12} /></span>{pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.timeline && (
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>FUTURE TIMELINE</div>
                  {[
                    { label: '1 YEAR',    value: result.timeline.oneYear },
                    { label: '10 YEARS',  value: result.timeline.tenYears },
                    { label: '100 YEARS', value: result.timeline.hundredYears },
                  ].map(({ label, value }) => value && (
                    <div key={label} style={{ marginBottom: '8px', paddingLeft: '10px', borderLeft: `2px solid ${active?.color}55` }}>
                      <div style={{ fontSize: '9px', color: active?.color, letterSpacing: '0.12em', marginBottom: '3px' }}>{label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
              {result.howItCouldHappen?.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.65)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Layers size={9} /> HOW IT COULD HAPPEN
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.howItCouldHappen.map((item, i) => (
                      <div key={i} style={{
                        padding: '8px 12px', borderRadius: '8px',
                        background: `${active?.color ?? '#ffffff'}0a`,
                        border: `1px solid ${active?.color ?? '#ffffff'}22`,
                        fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55,
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
        </div>
      </>
    )}

      {/* ── Quiz Modal ───────────────────────────────────────────────────── */}
      {quizOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setQuizOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            width: '400px', maxWidth: '92vw', maxHeight: '88vh', overflowY: 'auto',
            background: 'rgba(4,7,20,0.97)',
            border: '1px solid rgba(250,204,21,0.2)',
            borderRadius: '20px', padding: '24px',
            boxShadow: '0 0 80px rgba(250,204,21,0.08)',
            color: 'white', fontFamily: 'sans-serif',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(250,204,21,0.6)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={9} /> DAILY SPACE QUIZ
                </div>
                {streak > 0 && (
                  <div style={{ fontSize: '12px', color: 'rgba(250,204,21,0.75)', letterSpacing: '0.04em' }}>
                    {streak} day streak <Flame size={13} />
                  </div>
                )}
              </div>
              <button onClick={() => setQuizOpen(false)} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
                width: '30px', height: '30px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={13} /></button>
            </div>

            {quizLoading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                <div style={{
                  width: '24px', height: '24px', margin: '0 auto 12px',
                  border: '2px solid rgba(250,204,21,0.25)', borderTopColor: '#facc15',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                Generating today&apos;s question…
              </div>
            )}

            {quizData && !quizLoading && (() => {
              const answered = quizSelected !== null
              const correct  = answered && quizSelected === quizData.correct
              return (
                <>
                  {/* Real-time data badge */}
                  <div style={{
                    padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.12)',
                    fontSize: '11px', color: 'rgba(250,204,21,0.65)',
                    marginBottom: '16px', lineHeight: 1.6,
                  }}>
                    <Globe size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Right now, Earth to Mars: <strong>{quizData.earthMarsAU} AU</strong> · light takes <strong>{quizData.earthMarsMin} min</strong>
                    {quizData.earthJupiterMin && (
                      <span> · Earth→Jupiter: <strong>{quizData.earthJupiterMin} min</strong></span>
                    )}
                  </div>

                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', marginBottom: '16px', fontWeight: 500 }}>
                    {quizData.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {quizData.options.map((opt, i) => {
                      let bg = 'rgba(255,255,255,0.04)'
                      let border = '1px solid rgba(255,255,255,0.1)'
                      let color  = 'rgba(255,255,255,0.75)'
                      if (answered) {
                        if (i === quizData.correct) { bg = 'rgba(52,211,153,0.14)'; border = '1px solid rgba(52,211,153,0.45)'; color = '#6ee7b7' }
                        else if (i === quizSelected) { bg = 'rgba(239,68,68,0.14)'; border = '1px solid rgba(239,68,68,0.4)'; color = '#fca5a5' }
                      }
                      return (
                        <button key={i} onClick={() => handleQuizAnswer(i)} disabled={answered} style={{
                          padding: '10px 14px', borderRadius: '10px',
                          border, background: bg, color, fontSize: '12px',
                          textAlign: 'left', lineHeight: 1.4,
                          cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s',
                          fontFamily: 'sans-serif',
                        }}>
                          <span style={{ opacity: 0.45, marginRight: '8px' }}>{['A','B','C','D'][i]}.</span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>

                  {answered && (
                    <div style={{
                      padding: '14px', borderRadius: '12px',
                      background: correct ? 'rgba(52,211,153,0.07)' : 'rgba(239,68,68,0.07)',
                      border: `1px solid ${correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)'}`,
                      fontSize: '12px', lineHeight: 1.65,
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: correct ? '#6ee7b7' : '#fca5a5' }}>
                        {correct ? <><Check size={13} /> Correct!</> : <>The answer was {['A','B','C','D'][quizData.correct]}.</>}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)' }}>{quizData.explanation}</div>
                      {quizData.fact && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Sparkles size={10} /> {quizData.fact}</span>
                        </div>
                      )}
                      {/* ── Quiz Share button ── */}
                      <button
                        onClick={handleQuizShare}
                        style={{
                          marginTop: '12px', padding: '6px 14px',
                          borderRadius: '8px', cursor: 'pointer',
                          background: 'none',
                          border: quizCopied ? '1px solid rgba(110,231,183,0.5)' : '1px solid rgba(255,255,255,0.15)',
                          color: quizCopied ? '#6ee7b7' : 'rgba(255,255,255,0.45)',
                          fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '5px',
                        }}
                      >
                        {quizCopied ? <><Check size={10} /> Copied!</> : <><Link2 size={10} /> Share Result</>}
                      </button>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}

    </div>
  )
}