import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Asteroid({ targetPosition, onImpact }) {
  const meshRef = useRef()
  const posRef = useRef({ x: -120, y: 10, z: -60 })
  const impactedRef = useRef(false)

  useFrame(() => {
    if (impactedRef.current) return

    // Move toward Mars position
    posRef.current.x += (targetPosition.x - posRef.current.x) * 0.01
    posRef.current.y += (0 - posRef.current.y) * 0.01
    posRef.current.z += (targetPosition.z - posRef.current.z) * 0.01

    meshRef.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z)
    meshRef.current.rotation.x += 0.05
    meshRef.current.rotation.y += 0.03

    // Check if close enough to Mars
    const dx = posRef.current.x - targetPosition.x
    const dz = posRef.current.z - targetPosition.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < 2) {
      impactedRef.current = true
      onImpact()
    }
  })

  return (
    <mesh ref={meshRef} position={[-120, 10, -60]}>
      <dodecahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color="#888888" />
    </mesh>
  )
}