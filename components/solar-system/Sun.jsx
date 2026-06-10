import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Sun is always blazingly bright — no dimming, no effect toggling needed.
export default function Sun() {
  const lightRef = useRef()
  const meshRef  = useRef()
  const glowRef  = useRef()

  useFrame((state) => {
    // Gentle pulsing corona glow
    if (glowRef.current) {
      const t = state.clock.elapsedTime
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04)
      glowRef.current.material.opacity = 0.25 + Math.sin(t * 0.9) * 0.05
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
  })

  return (
    <>
      {/* Corona / outer glow — slightly larger transparent sphere */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[7.2, 32, 32]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff4400"
          emissiveIntensity={1.5}
          transparent
          opacity={0.22}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Sun core */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[5.5, 48, 48]} />
        <meshStandardMaterial
          color="#ffcc22"
          emissive="#ff8800"
          emissiveIntensity={3.5}
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Primary point light — illuminates all planets */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={6}
        distance={500}
        decay={1.2}
        color="#ffe8aa"
      />
      {/* Secondary fill light for back-lighting */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        distance={300}
        color="#ff6600"
      />
    </>
  )
}