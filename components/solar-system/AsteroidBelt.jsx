import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const dummy = new THREE.Object3D()

export default function AsteroidBelt({ count = 2000, innerRadius = 50, outerRadius = 65, timeMultiplier = 1 }) {
  const meshRef = useRef()

  const beltData = useRef(null)
  
  if (!beltData.current) {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count * 3)
    const rotations = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    const phases = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const colorObj = new THREE.Color()

    for (let i = 0; i < count; i++) {
      // Pseudo-gaussian distribution for distance
      const r = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
      const distance = innerRadius + (outerRadius - innerRadius) * 0.5 + r * (outerRadius - innerRadius) * 0.5
      
      // Random angle
      const angle = Math.random() * Math.PI * 2
      phases[i] = angle
      
      // Initial positions
      positions[i * 3] = Math.cos(angle) * distance
      
      // Bulge in the middle of the belt for Y thickness
      const centerDist = innerRadius + (outerRadius - innerRadius) * 0.5
      const thicknessFactor = 1.0 - Math.min(1.0, Math.abs(distance - centerDist) / ((outerRadius - innerRadius) * 0.5))
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6 * thicknessFactor
      positions[i * 3 + 2] = Math.sin(angle) * distance

      // Random non-uniform scales (potato shapes)
      const scale = 0.04 + Math.random() * 0.12
      scales[i * 3] = scale * (0.7 + Math.random() * 0.6)
      scales[i * 3 + 1] = scale * (0.7 + Math.random() * 0.6)
      scales[i * 3 + 2] = scale * (0.7 + Math.random() * 0.6)

      // Random initial rotations
      rotations[i * 3] = Math.random() * Math.PI * 2
      rotations[i * 3 + 1] = Math.random() * Math.PI * 2
      rotations[i * 3 + 2] = Math.random() * Math.PI * 2

      // Keplerian speed approximation (further = slower)
      speeds[i] = (15 / Math.pow(distance, 1.5)) * (0.8 + Math.random() * 0.4)

      // Asteroid colors: mixture of dark grey, brownish, and slightly metallic
      const type = Math.random()
      if (type < 0.5) {
        colorObj.setHSL(0, 0, 0.1 + Math.random() * 0.1) // C-type: very dark grey
      } else if (type < 0.8) {
        colorObj.setHSL(0.08, 0.2 + Math.random() * 0.2, 0.2 + Math.random() * 0.15) // S-type: reddish/brownish
      } else {
        colorObj.setHSL(0, 0, 0.3 + Math.random() * 0.1) // M-type: slightly brighter/metallic
      }
      colorObj.toArray(colors, i * 3)
    }

    beltData.current = { positions, scales, rotations, speeds, phases, colors }
  }

  useFrame((_, delta) => {
    if (!meshRef.current || !beltData.current) return
    const { positions, scales, rotations, speeds, phases, colors } = beltData.current

    for (let i = 0; i < count; i++) {
      // Update angle (slowed down significantly)
      phases[i] += speeds[i] * delta * timeMultiplier * 0.8
      
      const distance = Math.sqrt(positions[i * 3] * positions[i * 3] + positions[i * 3 + 2] * positions[i * 3 + 2])
      
      dummy.position.x = Math.cos(phases[i]) * distance
      dummy.position.y = positions[i * 3 + 1]
      dummy.position.z = Math.sin(phases[i]) * distance
      
      // Add slow rotation
      dummy.rotation.x = rotations[i * 3] + phases[i] * 0.5
      dummy.rotation.y = rotations[i * 3 + 1] + phases[i] * 0.3
      dummy.rotation.z = rotations[i * 3 + 2] + phases[i] * 0.4

      dummy.scale.set(scales[i * 3], scales[i * 3 + 1], scales[i * 3 + 2])
      dummy.updateMatrix()
      
      
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    
    // Set colors once on first frame if not set
    if (meshRef.current && !meshRef.current.userData.colorsSet) {
      const colorObj = new THREE.Color()
      for (let i = 0; i < count; i++) {
        colorObj.fromArray(colors, i * 3)
        meshRef.current.setColorAt(i, colorObj)
      }
      meshRef.current.instanceColor.needsUpdate = true
      meshRef.current.userData.colorsSet = true
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // Simple rocky material using vertex colors
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', // base color white to let instance color shine through
    roughness: 0.9,
    metalness: 0.15
  }), [])

  // Icosahedron for slightly more irregular shape than dodecahedron
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), [])

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]}>
    </instancedMesh>
  )
}
