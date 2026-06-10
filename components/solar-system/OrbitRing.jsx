import { useMemo } from 'react'
import * as THREE from 'three'

export default function OrbitRing({ radius }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() =>
    new THREE.BufferGeometry().setFromPoints(points),
    [points]
  )

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#ffffff" opacity={0.15} transparent />
    </line>
  )
}