'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Planet({ data, timeMultiplier = 1, onPlanetClick, activeEffect, onPositionUpdate }) {
  const meshRef    = useRef()
  const matRef     = useRef()   // ref to the material for direct mutation
  const moonRef    = useRef()
  const moon2Ref   = useRef()   // second moon for two-moons effect
  const angleRef   = useRef(Math.random() * Math.PI * 2)
  const moonAngleRef  = useRef(0)
  const moon2AngleRef = useRef(Math.PI) // start offset so they aren't overlapping
  const opacityRef = useRef(1)

  useFrame((state, delta) => {
    if (!meshRef.current || !matRef.current) return

    // Orbit movement
    angleRef.current += data.orbitSpeed * delta * timeMultiplier * 0.3
    const x = Math.cos(angleRef.current) * data.orbitRadius
    const z = Math.sin(angleRef.current) * data.orbitRadius
    meshRef.current.position.set(x, 0, z)
    meshRef.current.rotation.y += data.rotationSpeed * delta * timeMultiplier

    // Report Mars position to parent (for asteroid tracking)
    if (onPositionUpdate) {
      onPositionUpdate({ x, y: 0, z })
    }

    // ── Effect: Jupiter disappear ──────────────────────────────────────────────
    if (data.name === 'Jupiter' && activeEffect === 'jupiter-disappear') {
      matRef.current.transparent = true
      if (opacityRef.current > 0) {
        opacityRef.current = Math.max(0, opacityRef.current - 0.005)
      }
      matRef.current.opacity = opacityRef.current
      meshRef.current.visible = opacityRef.current > 0
    } else {
      // Reset opacity when effect is off
      if (data.name === 'Jupiter') {
        opacityRef.current = 1
        matRef.current.transparent = false
        matRef.current.opacity = 1
        meshRef.current.visible = true
      }
    }

    // ── Effect: Second moon orbiting Earth ────────────────────────────────────
    if (data.name === 'Earth' && activeEffect === 'two-moons') {
      // First extra moon
      if (moonRef.current) {
        moonAngleRef.current += delta * 1.8
        moonRef.current.position.set(
          x + Math.cos(moonAngleRef.current) * 4.5,
          0,
          z + Math.sin(moonAngleRef.current) * 4.5
        )
      }
      // Second extra moon (slightly different speed / distance)
      if (moon2Ref.current) {
        moon2AngleRef.current += delta * 1.2
        moon2Ref.current.position.set(
          x + Math.cos(moon2AngleRef.current) * 6,
          0.5,
          z + Math.sin(moon2AngleRef.current) * 6
        )
      }
    }
  })

  const isEarth         = data.name === 'Earth'
  const showTwoMoons    = isEarth && activeEffect === 'two-moons'

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onPlanetClick(data)
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={()  => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        {/* meshStandardMaterial with a ref so we can mutate opacity per-frame */}
        <meshStandardMaterial
          ref={matRef}
          color={data.color}
          transparent={false}
          opacity={1}
        />
      </mesh>

      {/* Two-moons effect: two small grey spheres orbiting Earth */}
      {showTwoMoons && (
        <>
          <mesh ref={moonRef}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#aaaaaa" roughness={0.8} />
          </mesh>
          <mesh ref={moon2Ref}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#bbccdd" roughness={0.9} />
          </mesh>
        </>
      )}
    </>
  )
}