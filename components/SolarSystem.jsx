'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { PLANETS } from '@/data/planets'
import Sun from './solar-system/Sun'
import OrbitRing from './solar-system/OrbitRing'
import Planet from './solar-system/Planet'
import InfoPanel from './solar-system/InfoPanel'
import TimeControls from './solar-system/TimeControls'
import Asteroid from './solar-system/Asteroid'
import * as THREE from 'three'

// ─── Module-level event bus ──────────────────────────────────────────────────
let _effectCallback = null
let _resetCallback  = null

export function triggerEffect(name) {
  if (_effectCallback) _effectCallback(name)
}

// Single global reset — clears effects + camera + selection
export function resetAll() {
  if (_resetCallback) _resetCallback()
}
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CAM_POS    = new THREE.Vector3(0, 50, 110)
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 0, 0)

function MarsFlash({ flash }) {
  if (!flash) return null
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: 'rgba(220,30,10,0.5)',
      pointerEvents: 'none', zIndex: 5,
      animation: 'marsFlash 1s ease-out forwards',
    }} />
  )
}

function Scene({ activeEffect, setActiveEffect, multiplier, onPlanetClick, setMarsFlash }) {
  const marsPositionRef = useRef({ x: 42, y: 0, z: 0 })
  const orbitRef        = useRef()
  const { camera }      = useThree()

  // Register camera reset into the module-level slot
  useEffect(() => {
    const doReset = () => {
      if (orbitRef.current) {
        orbitRef.current.target.copy(DEFAULT_CAM_TARGET)
        orbitRef.current.update()
      }
      camera.position.copy(DEFAULT_CAM_POS)
      camera.lookAt(DEFAULT_CAM_TARGET)
    }
    // Expose camera reset so resetAll() (called from ScenarioSimulator) can reach it
    ;(window).__cosmosCameraReset = doReset
    return () => { delete window.__cosmosCameraReset }
  }, [camera])

  const handleAsteroidImpact = useCallback(() => {
    setMarsFlash(true)
    setTimeout(() => {
      setMarsFlash(false)
      setActiveEffect(null)
    }, 1200)
  }, [setActiveEffect, setMarsFlash])

  return (
    <>
      <ambientLight intensity={0.6} />
      <Stars radius={200} depth={50} count={6000} factor={4} saturation={0.3} fade />
      <OrbitControls
        ref={orbitRef}
        enableZoom={true}
        enableRotate={true}
        enablePan={false}
        minDistance={30}
        maxDistance={240}
      />
      <Sun />
      {PLANETS.map((planet) => (
        <Planet
          key={planet.name}
          data={planet}
          timeMultiplier={multiplier}
          onPlanetClick={onPlanetClick}
          activeEffect={activeEffect}
          onPositionUpdate={planet.name === 'Mars'
            ? (pos) => { marsPositionRef.current = pos }
            : null
          }
        />
      ))}
      {PLANETS.map((planet) => (
        <OrbitRing key={planet.name + '-ring'} radius={planet.orbitRadius} />
      ))}
      {activeEffect === 'asteroid-hit-mars' && (
        <Asteroid
          targetPosition={marsPositionRef.current}
          onImpact={handleAsteroidImpact}
        />
      )}
    </>
  )
}

// Hint badges — fade out after 7 s
function InteractionHints() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 7000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{
      position: 'absolute', bottom: '80px', right: '20px',
      zIndex: 20, display: 'flex', flexDirection: 'column', gap: '7px',
      opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease',
      pointerEvents: 'none',
    }}>
      {[
        { icon: '🖱️', text: 'Drag to rotate' },
        { icon: '🔍', text: 'Scroll to zoom' },
        { icon: '🪐', text: 'Click planet for info' },
      ].map(h => (
        <div key={h.text} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '5px 13px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.65)', fontSize: '11px',
          fontFamily: 'sans-serif', letterSpacing: '0.05em', whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '13px' }}>{h.icon}</span>{h.text}
        </div>
      ))}
    </div>
  )
}

export default function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [multiplier,     setMultiplier]     = useState(1)
  const [activeEffect,   setActiveEffect]   = useState(null)
  const [marsFlash,      setMarsFlash]      = useState(false)

  useEffect(() => {
    _effectCallback = (name) => setActiveEffect(name)
    _resetCallback  = () => {
      setActiveEffect(null)
      setSelectedPlanet(null)
      // Camera reset is registered by Scene via window.__cosmosCameraReset
      if (typeof window !== 'undefined' && window.__cosmosCameraReset) {
        window.__cosmosCameraReset()
      }
    }
    return () => {
      _effectCallback = null
      _resetCallback  = null
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{`
        @keyframes marsFlash { 0% { opacity:1; } 100% { opacity:0; } }
      `}</style>

      <Canvas
        camera={{ position: [0, 50, 110], fov: 55 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Scene
          activeEffect={activeEffect}
          setActiveEffect={setActiveEffect}
          multiplier={multiplier}
          onPlanetClick={setSelectedPlanet}
          setMarsFlash={setMarsFlash}
        />
      </Canvas>

      <MarsFlash flash={marsFlash} />
      <InteractionHints />

      <InfoPanel
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />
      <TimeControls
        multiplier={multiplier}
        setMultiplier={setMultiplier}
      />
      {/* ── NO reset button here — it lives in ScenarioSimulator ── */}
    </div>
  )
}