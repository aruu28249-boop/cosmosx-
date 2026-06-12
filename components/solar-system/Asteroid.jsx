import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Asteroid surface shader — displaced rocky body with glowing cracks ───────
const ASTEROID_VERT = /* glsl */`
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  // Simple 3D hash
  float hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  // 3D value noise
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x),
          mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
          mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
      f.z);
    return n;
  }

  float fbm3(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise3(p);
      p *= 2.03;
      a *= 0.47;
    }
    return v;
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    // Displace vertices along normal for rocky irregular shape
    vec3 displaced = position;
    float disp = fbm3(position * 1.8 + vec3(0.0, 0.0, time * 0.1)) - 0.5;
    disp += (fbm3(position * 4.5) - 0.5) * 0.3; // fine crags
    displaced += normal * disp * 0.35;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

const ASTEROID_FRAG = /* glsl */`
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.07; a *= 0.48; }
    return v;
  }

  // Voronoi for cracks
  float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float md = 8.0;
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash(n + g), hash(n + g + vec2(31.0, 17.0)));
      vec2 r = g + o - f;
      float d = dot(r, r);
      md = min(md, d);
    }
    return sqrt(md);
  }

  void main() {
    // ── Base rock color with variation ──
    vec2 uv2 = vUv * 6.0;
    float rockNoise = fbm(uv2 + vec2(1.3, 2.7));
    vec3 darkRock  = vec3(0.12, 0.08, 0.06);
    vec3 midRock   = vec3(0.28, 0.20, 0.15);
    vec3 lightRock = vec3(0.42, 0.34, 0.28);

    vec3 rockColor = mix(darkRock, midRock, smoothstep(0.3, 0.55, rockNoise));
    rockColor = mix(rockColor, lightRock, smoothstep(0.6, 0.8, rockNoise));

    // ── Cracks with glowing lava veins ──
    float cracks = voronoi(vUv * 12.0 + vec2(time * 0.05));
    float crackLine = 1.0 - smoothstep(0.0, 0.08, cracks);
    float crackGlow = 1.0 - smoothstep(0.0, 0.18, cracks);

    // Pulsing lava in cracks
    float pulse = 0.7 + 0.3 * sin(time * 3.0 + vUv.x * 10.0);
    vec3 lavaHot  = vec3(1.0, 0.6, 0.08) * pulse;
    vec3 lavaCool = vec3(0.8, 0.15, 0.02) * pulse;
    vec3 lavaColor = mix(lavaCool, lavaHot, crackLine);

    // Mix cracks into surface
    rockColor = mix(rockColor, lavaColor, crackGlow * 0.85);

    // ── Surface craters / pitting ──
    float craters = fbm(vUv * 18.0 + vec2(5.1, 3.8));
    rockColor *= 0.85 + 0.15 * craters;

    // ── Heated leading edge (atmospheric entry) ──
    float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
    float heatRim = pow(rim, 2.5);
    vec3 heatColor = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.8, 0.3), heatRim);
    rockColor += heatColor * heatRim * 1.2;

    // ── Subtle diffuse lighting ──
    float diffuse = max(0.0, dot(vNormal, normalize(vec3(0.5, 0.8, 0.3))));
    rockColor *= 0.55 + 0.45 * diffuse;

    // ── Emissive boost from cracks ──
    float emissive = crackGlow * 0.6 + heatRim * 0.4;

    gl_FragColor = vec4(rockColor + rockColor * emissive * 0.5, 1.0);
  }
`

// ─── Trail particle pool ──────────────────────────────────────────────────────
const TRAIL_COUNT = 120

function TrailParticles({ trailRef }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(TRAIL_COUNT * 3)
    const colors    = new Float32Array(TRAIL_COUNT * 3)
    const sizes     = new Float32Array(TRAIL_COUNT)
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    g.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))
    return g
  }, [])

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [])

  return <points ref={trailRef} geometry={geo} material={mat} />
}

// ─── Explosion particle system ────────────────────────────────────────────────
const EXPLOSION_COUNT = 100
const DEBRIS_COUNT = 20

function ExplosionParticles({ active, impactPos }) {
  const pointsRef  = useRef()
  const debrisRefs = useRef([])
  const dataRef    = useRef(null)
  const timeRef    = useRef(0)

  // Initialise explosion data on activation
  if (active && !dataRef.current) {
    const particles = []
    for (let i = 0; i < EXPLOSION_COUNT; i++) {
      // Spherical burst
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const speed = 2 + Math.random() * 12
      particles.push({
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed * 0.6 + Math.random() * 3,
        vz: Math.cos(phi) * speed,
        life: 0.6 + Math.random() * 1.8,
        size: 0.15 + Math.random() * 0.5,
        // Color temperature: white-hot core → orange → red → dark
        temp: Math.random(),
      })
    }

    const debris = []
    for (let i = 0; i < DEBRIS_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const sp    = 1 + Math.random() * 6
      debris.push({
        x: impactPos.x, y: impactPos.y || 0, z: impactPos.z,
        vx: Math.cos(angle) * sp * (0.5 + Math.random()),
        vy: 1 + Math.random() * 5,
        vz: Math.sin(angle) * sp * (0.5 + Math.random()),
        rotSpeed: (Math.random() - 0.5) * 10,
        scale: 0.1 + Math.random() * 0.35,
        life: 1.0 + Math.random() * 2.0,
      })
    }

    dataRef.current = { particles, debris, elapsed: 0 }
    timeRef.current = 0
  }

  // Reset when deactivated
  if (!active && dataRef.current) {
    dataRef.current = null
    timeRef.current = 0
  }

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos    = new Float32Array(EXPLOSION_COUNT * 3)
    const colors = new Float32Array(EXPLOSION_COUNT * 3)
    const sizes  = new Float32Array(EXPLOSION_COUNT)
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    g.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))
    return g
  }, [])

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }), [])

  useFrame((_, delta) => {
    if (!active || !dataRef.current || !pointsRef.current) return

    const d = dataRef.current
    d.elapsed += delta
    timeRef.current += delta

    const posArr  = geo.attributes.position.array
    const colArr  = geo.attributes.color.array
    const sizeArr = geo.attributes.size.array

    for (let i = 0; i < EXPLOSION_COUNT; i++) {
      const p = d.particles[i]
      const t = d.elapsed
      const lifeRatio = Math.min(t / p.life, 1)

      const x = impactPos.x + p.vx * t * (1 - lifeRatio * 0.5)
      const y = (impactPos.y || 0) + p.vy * t - 4.9 * t * t * 0.3
      const z = impactPos.z + p.vz * t * (1 - lifeRatio * 0.5)

      posArr[i * 3]     = x
      posArr[i * 3 + 1] = y
      posArr[i * 3 + 2] = z

      // Color: white → yellow → orange → red → dark ember
      const fade = 1 - lifeRatio
      if (lifeRatio < 0.1) {
        // White-hot core
        colArr[i * 3]     = 1.0
        colArr[i * 3 + 1] = 0.95
        colArr[i * 3 + 2] = 0.8
      } else if (lifeRatio < 0.3) {
        // Yellow-orange
        colArr[i * 3]     = 1.0
        colArr[i * 3 + 1] = 0.6 * fade
        colArr[i * 3 + 2] = 0.1 * fade
      } else if (lifeRatio < 0.6) {
        // Deep orange to red
        colArr[i * 3]     = 0.9 * fade
        colArr[i * 3 + 1] = 0.2 * fade
        colArr[i * 3 + 2] = 0.02
      } else {
        // Dying embers
        colArr[i * 3]     = 0.3 * fade
        colArr[i * 3 + 1] = 0.05 * fade
        colArr[i * 3 + 2] = 0.01
      }

      sizeArr[i] = p.size * fade * (1 + (1 - lifeRatio) * 2)
    }

    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate    = true
    geo.attributes.size.needsUpdate     = true

    // Fade overall opacity
    mat.opacity = Math.max(0, 1 - d.elapsed / 2.5)

    // Update debris chunks
    debrisRefs.current.forEach((ref, i) => {
      if (!ref) return
      const db = d.debris[i]
      if (!db) return
      const lifeRatio = Math.min(d.elapsed / db.life, 1)
      ref.position.set(
        db.x + db.vx * d.elapsed,
        db.y + db.vy * d.elapsed - 4.9 * d.elapsed * d.elapsed * 0.4,
        db.z + db.vz * d.elapsed
      )
      ref.rotation.x += db.rotSpeed * delta
      ref.rotation.z += db.rotSpeed * delta * 0.7
      const s = db.scale * (1 - lifeRatio)
      ref.scale.setScalar(Math.max(0, s))
      ref.visible = lifeRatio < 1
    })
  })

  if (!active) return null

  return (
    <>
      <points ref={pointsRef} geometry={geo} material={mat} />

      {/* Debris chunks — small rocky fragments */}
      {Array.from({ length: DEBRIS_COUNT }).map((_, i) => (
        <mesh
          key={`debris-${i}`}
          ref={el => { debrisRefs.current[i] = el }}
          position={[impactPos.x, impactPos.y || 0, impactPos.z]}
        >
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color="#8a5030"
            emissive="#ff4400"
            emissiveIntensity={1.5}
            roughness={0.9}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Shockwave ring ───────────────────────────────────────────────────────────
function ShockwaveRing({ active, impactPos }) {
  const ringRef = useRef()
  const matRef  = useRef()
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    if (!active || !ringRef.current) return
    timeRef.current += delta

    const t = timeRef.current
    const maxTime = 2.0
    const progress = Math.min(t / maxTime, 1)

    // Expand outward
    const scale = 1 + progress * 25
    ringRef.current.scale.set(scale, scale, scale)

    // Fade out
    if (matRef.current) {
      matRef.current.opacity = (1 - progress) * 0.6
    }

    ringRef.current.rotation.z += delta * 0.5
  })

  if (!active) return null

  return (
    <mesh
      ref={ringRef}
      position={[impactPos.x, impactPos.y || 0, impactPos.z]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.8, 1.2, 64]} />
      <meshBasicMaterial
        ref={matRef}
        color="#ff6622"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Impact flash (bright sphere burst) ───────────────────────────────────────
function ImpactFlash({ active, impactPos }) {
  const meshRef = useRef()
  const matRef  = useRef()
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return
    timeRef.current += delta

    const t = timeRef.current
    const flashDuration = 0.8

    if (t < flashDuration) {
      const progress = t / flashDuration
      // Rapid expansion then shrink
      const scale = progress < 0.15
        ? progress / 0.15 * 6
        : 6 * (1 - (progress - 0.15) / 0.85)
      meshRef.current.scale.setScalar(Math.max(0.01, scale))

      if (matRef.current) {
        matRef.current.opacity = (1 - progress) * 0.9
      }
    } else {
      meshRef.current.visible = false
    }
  })

  if (!active) return null

  return (
    <>
      <mesh
        ref={meshRef}
        position={[impactPos.x, impactPos.y || 0, impactPos.z]}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          ref={matRef}
          color="#ffcc44"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Brief impact light */}
      {active && (
        <pointLight
          position={[impactPos.x, (impactPos.y || 0) + 1, impactPos.z]}
          intensity={25}
          distance={45}
          decay={2}
          color="#ff8800"
        />
      )}
    </>
  )
}

// ─── Camera shake ─────────────────────────────────────────────────────────────
function CameraShake({ active }) {
  const { camera } = useThree()
  const basePos    = useRef(null)
  const timeRef    = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033)

    if (!active) {
      if (basePos.current) {
        camera.position.copy(basePos.current)
        basePos.current = null
        timeRef.current = 0
      }
      return
    }

    if (!basePos.current) {
      basePos.current = camera.position.clone()
    }

    timeRef.current += dt
    const t = timeRef.current
    const shakeDuration = 0.9
    const falloff = Math.max(0, 1 - t / shakeDuration)
    const intensity = falloff * falloff * 0.8

    if (intensity > 0.01) {
      // Smooth sine shake — avoids fighting OrbitControls with random jitter
      camera.position.x = basePos.current.x + Math.sin(t * 38) * intensity
      camera.position.y = basePos.current.y + Math.cos(t * 31) * intensity * 0.7
      camera.position.z = basePos.current.z + Math.sin(t * 24) * intensity * 0.4
    } else {
      camera.position.copy(basePos.current)
    }
  })

  return null
}


/**
 * Asteroid that flies toward Mars with a fiery trail,
 * then explodes with particles, shockwave, debris & camera shake.
 * The asteroid body uses a custom shader for realistic rocky surface
 * with glowing lava-vein cracks and atmospheric re-entry heating.
 */
const BASE_ASTEROID_SPEED = 160
const IMPACT_RADIUS       = 3.8

export default function Asteroid({ targetPosition, targetRef, timeMultiplier = 1, onImpact, onExplosionChange }) {
  const meshRef      = useRef()
  const glow1Ref     = useRef()
  const glow2Ref     = useRef()
  const glow3Ref     = useRef()
  const heatConeRef  = useRef()
  const lightRef     = useRef()
  const trailRef     = useRef()
  const posRef       = useRef({ x: -150, y: 20, z: -80 })
  const prevTargetRef = useRef(null)
  const velRef       = useRef({ x: 0, z: 0 })
  const impactedRef  = useRef(false)
  const trailIdx     = useRef(0)
  const trailTimer   = useRef(0)
  const [exploding, setExploding] = useState(false)
  const [impactPos, setImpactPos] = useState({ x: 0, y: 0, z: 0 })

  // Shader material for the asteroid body
  const asteroidMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: ASTEROID_VERT,
    fragmentShader: ASTEROID_FRAG,
  }), [])

  // Layered glow materials — different sizes/colors for depth
  const glowMat1 = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.0, 0.45, 0.05),
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  }), [])

  const glowMat2 = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.0, 0.25, 0.02),
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  }), [])

  const glowMat3 = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.9, 0.15, 0.0),
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  }), [])

  // Heat cone material (trailing fire wake)
  const heatConeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.0, 0.4, 0.02),
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }), [])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.033)

    // Update shader time
    if (asteroidMat.uniforms) {
      asteroidMat.uniforms.time.value = clock.elapsedTime
    }

    // ── Trail particles (while flying) ──
    if (trailRef.current && meshRef.current?.visible) {
      trailTimer.current += dt
      if (trailTimer.current > 0.03) {
        trailTimer.current = 0
        const posArr  = trailRef.current.geometry.attributes.position.array
        const colArr  = trailRef.current.geometry.attributes.color.array
        const sizeArr = trailRef.current.geometry.attributes.size.array
        const idx = trailIdx.current % TRAIL_COUNT

        // Jitter for a smoky trail
        posArr[idx * 3]     = posRef.current.x + (Math.random() - 0.5) * 2.0
        posArr[idx * 3 + 1] = posRef.current.y + (Math.random() - 0.5) * 2.0
        posArr[idx * 3 + 2] = posRef.current.z + (Math.random() - 0.5) * 2.0

        // Varied fire colors: white-hot → orange → red → dark smoke
        const r = Math.random()
        if (r < 0.15) {
          // White-hot sparks
          colArr[idx * 3]     = 1.0
          colArr[idx * 3 + 1] = 0.9
          colArr[idx * 3 + 2] = 0.6
        } else if (r < 0.5) {
          // Bright orange
          colArr[idx * 3]     = 1.0
          colArr[idx * 3 + 1] = 0.4 + Math.random() * 0.2
          colArr[idx * 3 + 2] = 0.02
        } else if (r < 0.8) {
          // Deep red
          colArr[idx * 3]     = 0.7 + Math.random() * 0.3
          colArr[idx * 3 + 1] = 0.1 + Math.random() * 0.15
          colArr[idx * 3 + 2] = 0.01
        } else {
          // Dark smoke/ember
          colArr[idx * 3]     = 0.25
          colArr[idx * 3 + 1] = 0.08
          colArr[idx * 3 + 2] = 0.02
        }

        sizeArr[idx] = 0.2 + Math.random() * 0.8

        trailRef.current.geometry.attributes.position.needsUpdate = true
        trailRef.current.geometry.attributes.color.needsUpdate    = true
        trailRef.current.geometry.attributes.size.needsUpdate     = true
        trailIdx.current++
      }

      // Fade old trail particles
      const sizeArr = trailRef.current.geometry.attributes.size.array
      for (let i = 0; i < TRAIL_COUNT; i++) {
        if (sizeArr[i] > 0) sizeArr[i] *= 0.965
      }
      trailRef.current.geometry.attributes.size.needsUpdate = true
    }

    if (!meshRef.current || impactedRef.current) return

    const target = targetRef ? targetRef.current : targetPosition
    if (!target) return

    // Track Mars velocity so we can lead the intercept, not chase its tail
    if (prevTargetRef.current) {
      const invDt = 1 / Math.max(dt, 0.001)
      velRef.current.x = (target.x - prevTargetRef.current.x) * invDt
      velRef.current.z = (target.z - prevTargetRef.current.z) * invDt
    }
    prevTargetRef.current = { x: target.x, z: target.z }

    const marsSpeed = Math.hypot(velRef.current.x, velRef.current.z)
    // Scale intercept speed to always outpace Mars at any timeMultiplier.
    // marsSpeed already reflects the current multiplier so we must beat it
    // by a comfortable margin plus a base that grows with the multiplier.
    const asteroidSpeed = Math.max(
      BASE_ASTEROID_SPEED + timeMultiplier * 18,
      marsSpeed * 3.5 + BASE_ASTEROID_SPEED,
    )

    const toMarsX = target.x - posRef.current.x
    const toMarsZ = target.z - posRef.current.z
    const marsDist = Math.hypot(toMarsX, toMarsZ)

    // Aim ahead of Mars based on time-to-reach
    const leadTime = Math.min(Math.max(marsDist / asteroidSpeed, 0.35), 2.5)
    const aimX = target.x + velRef.current.x * leadTime
    const aimZ = target.z + velRef.current.z * leadTime

    const dx = aimX - posRef.current.x
    const dz = aimZ - posRef.current.z
    const aimDist = Math.hypot(dx, dz)
    const dist = marsDist

    // Fixed-speed homing — fast enough to overtake an orbiting planet
    if (aimDist > 0.001) {
      const step = asteroidSpeed * dt
      const ratio = Math.min(step / aimDist, 1)
      posRef.current.x += dx * ratio
      posRef.current.z += dz * ratio
    }

    posRef.current.y += (target.y - posRef.current.y) * dt * 3.5

    const px = posRef.current.x
    const py = posRef.current.y
    const pz = posRef.current.z

    meshRef.current.position.set(px, py, pz)
    meshRef.current.rotation.x += dt * 2.5
    meshRef.current.rotation.y += dt * 1.8
    meshRef.current.rotation.z += dt * 0.7

    // Glow shells follow the asteroid
    const glowPulse = 1.0 + Math.sin(clock.elapsedTime * 6) * 0.1
    if (glow1Ref.current) {
      glow1Ref.current.position.set(px, py, pz)
      glow1Ref.current.scale.setScalar(glowPulse)
      glowMat1.opacity = 0.3 + Math.sin(clock.elapsedTime * 8) * 0.1
    }
    if (glow2Ref.current) {
      glow2Ref.current.position.set(px, py, pz)
      glow2Ref.current.scale.setScalar(glowPulse * 1.05)
      glowMat2.opacity = 0.15 + Math.sin(clock.elapsedTime * 5) * 0.06
    }
    if (glow3Ref.current) {
      glow3Ref.current.position.set(px, py, pz)
      glow3Ref.current.scale.setScalar(glowPulse * 1.1)
    }

    // Heat cone follows behind the asteroid, pointing away from travel direction
    if (heatConeRef.current) {
      heatConeRef.current.position.set(px, py, pz)
      // Point cone away from Mars (backward along travel direction)
      const travelDir = new THREE.Vector3(dx, 0, dz).normalize()
      const backDir   = travelDir.clone().negate()
      const up = new THREE.Vector3(0, 1, 0)
      const quat = new THREE.Quaternion().setFromUnitVectors(up, backDir)
      heatConeRef.current.quaternion.copy(quat)
      // Pulse the cone opacity
      heatConeMat.opacity = 0.2 + Math.sin(clock.elapsedTime * 10) * 0.08
    }

    // Move trailing point light
    if (lightRef.current) {
      lightRef.current.position.set(px, py, pz)
      lightRef.current.intensity = 3 + Math.max(0, (1 - dist / 100)) * 18
    }

    // Impact check — use live Mars position, not the lead point
    if (marsDist < IMPACT_RADIUS) {
      impactedRef.current = true
      meshRef.current.visible = false
      if (glow1Ref.current) glow1Ref.current.visible = false
      if (glow2Ref.current) glow2Ref.current.visible = false
      if (glow3Ref.current) glow3Ref.current.visible = false
      if (heatConeRef.current) heatConeRef.current.visible = false
      if (lightRef.current) lightRef.current.intensity = 0

      setImpactPos({ x: px, y: 0, z: pz })
      setExploding(true)
      onExplosionChange?.(true)

      setTimeout(() => {
        onImpact()
      }, 300)

      setTimeout(() => {
        setExploding(false)
        onExplosionChange?.(false)
      }, 2500)
    }
  })

  return (
    <>
      {/* ── Asteroid body — shader-driven rocky surface with lava cracks ── */}
      <mesh ref={meshRef} position={[-150, 20, -80]}>
        <icosahedronGeometry args={[1.3, 4]} />
        <primitive object={asteroidMat} attach="material" />
      </mesh>

      {/* ── Layered atmospheric glow shells ── */}
      {/* Inner glow — bright orange, tight to surface */}
      <mesh ref={glow1Ref} position={[-150, 20, -80]}>
        <sphereGeometry args={[2.0, 24, 24]} />
        <primitive object={glowMat1} attach="material" />
      </mesh>

      {/* Mid glow — deeper red, slightly larger */}
      <mesh ref={glow2Ref} position={[-150, 20, -80]}>
        <sphereGeometry args={[2.8, 20, 20]} />
        <primitive object={glowMat2} attach="material" />
      </mesh>

      {/* Outer halo — faint red, large aura */}
      <mesh ref={glow3Ref} position={[-150, 20, -80]}>
        <sphereGeometry args={[4.0, 16, 16]} />
        <primitive object={glowMat3} attach="material" />
      </mesh>

      {/* ── Heat cone — trailing fire wake behind asteroid ── */}
      <mesh ref={heatConeRef} position={[-150, 20, -80]}>
        <coneGeometry args={[1.8, 6, 16, 1, true]} />
        <primitive object={heatConeMat} attach="material" />
      </mesh>

      {/* Trailing point light */}
      <pointLight
        ref={lightRef}
        position={[-150, 20, -80]}
        intensity={3}
        distance={45}
        decay={2}
        color="#ff6600"
      />

      {/* Secondary warm light for ambient illumination */}
      <pointLight
        position={[-150, 20, -80]}
        intensity={1.5}
        distance={20}
        decay={2}
        color="#ff2200"
      />

      {/* Fiery trail particles */}
      <TrailParticles trailRef={trailRef} />

      {/* ── Impact effects ── */}
      <ExplosionParticles active={exploding} impactPos={impactPos} />
      <ShockwaveRing      active={exploding} impactPos={impactPos} />
      <ImpactFlash        active={exploding} impactPos={impactPos} />
      <CameraShake        active={exploding} />
    </>
  )
}