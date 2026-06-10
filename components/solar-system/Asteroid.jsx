import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Asteroid that flies toward Mars and triggers impact flash.
 * Props:
 *   targetRef      – a ref object that holds { x, y, z } of Mars (updated every frame)
 *   onImpact()     – called once when the asteroid is close enough
 */
export default function Asteroid({ targetPosition, onImpact }) {
  const meshRef     = useRef()
  const posRef      = useRef({ x: -150, y: 20, z: -80 })
  const impactedRef = useRef(false)

  useFrame((_, delta) => {
    if (!meshRef.current || impactedRef.current) return

    const target = targetPosition   // { x, y, z }

    // Lerp toward Mars
    posRef.current.x += (target.x - posRef.current.x) * delta * 0.6
    posRef.current.y += (0        - posRef.current.y) * delta * 0.6
    posRef.current.z += (target.z - posRef.current.z) * delta * 0.6

    meshRef.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z)
    meshRef.current.rotation.x += delta * 4
    meshRef.current.rotation.y += delta * 3

    // Impact check
    const dx = posRef.current.x - target.x
    const dz = posRef.current.z - target.z
    if (Math.sqrt(dx * dx + dz * dz) < 2.5) {
      impactedRef.current = true
      meshRef.current.visible = false
      onImpact()
    }
  })

  return (
    <mesh ref={meshRef} position={[-150, 20, -80]}>
      <dodecahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.2} />
    </mesh>
  )
}