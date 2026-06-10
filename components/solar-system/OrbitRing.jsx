import { useMemo } from 'react'
import * as THREE from 'three'

export default function OrbitRing({ radius }) {
  const geometry = useMemo(() => {
    const segments = 180
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
      {/* depthWrite:true + no additive blending = ring hides behind the sun correctly */}
      <lineBasicMaterial
        color="#8aa8d0"
        opacity={0.22}
        transparent
      />
    </line>
  )
}