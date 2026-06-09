'use client'
import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { PLANETS } from '@/data/planets'
import Sun from './solar-system/Sun'
import OrbitRing from './solar-system/OrbitRing'
import Planet from './solar-system/Planet'
import InfoPanel from './solar-system/InfoPanel'
import TimeControls from './solar-system/TimeControls'
import Asteroid from './solar-system/Asteroid'

// Exported so AI Simulator can call it
export let triggerEffect = () => {}

function Scene({ activeEffect, setActiveEffect, multiplier, onPlanetClick }) {
  const marsPositionRef = useRef({ x: 42, y: 0, z: 0 })

  return (
    <>
      <ambientLight intensity={0.2} />
      <Stars radius={200} depth={50} count={5000} factor={4} />
      <OrbitControls enableZoom={true} enableRotate={true} />

      <Sun activeEffect={activeEffect} />

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
        <OrbitRing key={planet.name} radius={planet.orbitRadius} />
      ))}

      {activeEffect === 'asteroid-hit-mars' && (
        <Asteroid
          targetPosition={marsPositionRef.current}
          onImpact={() => setTimeout(() => setActiveEffect(null), 1000)}
        />
      )}
    </>
  )
}

export default function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [multiplier, setMultiplier] = useState(1)
  const [activeEffect, setActiveEffect] = useState(null)

  // Wire up the exported function
  triggerEffect = (scenarioName) => {
    setActiveEffect(scenarioName)
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 60, 120], fov: 60 }}
        style={{ background: 'black' }}
      >
        <Scene
          activeEffect={activeEffect}
          setActiveEffect={setActiveEffect}
          multiplier={multiplier}
          onPlanetClick={setSelectedPlanet}
        />
      </Canvas>

      <InfoPanel
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
      />
      <TimeControls
        multiplier={multiplier}
        setMultiplier={setMultiplier}
      />

      {/* Effect reset button */}
      {activeEffect && (
        <button
          onClick={() => setActiveEffect(null)}
          style={{
            position: 'absolute', top: '20px', left: '20px',
            zIndex: 10, padding: '8px 16px',
            backgroundColor: 'rgba(255,50,50,0.7)',
            border: 'none', borderRadius: '8px',
            color: 'white', cursor: 'pointer'
          }}
        >
          Reset Effect
        </button>
      )}
    </div>
  )
}