import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Planet({ data, timeMultiplier = 1, onPlanetClick, activeEffect, onPositionUpdate }) {
  const meshRef = useRef()
  const moonRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)
  const moonAngleRef = useRef(0)
  const opacityRef = useRef(1)

  useFrame((state, delta) => {
    // Orbit movement
    angleRef.current += data.orbitSpeed * delta * timeMultiplier * 0.3
    const x = Math.cos(angleRef.current) * data.orbitRadius
    const z = Math.sin(angleRef.current) * data.orbitRadius
    meshRef.current.position.x = x
    meshRef.current.position.z = z
    meshRef.current.rotation.y += data.rotationSpeed * delta * timeMultiplier

    // Report Mars position to parent (for asteroid tracking)
    if (onPositionUpdate) {
      onPositionUpdate({ x, y: 0, z })
    }

    // Effect: Jupiter disappear
    if (data.name === 'Jupiter' && activeEffect === 'jupiter-disappear') {
      if (opacityRef.current > 0) opacityRef.current -= 0.005
      meshRef.current.material.opacity = opacityRef.current
      meshRef.current.material.transparent = true
    } else {
      opacityRef.current = 1
      meshRef.current.material.opacity = 1
    }

    // Effect: Second moon orbiting Earth
    if (data.name === 'Earth' && activeEffect === 'two-moons' && moonRef.current) {
      moonAngleRef.current += delta * 2
      moonRef.current.position.x = x + Math.cos(moonAngleRef.current) * 5
      moonRef.current.position.z = z + Math.sin(moonAngleRef.current) * 5
    }
  })

  const showSecondMoon = data.name === 'Earth' && activeEffect === 'two-moons'

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onPlanetClick(data)
        }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {showSecondMoon && (
        <mesh ref={moonRef}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
      )}
    </>
  )
}