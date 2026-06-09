import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Sun({ activeEffect }) {
  const lightRef = useRef()
  const meshRef = useRef()

  useFrame(() => {
    if (activeEffect === 'sun-brighter') {
      if (lightRef.current.intensity < 6) {
        lightRef.current.intensity += 0.05
      }
      if (meshRef.current.material.emissiveIntensity < 3) {
        meshRef.current.material.emissiveIntensity += 0.02
      }
    } else {
      // Reset back to normal
      lightRef.current.intensity = 2
      meshRef.current.material.emissiveIntensity = 0.8
    }
  })

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial
          color="#FDB813"
          emissive="#FDB813"
          emissiveIntensity={0.8}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={2} distance={300} />
    </>
  )
}