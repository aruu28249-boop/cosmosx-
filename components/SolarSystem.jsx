'use client'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Mouse, Search, Globe, RefreshCw } from 'lucide-react'
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
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, -10, 0)

function PostEffects({ activeEffect, timeMachineFrozen, isReturning }) {
  const isAsteroid = activeEffect === 'asteroid-hit-mars'
  const glowing = timeMachineFrozen || isReturning

  const bloomIntensity =
    glowing                              ? 2.5
    : activeEffect === 'solar-flare'    ? 3.8
    : activeEffect === 'sun-brighter'   ? 2.8
    : activeEffect === 'rogue-planet'   ? 1.9
    : activeEffect === 'sun-dies'       ? 0.5
    : activeEffect === 'earth-stops'    ? 1.2
    : isAsteroid                        ? 0.7
    : 1.5

  const luminanceThreshold =
    activeEffect === 'sun-dies'         ? 0.75
    : activeEffect === 'solar-flare'   ? 0.35
    : isAsteroid                        ? 0.7
    : glowing                           ? 0.3
    : 0.55

  return (
    <EffectComposer multisampling={isAsteroid ? 0 : 4}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={0.25}
        mipmapBlur={!isAsteroid}
      />
    </EffectComposer>
  )
}

function RoguePlanetObject({ active }) {
  const ref = useRef()
  const tRef = useRef(-1.5)

  useFrame((_, delta) => {
    if (!ref.current) return
    if (active) {
      tRef.current = Math.min(tRef.current + delta * 0.055, 2.8)
    } else {
      tRef.current = -1.5
    }
    const p = tRef.current
    // Hyperbolic trajectory through the solar system
    const rx = 22 * Math.cosh(p)
    const rz = 68 * Math.sinh(p)
    const cos40 = Math.cos(0.7), sin40 = Math.sin(0.7)
    ref.current.position.x = rx * cos40 - rz * sin40
    ref.current.position.z = rx * sin40 + rz * cos40
    ref.current.position.y = Math.sin(p * 1.8) * 14
    ref.current.rotation.y += delta * 0.14
    ref.current.visible = active
  })

  return (
    <group ref={ref} visible={false}>
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshStandardMaterial color="#120520" emissive="#3d0060" emissiveIntensity={0.8} roughness={0.82} />
      </mesh>
      <sprite scale={[22, 22, 1]}>
        <spriteMaterial color="#7c3aed" transparent opacity={0.10} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
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
  setMarsFlash, selectedPlanet, surfacePlanet, initialAngles, timeMachineAngles, timeMachineFrozen, isReturning,
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
    // Flag-based reset: checked at the top of every frame so it can't be
    // overridden by a stale surfacePlanet closure on the same frame.
    window.__cosmosForceCameraReset = false
    return () => {
      delete window.__cosmosCameraReset
      delete window.__cosmosForceCameraReset
    }
  }, [camera])

  // Surface explorer camera animation
  const prevTargetRef = useRef(new THREE.Vector3())
  const surfaceTransitionRef = useRef(0)

  useEffect(() => {
    if (surfacePlanet) {
      surfaceTransitionRef.current = 1.0
    }
  }, [surfacePlanet])

  useFrame(() => {
    // Honour a force-reset flag raised by the reset button (clears stale closure issue)
    if (window.__cosmosForceCameraReset) {
      window.__cosmosForceCameraReset = false
      if (orbitRef.current) {
        orbitRef.current.target.copy(DEFAULT_CAM_TARGET)
        orbitRef.current.update()
      }
      camera.position.copy(DEFAULT_CAM_POS)
      camera.lookAt(DEFAULT_CAM_TARGET)
      return
    }

    if (!surfacePlanet) return
    const pos = planetPositionsRef.current[surfacePlanet]
    if (!pos) return
    
    const lookTarget = new THREE.Vector3(pos.x, 0, pos.z)

    if (surfaceTransitionRef.current > 0) {
      surfaceTransitionRef.current -= 0.02
      if (surfaceTransitionRef.current <= 0) {
        prevTargetRef.current.copy(lookTarget)
      }

      const pd = PLANETS.find(p => p.name === surfacePlanet)
      const size = pd?.size ?? 2
      const dist = size * 3.2

      const dir = new THREE.Vector3(pos.x, 0, pos.z).normalize()
      const camTarget = new THREE.Vector3(
        pos.x + dir.x * dist * 0.6,
        dist * 0.9,
        pos.z + dir.z * dist * 0.6,
      )

      camera.position.lerp(camTarget, 0.05)
      if (orbitRef.current) {
        orbitRef.current.target.lerp(lookTarget, 0.05)
      }
    } else {
      // Transition over, now just track the planet while allowing user zoom/pan
      const delta = new THREE.Vector3().subVectors(lookTarget, prevTargetRef.current)
      camera.position.add(delta)
      if (orbitRef.current) {
        orbitRef.current.target.copy(lookTarget)
      }
      prevTargetRef.current.copy(lookTarget)
    }
    if (orbitRef.current) orbitRef.current.update()
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
      <Stars radius={300} depth={80} count={12000} factor={5} saturation={0.8} fade speed={(timeMachineFrozen || isReturning) ? 15.0 : 0.4} />
      <ShootingStars />
      <OrbitControls
        ref={orbitRef}
        enabled={!controlsLocked}
        enableZoom={true}
        enableRotate={true}
        enablePan={false}
        minDistance={surfacePlanet ? 5 : 30}
        maxDistance={360}
      />
      <Sun activeEffect={activeEffect} />
      {PLANETS.map((planet) => (
        <Planet
          key={planet.name}
          data={planet}
          timeMultiplier={multiplier}
          onPlanetClick={onPlanetClick}
          activeEffect={activeEffect}
          initialAngle={initialAngles?.[planet.name] ?? null}
          timeMachineAngle={timeMachineAngles?.[planet.name] ?? null}
          timeMachineFrozen={timeMachineFrozen}
          isReturning={isReturning}
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
        <OrbitRing key={planet.name + '-ring'} radius={planet.orbitRadius} glowing={!!(timeMachineFrozen || isReturning)} />
      ))}
      <AsteroidBelt
        count={multiplier >= 10 ? 1800 : 3500}
        innerRadius={48}
        outerRadius={63}
        timeMultiplier={multiplier}
        activeEffect={activeEffect}
      />
      <RoguePlanetObject active={activeEffect === 'rogue-planet'} />
      {activeEffect === 'asteroid-hit-mars' && (
        <Asteroid
          targetRef={marsPositionRef}
          timeMultiplier={multiplier}
          onImpact={handleAsteroidImpact}
          onExplosionChange={setControlsLocked}
        />
      )}
      <PostEffects activeEffect={activeEffect} timeMachineFrozen={timeMachineFrozen} isReturning={isReturning} />
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
          { icon: <Mouse size={13} />, text: 'Drag to rotate' },
          { icon: <Search size={13} />, text: 'Scroll to zoom' },
          { icon: <Globe size={13} />, text: 'Click planet for info' },
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
            {h.icon}{h.text}
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
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [multiplier,     setMultiplier]     = useState(1)
  const [activeEffect,   setActiveEffect]   = useState(null)
  const [marsFlash,      setMarsFlash]      = useState(false)
  const [surfacePlanet,  setSurfacePlanet]  = useState(null)
  const [timeMachineDate, setTimeMachineDateState] = useState(null)
  const [isReturning, setIsReturning] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const initialAngles = useMemo(() => getPlanetAngles(new Date()), [])
  const timeMachineAngles = useMemo(
    () => (timeMachineDate ? getPlanetAngles(timeMachineDate) : null),
    [timeMachineDate]
  )

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
    _timeMachineCallback = (date) => {
      setTimeMachineDateState(prev => {
        if (date === null && prev !== null) {
          setIsReturning(true)
          setTimeout(() => setIsReturning(false), 9000)
        } else if (date !== null) {
          setIsReturning(false)
        }
        return date
      })
    }
    _resetCallback = () => {
      setActiveEffect(null)
      setSelectedPlanet(null)
      setSurfacePlanet(null)
      setTimeMachineDateState(null)
      setIsReturning(false)
      // Raise the frame-level flag so the NEXT frame resets the camera
      // regardless of any stale surfacePlanet closure still in flight.
      if (typeof window !== 'undefined') {
        window.__cosmosForceCameraReset = true
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

  // Format date for display
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`
  }

  const displayDate = timeMachineDate || new Date()

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{`
        @keyframes marsFlash  { 0% { opacity:1; } 100% { opacity:0; } }
        @keyframes sunPulse   { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes surfaceFadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <Canvas
        camera={{ position: [0, 50, 110], fov: 55, up: [0, 1, 0] }}
        style={{ background: 'transparent', width: '100%', height: 'calc(100% - 30px)' }}
      >
        <Scene
          activeEffect={activeEffect}
          setActiveEffect={setActiveEffect}
          multiplier={multiplier}
          onPlanetClick={setSelectedPlanet}
          setMarsFlash={setMarsFlash}
          selectedPlanet={selectedPlanet}
          surfacePlanet={surfacePlanet}
          initialAngles={initialAngles}
          timeMachineAngles={timeMachineAngles}
          timeMachineFrozen={!!timeMachineDate}
          isReturning={isReturning}
        />
      </Canvas>

      <MarsFlash flash={marsFlash} />

      {/* ── Timer Display (top right) ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '16px', right: '20px',
        zIndex: 25, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px',
      }}>
        <div style={{
          fontSize: '9px', letterSpacing: '0.22em',
          color: timeMachineDate ? 'rgba(52,211,153,0.7)' : 'rgba(148,163,184,0.7)',
          fontFamily: 'sans-serif',
        }}>
          {timeMachineDate ? '⟳ TIME MACHINE' : '🕐 CURRENT TIME'}
        </div>
        <div style={{
          fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em',
          color: timeMachineDate ? '#6ee7b7' : '#e2e8f0',
          fontFamily: 'sans-serif',
          textShadow: timeMachineDate ? '0 0 16px rgba(52,211,153,0.5)' : 'none',
        }}>
          {formatDate(displayDate)}
        </div>
      </div>

      {/* ── Time Machine year HUD ─────────────────────────────────────────── */}
      {timeMachineDate && (
        <div style={{
          position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 25, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        }}>
          <div style={{
            fontSize: '9px', letterSpacing: '0.22em',
            color: 'rgba(52,211,153,0.7)', fontFamily: 'sans-serif',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}><RefreshCw size={10} /> TIME MACHINE</div>
          <div style={{
            fontSize: '32px', fontWeight: 700, letterSpacing: '0.12em',
            color: '#6ee7b7', fontFamily: 'sans-serif',
            textShadow: '0 0 24px rgba(52,211,153,0.6)',
          }}>{timeMachineDate.getFullYear()}</div>
        </div>
      )}

      {activeEffect === 'sun-brighter' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,240,180,0.18) 0%, rgba(255,200,80,0.08) 40%, transparent 70%)',
          animation: 'sunPulse 2s ease-in-out infinite',
        }} />
      )}

      {activeEffect === 'solar-flare' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(circle at 50% 45%, rgba(255,130,10,0.32) 0%, rgba(255,60,0,0.14) 35%, transparent 65%)',
          animation: 'sunPulse 0.7s ease-in-out infinite',
        }} />
      )}

      {activeEffect === 'sun-dies' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(circle at 50% 45%, rgba(50,5,0,0.22) 0%, rgba(10,0,0,0.12) 40%, rgba(2,0,8,0.35) 100%)',
          animation: 'sunPulse 4.5s ease-in-out infinite',
        }} />
      )}

      {activeEffect === 'rogue-planet' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(ellipse at 68% 28%, rgba(90,0,140,0.18) 0%, transparent 52%)',
        }} />
      )}

      {activeEffect === 'earth-stops' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'linear-gradient(90deg, rgba(0,8,25,0.22) 0%, transparent 28%, transparent 72%, rgba(0,8,25,0.12) 100%)',
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
            IN ORBIT: {surfacePlanet.toUpperCase()}
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