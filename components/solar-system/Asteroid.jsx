import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Asteroid that flies toward Mars and triggers impact flash.
 * Uses emissive + basic material so it's always visible regardless of scene lighting.
 */
export default function Asteroid({ targetPosition, onImpact }) {
  const meshRef     = useRef()
  const glowRef     = useRef()
  const trailRef    = useRef()
  const posRef      = useRef({ x: -150, y: 20, z: -80 })
  const impactedRef = useRef(false)

  // Rocky asteroid surface — emissive so it glows faintly and is always visible
  const rockMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8a7060',
    roughness: 0.95,
    metalness: 0.05,
    emissive: '#3a2010',
    emissiveIntensity: 0.8,    // always partially self-lit
  }), [])

  // Fiery glow shell around the asteroid (heated by atmospheric friction)
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.0, 0.45, 0.05),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  useFrame((_, delta) => {
    if (!meshRef.current || impactedRef.current) return

    const target = targetPosition

    // Lerp toward Mars
    posRef.current.x += (target.x - posRef.current.x) * delta * 0.6
    posRef.current.y += (0        - posRef.current.y) * delta * 0.6
    posRef.current.z += (target.z - posRef.current.z) * delta * 0.6

    meshRef.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z)
    meshRef.current.rotation.x += delta * 4
    meshRef.current.rotation.y += delta * 3

    if (glowRef.current) {
      glowRef.current.position.copy(meshRef.current.position)
      glowRef.current.rotation.copy(meshRef.current.rotation)
      // Pulse the glow
      const pulse = 1.0 + Math.sin(Date.now() * 0.015) * 0.15
      glowRef.current.scale.setScalar(pulse)
      glowMat.opacity = 0.4 + Math.sin(Date.now() * 0.012) * 0.2
    }

    // Impact check
    const dx = posRef.current.x - target.x
    const dz = posRef.current.z - target.z
    if (Math.sqrt(dx * dx + dz * dz) < 2.5) {
      impactedRef.current = true
      meshRef.current.visible = false
      if (glowRef.current) glowRef.current.visible = false
      onImpact()
    }
  })

  return (
    <>
      {/* Rocky asteroid body */}
      <mesh ref={meshRef} position={[-150, 20, -80]}>
        <dodecahedronGeometry args={[1.2, 1]} />
        <primitive object={rockMat} attach="material" />
      </mesh>

      {/* Heated atmospheric entry glow */}
      <mesh ref={glowRef} position={[-150, 20, -80]}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <primitive object={glowMat} attach="material" />
      </mesh>

      {/* Small point light on the asteroid — lights up nearby space */}
      <pointLight
        position={[-150, 20, -80]}
        intensity={3}
        distance={25}
        decay={2}
        color="#ff6600"
      />
    </>
  )
}