'use client'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Module-scope constants ───────────────────────────────────────────────────
const NUM_STARS = 14
const SPAWN_R   = 200
const TAIL_MAX  = 22

// Geometries and materials created at module scope — avoids all hooks/refs lint
// rules while still being safely mutable in useFrame.
const GEOS = Array.from({ length: NUM_STARS }, () => {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
  return g
})

const MATS = Array.from({ length: NUM_STARS }, () =>
  new THREE.LineBasicMaterial({
    color: 0xeef4ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
)

// ─── Star state helpers ───────────────────────────────────────────────────────
function randomStar() {
  const theta = Math.random() * Math.PI * 2
  const phi   = Math.acos(2 * Math.random() - 1)
  const start = new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi)
  ).multiplyScalar(SPAWN_R)

  const dir = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 0.6,
    (Math.random() - 0.5) * 2
  ).normalize()

  return {
    pos:     start.clone(),
    dir,
    speed:   70 + Math.random() * 110,
    life:    Math.random() * 3,          // stagger on boot
    maxLife: 0.5 + Math.random() * 0.6,
    tailLen: TAIL_MAX * (0.5 + Math.random() * 0.5),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShootingStars() {
  // Mutable star state — plain array in a ref, never triggers re-renders
  const stars = useRef(Array.from({ length: NUM_STARS }, randomStar))

  // Reset opacities on mount so stale values from HMR don't linger
  useEffect(() => {
    MATS.forEach(m => { m.opacity = 0 })
  }, [])

  useFrame((_, delta) => {
    for (let i = 0; i < NUM_STARS; i++) {
      const s   = stars.current[i]
      const mat = MATS[i]
      const pos = GEOS[i].attributes.position

      s.life += delta

      if (s.life >= s.maxLife) {
        Object.assign(s, randomStar())
        s.life = 0
        mat.opacity = 0
        continue
      }

      s.pos.addScaledVector(s.dir, s.speed * delta)

      // Bell-curve opacity envelope
      const t   = s.life / s.maxLife
      const env = Math.sin(t * Math.PI)
      mat.opacity = env * 0.92

      // Head
      pos.setXYZ(0, s.pos.x, s.pos.y, s.pos.z)
      // Tail
      const tl = s.tailLen * env
      pos.setXYZ(1,
        s.pos.x - s.dir.x * tl,
        s.pos.y - s.dir.y * tl,
        s.pos.z - s.dir.z * tl,
      )
      pos.needsUpdate = true
    }
  })

  return (
    <>
      {GEOS.map((geo, i) => (
        <lineSegments key={i} geometry={geo} material={MATS[i]} />
      ))}
    </>
  )
}
