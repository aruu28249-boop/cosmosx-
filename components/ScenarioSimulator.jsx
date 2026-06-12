'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { triggerEffect, resetAll, setTimeMachineDate } from '@/components/SolarSystem'

const SCENARIOS = [
  { id: 'two-moons',        label: 'Two Moons',        question: 'What if Earth had two moons?',        color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
  { id: 'jupiter-disappear', label: 'Jupiter Vanishes', question: 'What if Jupiter disappeared?',         color: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  { id: 'asteroid-hit-mars', label: 'Asteroid Strikes', question: 'What if an asteroid hit Mars?',        color: '#ef4444', glow: 'rgba(239,68,68,0.3)'   },
  { id: 'sun-brighter',      label: 'Sun Gets Brighter', question: 'What if the Sun became brighter?',   color: '#fbbf24', glow: 'rgba(251,191,36,0.3)'  },
]

function pickEffect(q) {
  const s = q.toLowerCase()
  if (s.includes('moon') || s.includes('lunar'))                                                           return 'two-moons'
  if (s.includes('jupiter') || s.includes('vanish') || s.includes('disappear') || s.includes('gas giant')) return 'jupiter-disappear'
  if (s.includes('asteroid') || s.includes('comet') || s.includes('impact') || s.includes('hit') || s.includes('meteor')) return 'asteroid-hit-mars'
  if (s.includes('sun') || s.includes('solar') || s.includes('bright') || s.includes('hot') || s.includes('star'))        return 'sun-brighter'
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

  // ── Custom question ───────────────────────────────────────────────────────
  const [customQ,       setCustomQ]       = useState('')
  const [customSending, setCustomSending] = useState(false)

  // ── Time machine ──────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear()
  const [tmOpen,  setTmOpen]  = useState(false)
  const [tmYear,  setTmYear]  = useState(currentYear)

  // ── Share ─────────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false)

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
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
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
        if (data.impact?.length)         parts.push(data.impact.join('. '))
        if (data.timeline?.oneYear)      parts.push('In the first year: '       + data.timeline.oneYear)
        if (data.timeline?.tenYears)     parts.push('Over ten years: '          + data.timeline.tenYears)
        if (data.timeline?.hundredYears) parts.push('After a hundred years: '   + data.timeline.hundredYears)
        speak(parts.join('. '))
      }
    } catch { setError('Could not reach AI. Visual effect is still active.') }
    finally { setLoading(false) }
  }, [onScenarioSelect]) // eslint-disable-line

  // ── URL auto-trigger (shareable links) ────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const s    = params.get('s')
      const q    = params.get('q')
      const year = params.get('year')

      if (year) {
        const y = parseInt(year)
        if (!isNaN(y) && y >= 1900 && y <= 2200 && y !== currentYear) {
          setTmYear(y); setTmOpen(true)
          setTimeMachineDate(new Date(y, 0, 1))
        }
      }
      if (s) {
        const sc = SCENARIOS.find(sc => sc.id === s)
        if (sc) { setActiveId(sc.id); triggerEffect(sc.id); runScenario({ scenarioId: sc.id, label: sc.label, color: sc.color }) }
      } else if (q) {
        const decoded = decodeURIComponent(q)
        setCustomQ(decoded); setActiveId('custom')
        const eff = pickEffect(decoded)
        if (eff) triggerEffect(eff)
        runScenario({ customQuestion: decoded, label: decoded, color: '#60a5fa' })
      }
    }, 800) // wait for 3D scene to mount
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleScenario = (scenario) => {
    setActiveId(scenario.id)
    triggerEffect(scenario.id)
    runScenario({ scenarioId: scenario.id, label: scenario.label, color: scenario.color })
  }

  const handleCustomSubmit = async () => {
    if (!customQ.trim() || customSending) return
    setCustomSending(true)
    setActiveId('custom')
    const eff = pickEffect(customQ)
    if (eff) triggerEffect(eff)
    await runScenario({ customQuestion: customQ.trim(), label: customQ.trim(), color: '#60a5fa' })
    setCustomSending(false)
  }

  const handleTimeMachineChange = (year) => {
    setTmYear(year)
    setTimeMachineDate(year === currentYear ? null : new Date(year, 0, 1))
  }

  const handleReset = () => {
    stopSpeaking()
    resetAll()
    setActiveId(null); setResult(null); setError(null); setLoading(false)
    setCustomQ(''); setTmOpen(false); setTmYear(currentYear)
  }

  const handleShare = () => {
    const url = new URL(window.location.href)
    url.search = ''
    if (activeId && activeId !== 'custom') {
      url.searchParams.set('s', activeId)
    } else if (customQ.trim()) {
      url.searchParams.set('q', encodeURIComponent(customQ.trim()))
    }
    if (tmYear !== currentYear) url.searchParams.set('year', tmYear)
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const store = loadQuizStore()
    setStreak(store.streak ?? 0)
  }, [])

  const openQuiz = async () => {
    setQuizOpen(true)
    if (quizFetchedRef.current) return
    quizFetchedRef.current = true
    setQuizLoading(true)
    try {
      const res = await fetch('/api/quiz')
      const data = await res.json()
      setQuizData(data)

      // Restore today's answer if already answered
      const store = loadQuizStore()
      const today = new Date().toISOString().slice(0, 10)
      if (store.date === today && store.answered) {
        setQuizSelected(store.selected)
      }
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
    const newStreak = isCorrect
      ? (store.date === prevDay && store.correct ? (store.streak ?? 0) + 1 : 1)
      : 0

    saveQuizStore({ date: today, answered: true, selected: i, correct: isCorrect, streak: newStreak })
    setStreak(newStreak)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const active   = SCENARIOS.find(s => s.id === activeId) ?? (activeId === 'custom' ? { color: '#60a5fa', glow: 'rgba(96,165,250,0.3)' } : null)
  const tmActive = tmYear !== currentYear

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>

      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: '20px', top: '20px', bottom: '80px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        pointerEvents: 'auto', width: '220px',
        overflowY: 'auto', scrollbarWidth: 'none',
      }}>

        <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', paddingLeft: '2px' }}>
          ✦ AI SCENARIO SIMULATOR
        </div>

        {SCENARIOS.map(s => {
          const isActive = s.id === activeId
          return (
            <button key={s.id} onClick={() => handleScenario(s)} style={{
              padding: '11px 14px', borderRadius: '12px',
              border: isActive ? `1.5px solid ${s.color}99` : '1.5px solid rgba(255,255,255,0.1)',
              background: isActive ? `linear-gradient(135deg, ${s.color}20 0%, ${s.color}08 100%)` : 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              color: isActive ? s.color : 'rgba(255,255,255,0.7)',
              fontSize: '11px', letterSpacing: '0.05em', fontWeight: isActive ? '600' : '400',
              cursor: 'pointer', transition: 'all 0.25s ease',
              boxShadow: isActive ? `0 0 20px ${s.glow}` : 'none',
              textAlign: 'left', width: '100%',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 400 }}>{s.question}</div>
            </button>
          )
        })}

        <button onClick={handleReset} title="Reset" style={{
          alignSelf: 'flex-start', width: '36px', height: '36px', borderRadius: '50%',
          border: activeId ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
          background: activeId ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          color: activeId ? '#fca5a5' : 'rgba(255,255,255,0.3)',
          fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>↺</button>

        {HR}

        {/* ── Ask Anything ──────────────────────────────────────────── */}
        <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', paddingLeft: '2px' }}>
          ✦ ASK ANYTHING
        </div>

        <textarea
          value={customQ}
          onChange={e => setCustomQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCustomSubmit() } }}
          placeholder={'What if the Moon disappeared?\n(Enter to submit)'}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '9px 12px', borderRadius: '10px',
            border: activeId === 'custom' ? '1.5px solid #60a5fa66' : '1.5px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.82)', fontSize: '11px',
            lineHeight: 1.5, resize: 'none', outline: 'none', fontFamily: 'sans-serif',
          }}
        />
        <button onClick={handleCustomSubmit} disabled={!customQ.trim() || customSending} style={{
          padding: '9px', borderRadius: '10px',
          border: '1.5px solid rgba(96,165,250,0.4)',
          background: customQ.trim() && !customSending ? 'rgba(96,165,250,0.18)' : 'rgba(255,255,255,0.04)',
          color: customQ.trim() && !customSending ? '#93c5fd' : 'rgba(255,255,255,0.3)',
          fontSize: '11px', letterSpacing: '0.1em',
          cursor: customQ.trim() && !customSending ? 'pointer' : 'default',
          transition: 'all 0.2s ease', width: '100%',
        }}>
          {customSending ? 'Analysing…' : '→ SIMULATE'}
        </button>

        {HR}

        {/* ── Time Machine ──────────────────────────────────────────── */}
        <button onClick={() => setTmOpen(o => !o)} style={{
          padding: '9px 12px', borderRadius: '10px',
          border: tmActive ? '1.5px solid rgba(52,211,153,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
          background: tmActive ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          color: tmActive ? '#6ee7b7' : 'rgba(255,255,255,0.55)',
          fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.25s ease',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', textAlign: 'left',
        }}>
          <span>⟳ TIME MACHINE{tmActive ? ` · ${tmYear}` : ''}</span>
          <span style={{ opacity: 0.5, fontSize: '10px' }}>{tmOpen ? '▲' : '▼'}</span>
        </button>

        {tmOpen && (
          <div style={{
            padding: '12px', borderRadius: '10px',
            border: '1.5px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.06)',
            backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(52,211,153,0.7)' }}>YEAR</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#6ee7b7' }}>{tmYear}</span>
            </div>
            <input type="range" min={1900} max={2200} value={tmYear}
              onChange={e => handleTimeMachineChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>
              <span>1900</span>
              <span style={{ color: tmActive ? 'transparent' : 'rgba(52,211,153,0.5)' }}>▲ today</span>
              <span>2200</span>
            </div>
            {tmActive && (
              <button onClick={() => handleTimeMachineChange(currentYear)} style={{
                padding: '5px', borderRadius: '6px',
                border: '1px solid rgba(52,211,153,0.3)', background: 'transparent',
                color: 'rgba(52,211,153,0.7)', fontSize: '10px', cursor: 'pointer', letterSpacing: '0.08em',
              }}>← Back to Today</button>
            )}
          </div>
        )}

        {HR}

        {/* ── Daily Quiz trigger ────────────────────────────────────── */}
        <button onClick={openQuiz} style={{
          padding: '9px 12px', borderRadius: '10px',
          border: '1.5px solid rgba(250,204,21,0.3)',
          background: 'rgba(250,204,21,0.07)', backdropFilter: 'blur(12px)',
          color: 'rgba(250,204,21,0.8)', fontSize: '11px', letterSpacing: '0.08em',
          cursor: 'pointer', transition: 'all 0.25s ease',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', textAlign: 'left',
        }}>
          <span>✦ DAILY SPACE QUIZ</span>
          {streak > 0 && <span style={{ fontSize: '10px', color: 'rgba(250,204,21,0.6)' }}>{streak}🔥</span>}
        </button>

      </div>

      {/* ── Result Panel ────────────────────────────────────────────────── */}
      {(loading || result || error) && (
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
            <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: active?.color ?? 'rgba(255,255,255,0.4)' }}>
              ✦ AI ANALYSIS
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Share button */}
              {(activeId || customQ.trim()) && (
                <button onClick={handleShare} style={{
                  background: 'none', border: `1px solid rgba(255,255,255,0.15)`,
                  borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                  color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.35)',
                  fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                }}>
                  {copied ? '✓ copied' : '🔗 share'}
                </button>
              )}
              {/* Speak button */}
              {result && (
                <button onClick={() => {
                  if (speaking) { stopSpeaking(); return }
                  const parts = [result.explanation]
                  if (result.impact?.length)         parts.push(result.impact.join('. '))
                  if (result.timeline?.oneYear)      parts.push('In the first year: '     + result.timeline.oneYear)
                  if (result.timeline?.tenYears)     parts.push('Over ten years: '        + result.timeline.tenYears)
                  if (result.timeline?.hundredYears) parts.push('After a hundred years: ' + result.timeline.hundredYears)
                  speak(parts.join('. '))
                }} style={{
                  background: 'none', border: `1px solid ${active?.color ?? 'rgba(255,255,255,0.2)'}55`,
                  borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
                  color: speaking ? active?.color : 'rgba(255,255,255,0.4)',
                  fontSize: '10px', letterSpacing: '0.08em', transition: 'all 0.2s',
                }}>
                  {speaking ? '⏹ stop' : '🔊 speak'}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
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
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '7px' }}>IMPACT ANALYSIS</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {result.impact.map((pt, i) => (
                      <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                        <span style={{ color: active?.color, flexShrink: 0, marginTop: '1px' }}>▸</span>{pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.timeline && (
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>FUTURE TIMELINE</div>
                  {[
                    { label: '1 YEAR',    value: result.timeline.oneYear },
                    { label: '10 YEARS',  value: result.timeline.tenYears },
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
                <div style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(250,204,21,0.6)', marginBottom: '4px' }}>
                  ✦ DAILY SPACE QUIZ
                </div>
                {streak > 0 && (
                  <div style={{ fontSize: '12px', color: 'rgba(250,204,21,0.75)', letterSpacing: '0.04em' }}>
                    {streak} day streak 🔥
                  </div>
                )}
              </div>
              <button onClick={() => setQuizOpen(false)} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
                width: '30px', height: '30px', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {quizLoading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                <div style={{
                  width: '24px', height: '24px', margin: '0 auto 12px',
                  border: '2px solid rgba(250,204,21,0.25)', borderTopColor: '#facc15',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                Generating today's question…
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
                    🪐 Right now — Earth→Mars: <strong>{quizData.earthMarsAU} AU</strong> · light takes <strong>{quizData.earthMarsMin} min</strong>
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
                          border, background, color, fontSize: '12px',
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
                        {correct ? '✓ Correct!' : `✗ The answer was ${['A','B','C','D'][quizData.correct]}.`}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)' }}>{quizData.explanation}</div>
                      {quizData.fact && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                          ✦ {quizData.fact}
                        </div>
                      )}
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
