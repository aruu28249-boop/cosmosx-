import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const dummy = new THREE.Object3D()

export default function AsteroidBelt({ count = 2000, innerRadius = 50, outerRadius = 65, timeMultiplier = 1 }) {
  const meshRef = useRef()

  const beltData = useRef(null)

  useEffect(() => {
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
  }, [count, innerRadius, outerRadius])

  const frameRef = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current || !beltData.current) return
    const { positions, scales, rotations, speeds, phases, colors } = beltData.current

    // Skip frames at extreme speeds to keep the sim responsive
    const skip = timeMultiplier >= 100 ? 4 : timeMultiplier >= 10 ? 2 : 1
    frameRef.current++
    if (frameRef.current % skip !== 0) return

    const dt = Math.min(delta * skip, 0.05)
    const cappedMult = Math.min(timeMultiplier, 30)

    for (let i = 0; i < count; i++) {
      phases[i] += speeds[i] * dt * cappedMult * 0.8
      
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

  // Advanced material using onBeforeCompile to inject procedural noise displacement
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#ffffff', // base color white to let instance color shine through
      roughness: 0.85,
      metalness: 0.2,
      flatShading: true, // Crucial: automatically calculates crisp normals from our deformed vertices via dFdx/dFdy
    })

    mat.onBeforeCompile = (shader) => {
      // 3D Simplex Noise
      shader.vertexShader = `
        // --- NOISE FUNCTIONS ---
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i); 
          vec4 p = permute( permute( permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
        // -------------------------
      ` + shader.vertexShader

      // Displace vertices before they are transformed
      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `
        vec3 transformed = vec3(position);
        
        // Generate a pseudo-random seed per instance using its translation matrix
        float seed = instanceMatrix[3][0] * 12.3 + instanceMatrix[3][2] * 45.6;
        
        // Base low-frequency distortion for overall shape
        float n1 = snoise(transformed * 1.5 + vec3(seed));
        // High-frequency detail for crags/craters
        float n2 = snoise(transformed * 3.0 - vec3(seed * 0.5)) * 0.4;
        
        // Apply displacement along the normal vector
        // We use the normalized position as a spherical normal since it's an icosahedron
        vec3 dir = normalize(position);
        float displacement = (n1 + n2) * 0.35;
        
        transformed += dir * displacement;
        `
      )

      // Fragment shader: Boost the baseline brightness so the dark side (facing the camera away from the sun) isn't pitch black
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <opaque_fragment>`,
        `
        // Add 40% of the asteroid's base color as a fake ambient glow
        outgoingLight += diffuseColor.rgb * 0.4;
        #include <opaque_fragment>
        `
      )
    }

    return mat
  }, [])

  // Increase detail to 2 so we have enough vertices to deform, 
  // flat shading will make the triangles look like sharp rocky facets.
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 2), [])

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]}>
    </instancedMesh>
  )
}
