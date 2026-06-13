import { useMemo } from 'react'
import * as THREE from 'three'

export default function OrbitRing({ radius, glowing = false }) {
  const geometry = useMemo(() => {
    const segments = 200
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={glowing ? '#7ec8ff' : '#8aa8d0'}
        opacity={glowing ? 0.72 : 0.22}
        transparent
      />
    </line>
  )
}