'use client'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { PLANETS } from '@/data/planets'
import { getPlanetAngles } from '@/lib/orbital-mechanics'
import Sun from './solar-system/Sun'
import OrbitRing from './solar-system/OrbitRing'
import Planet from './solar-system/Planet'
import InfoPanel from './solar-system/InfoPanel'
import TimeControls from './solar-system/TimeControls'
import Asteroid from './solar-system/Asteroid'
import AsteroidBelt from './solar-system/AsteroidBelt'
import ShootingStars from './solar-system/ShootingStars'
import * as THREE from 'three'

// ─── Module-level event bus ──────────────────────────────────────────────────
let _effectCallback      = null
let _resetCallback       = null
let _timeMachineCallback = null

export function triggerEffect(name) {
  if (_effectCallback) _effectCallback(name)
}

export function resetAll() {
  if (_resetCallback) _resetCallback()
}

export function setTimeMachineDate(date) {
  if (_timeMachineCallback) _timeMachineCallback(date)
}
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CAM_POS    = new THREE.Vector3(0, 50, 110)
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 0, 0)

function PostEffects({ activeEffect }) {
  const isAsteroid = activeEffect === 'asteroid-hit-mars'
  return (
    <EffectComposer multisampling={isAsteroid ? 0 : 4}>
      <Bloom
        intensity={
          activeEffect === 'sun-brighter' ? 2.2
          : isAsteroid ? 0.7
          : 1.5
        }
        luminanceThreshold={isAsteroid ? 0.7 : 0.55}
        luminanceSmoothing={0.25}
        mipmapBlur={!isAsteroid}
      />
    </EffectComposer>
  )
}

function MarsFlash({ flash }) {
  if (!flash) return null
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(circle at 50% 50%, rgba(255,240,200,0.7) 0%, rgba(255,120,20,0.5) 30%, rgba(220,30,10,0.3) 55%, transparent 80%)',
      pointerEvents: 'none', zIndex: 5,
      animation: 'marsFlash 1.2s ease-out forwards',
    }} />
  )
}

function Scene({
  activeEffect, setActiveEffect, multiplier, onPlanetClick,
  setMarsFlash, surfacePlanet,
}) {
  const planetPositionsRef = useRef({})
  const marsPositionRef    = useRef({ x: 42, y: 0, z: 0 })
  const [controlsLocked, setControlsLocked] = useState(false)

  const orbitRef = useRef()
  const { camera } = useThree()

  useEffect(() => {
    const doReset = () => {
      if (orbitRef.current) {
        orbitRef.current.target.copy(DEFAULT_CAM_TARGET)
        orbitRef.current.update()
      }
      camera.position.copy(DEFAULT_CAM_POS)
      camera.lookAt(DEFAULT_CAM_TARGET)
    }
    window.__cosmosCameraReset = doReset
    return () => { delete window.__cosmosCameraReset }
  }, [camera])

  // Surface explorer camera animation
  useFrame(() => {
    if (!surfacePlanet) return
    const pos = planetPositionsRef.current[surfacePlanet]
    if (!pos) return
    const pd = PLANETS.find(p => p.name === surfacePlanet)
    const size = pd?.size ?? 2
    const dist = size * 3.2

    // Position camera above-and-behind the planet (away from Sun)
    const dir = new THREE.Vector3(pos.x, 0, pos.z).normalize()
    const camTarget = new THREE.Vector3(
      pos.x + dir.x * dist * 0.6,
      dist * 0.9,
      pos.z + dir.z * dist * 0.6,
    )
    const lookTarget = new THREE.Vector3(pos.x, 0, pos.z)

    camera.position.lerp(camTarget, 0.05)
    if (orbitRef.current) {
      orbitRef.current.target.lerp(lookTarget, 0.05)
      orbitRef.current.update()
    }
  })

  const handleAsteroidImpact = useCallback(() => {
    setMarsFlash(true)
    setTimeout(() => {
      setMarsFlash(false)
      setActiveEffect(null)
    }, 1200)
  }, [setActiveEffect, setMarsFlash])

  return (
    <>
      <ambientLight intensity={0.15} color="#1a2040" />
      <Stars radius={300} depth={80} count={12000} factor={5} saturation={0.8} fade speed={0.4} />
      <ShootingStars />
      <OrbitControls
        ref={orbitRef}
        enabled={!controlsLocked}
        enableZoom={true}
        enableRotate={true}
        enablePan={false}
        minDistance={30}
        maxDistance={240}
      />
      <Sun activeEffect={activeEffect} />
      {PLANETS.map((planet) => (
        <Planet
          key={planet.name}
          data={planet}
          timeMultiplier={multiplier}
          onPlanetClick={onPlanetClick}
          activeEffect={activeEffect}
          onPositionUpdate={(pos) => { 
            planetPositionsRef.current[planet.name] = pos
            if (planet.name === 'Mars') {
              marsPositionRef.current.x = pos.x
              marsPositionRef.current.y = pos.y
              marsPositionRef.current.z = pos.z
            }
          }}
        />
      ))}
      {PLANETS.map((planet) => (
        <OrbitRing key={planet.name + '-ring'} radius={planet.orbitRadius} />
      ))}
      <AsteroidBelt
        count={multiplier >= 10 ? 1800 : 3500}
        innerRadius={48}
        outerRadius={63}
        timeMultiplier={multiplier}
      />
      {activeEffect === 'asteroid-hit-mars' && (
        <Asteroid
          targetRef={marsPositionRef}
          timeMultiplier={multiplier}
          onImpact={handleAsteroidImpact}
          onExplosionChange={setControlsLocked}
        />
      )}
      <PostEffects activeEffect={activeEffect} />
    </>
  )
}

function InteractionHints() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'absolute', bottom: '80px', right: '20px', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
      {/* Hint pills */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '7px',
        opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: open ? 'auto' : 'none',
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
            color: 'rgba(255,255,255,0.9)', fontSize: '11px',
            fontFamily: 'sans-serif', letterSpacing: '0.05em', whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: '13px' }}>{h.icon}</span>{h.text}
          </div>
        ))}
      </div>

      {/* i button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '38px', height: '38px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(5,8,22,0.75)',
          backdropFilter: 'blur(16px)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '16px', fontStyle: 'italic', fontFamily: 'serif',
          cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        i
      </button>
    </div>
  )
}

export default function SolarSystem() {
  const [selectedPlanet,    setSelectedPlanet]    = useState(null)
  const [multiplier,        setMultiplier]        = useState(1)
  const [activeEffect,      setActiveEffect]      = useState(null)
  const [marsFlash,         setMarsFlash]         = useState(false)
  const [surfacePlanet,     setSurfacePlanet]     = useState(null)
  const [timeMachineDate,   setTimeMachineDateState] = useState(null)

  // Reset camera when exiting surface mode
  const prevSurfaceRef = useRef(null)
  useEffect(() => {
    if (prevSurfaceRef.current !== null && surfacePlanet === null) {
      if (typeof window !== 'undefined' && window.__cosmosCameraReset) {
        window.__cosmosCameraReset()
      }
    }
    prevSurfaceRef.current = surfacePlanet
  }, [surfacePlanet])

  useEffect(() => {
    _effectCallback      = (name) => setActiveEffect(name)
    _timeMachineCallback = (date) => setTimeMachineDateState(date)
    _resetCallback = () => {
      setActiveEffect(null)
      setSelectedPlanet(null)
      setSurfacePlanet(null)
      setTimeMachineDateState(null)
      if (typeof window !== 'undefined' && window.__cosmosCameraReset) {
        window.__cosmosCameraReset()
      }
    }
    return () => {
      _effectCallback      = null
      _timeMachineCallback = null
      _resetCallback       = null
    }
  }, [])

  const accentColors = { Earth: '#2979ff', Mars: '#ff3d00', Jupiter: '#ff9800' }
  const surfaceAccent = surfacePlanet ? (accentColors[surfacePlanet] ?? '#aaaaff') : null

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{`
        @keyframes marsFlash  { 0% { opacity:1; } 100% { opacity:0; } }
        @keyframes sunPulse   { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes surfaceFadeIn { from { opacity:0; } to { opacity:1; } }
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
          surfacePlanet={surfacePlanet}
        />
      </Canvas>

      <MarsFlash flash={marsFlash} />

      {activeEffect === 'sun-brighter' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,240,180,0.18) 0%, rgba(255,200,80,0.08) 40%, transparent 70%)',
          animation: 'sunPulse 2s ease-in-out infinite',
        }} />
      )}

      {/* ── Surface Explorer Overlay ──────────────────────────────────────── */}
      {surfacePlanet && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15,
          animation: 'surfaceFadeIn 0.6s ease',
        }}>
          {/* Atmospheric haze at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
            background: `linear-gradient(to top, ${surfaceAccent}28 0%, transparent 100%)`,
          }} />
          {/* Label */}
          <div style={{
            position: 'absolute', top: '72px', left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px', letterSpacing: '0.22em',
            color: surfaceAccent, opacity: 0.75,
            fontFamily: 'sans-serif',
            textShadow: `0 0 12px ${surfaceAccent}88`,
          }}>
            IN ORBIT — {surfacePlanet.toUpperCase()}
          </div>
          {/* Exit button */}
          <button
            onClick={() => setSurfacePlanet(null)}
            style={{
              position: 'absolute', bottom: '100px', left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'auto',
              padding: '8px 20px',
              borderRadius: '20px',
              border: `1px solid ${surfaceAccent}66`,
              background: 'rgba(4,7,20,0.85)',
              backdropFilter: 'blur(12px)',
              color: surfaceAccent,
              fontSize: '11px', letterSpacing: '0.12em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            ← EXIT SURFACE VIEW
          </button>
        </div>
      )}

      <InteractionHints />

      <InfoPanel
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        onExploreSurface={(name) => { setSelectedPlanet(null); setSurfacePlanet(name) }}
      />
      <TimeControls multiplier={multiplier} setMultiplier={setMultiplier} />
    </div>
  )
}
