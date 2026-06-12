import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Module-scope helpers (created once, never re-created) ────────────────────

function makeRadialTex(stops, size = 512) {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const r = size / 2
  const g = ctx.createRadialGradient(r, r, 0, r, r, r)
  stops.forEach(({ at, color }) => g.addColorStop(at, color))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

// Self-luminous photosphere — plasma surface, not a lit solid sphere
const SUN_MAT = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 } },
  toneMapped: false,
  vertexShader: /* glsl */`
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vViewNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewNormal;

    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
    float n(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x),
                 mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 6; i++) { v += a * n(p); p *= 2.15; a *= 0.5; }
      return v;
    }

    void main() {
      // Turbulent plasma convection
      float gran = fbm(vUv * 32.0 + vec2(time * 0.018, time * 0.011));
      float gran2 = fbm(vUv * 64.0 - vec2(time * 0.009, time * 0.006));
      float granulation = smoothstep(0.35, 0.65, gran) * 0.22
                        + smoothstep(0.40, 0.60, gran2) * 0.10;

      // Slow-moving plasma bands
      float bands = fbm(vec2(vUv.x * 3.5 + time * 0.002, vUv.y * 8.0));
      float bandMask = smoothstep(0.42, 0.58, bands) * 0.12;

      // Sunspots
      float spot1 = smoothstep(0.16, 0.0, length(vUv - vec2(0.30, 0.55)));
      float spot2 = smoothstep(0.11, 0.0, length(vUv - vec2(0.70, 0.40)));
      float sunspots = (spot1 * 0.5 + spot2 * 0.35) * 0.28;

      // Limb darkening — still bright at edge (stars glow), but center is hottest
      float mu = max(0.0, dot(normalize(vViewNormal), vec3(0.0, 0.0, 1.0)));
      float limb = mix(0.78, 1.0, pow(mu, 0.28));
      vec3 edgeWarm = mix(vec3(1.0, 0.55, 0.08), vec3(1.0, 0.92, 0.55), pow(mu, 0.5));

      vec3 deep = vec3(1.0, 0.42, 0.02);
      vec3 mid  = vec3(1.0, 0.72, 0.12);
      vec3 hot  = vec3(1.0, 0.95, 0.65);

      float t = clamp(fbm(vUv * 4.5 + vec2(time * 0.004, 0.0)) + granulation, 0.0, 1.0);
      vec3 col = mix(deep, mid, t);
      col = mix(col, hot, pow(t, 1.6) * 0.55);
      col += granulation * vec3(0.18, 0.10, 0.02);
      col += bandMask * vec3(0.08, 0.04, 0.01);
      col *= edgeWarm;
      col *= limb;
      col *= 1.0 - sunspots;

      // Self-luminous HDR output for bloom
      col *= 2.8;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
})

// 3D corona shell — glows around the sphere in world space (not a flat billboard)
const CORONA_SHELL_MAT = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 } },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  toneMapped: false,
  vertexShader: /* glsl */`
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform float time;
    varying vec3 vNormal;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
    void main() {
      float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.2);
      float flicker = 0.85 + 0.15 * h(vec2(time * 0.4, fresnel * 8.0));
      vec3 col = mix(vec3(1.0, 0.45, 0.05), vec3(1.0, 0.82, 0.35), fresnel);
      gl_FragColor = vec4(col * 1.6 * flicker, fresnel * 0.55 * flicker);
    }
  `,
})

// Outer atmospheric haze sprites
const MAT1 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,220,100,0.35)' },
    { at: 0.20, color: 'rgba(255,170,50,0.18)'  },
    { at: 0.45, color: 'rgba(255,110,20,0.07)'  },
    { at: 0.70, color: 'rgba(220,70,5,0.02)'   },
    { at: 1.00, color: 'rgba(0,0,0,0)'         },
  ], 512),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
})
const MAT2 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,160,40,0.14)'  },
    { at: 0.35, color: 'rgba(240,90,10,0.05)'   },
    { at: 0.65, color: 'rgba(180,50,0,0.015)'  },
    { at: 1.00, color: 'rgba(0,0,0,0)'         },
  ], 512),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
})
const MAT3 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,130,25,0.07)'  },
    { at: 0.40, color: 'rgba(200,60,0,0.02)'   },
    { at: 1.00, color: 'rgba(0,0,0,0)'         },
  ], 256),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
})

// ─── Component ────────────────────────────────────────────────────────────────
export default function Sun({ activeEffect }) {
  const coreRef     = useRef()
  const coronaRef   = useRef()
  const g1Ref       = useRef()
  const g2Ref       = useRef()
  const g3Ref       = useRef()
  const brighterRef = useRef(1.0)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    SUN_MAT.uniforms.time.value = t
    CORONA_SHELL_MAT.uniforms.time.value = t
    if (coreRef.current) coreRef.current.rotation.y += 0.0007

    const target = activeEffect === 'sun-brighter' ? 1.7 : 1.0
    brighterRef.current += (target - brighterRef.current) * 0.02
    const m = brighterRef.current

    if (coronaRef.current) {
      const pulse = 1.0 + Math.sin(t * 1.4) * 0.03
      coronaRef.current.scale.setScalar(1.12 * pulse * m)
    }
    if (g1Ref.current) {
      const s = (10.0 + Math.sin(t * 1.1) * 0.3) * m
      g1Ref.current.scale.set(s, s, 1)
      MAT1.opacity = Math.min(1, (0.7 + Math.sin(t * 0.9) * 0.08) * m)
    }
    if (g2Ref.current) {
      const s = (18.0 + Math.sin(t * 0.7 + 1.0) * 0.5) * m
      g2Ref.current.scale.set(s, s, 1)
      MAT2.opacity = Math.min(1, (0.55 + Math.sin(t * 0.6) * 0.06) * m)
    }
    if (g3Ref.current) {
      const s = (30.0 + Math.sin(t * 0.45 + 2.0) * 0.8) * m
      g3Ref.current.scale.set(s, s, 1)
      MAT3.opacity = Math.min(1, (0.4 + Math.sin(t * 0.35) * 0.05) * m)
    }
  })

  return (
    <>
      {/* Photosphere — self-luminous plasma */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[5.5, 96, 96]} />
        <primitive object={SUN_MAT} attach="material" />
      </mesh>

      {/* Volumetric corona shell tied to the sphere surface */}
      <mesh ref={coronaRef} scale={1.12}>
        <sphereGeometry args={[5.5, 64, 64]} />
        <primitive object={CORONA_SHELL_MAT} attach="material" />
      </mesh>

      {/* Outer atmospheric glow */}
      <sprite ref={g1Ref} scale={[10, 10, 1]}>
        <primitive object={MAT1} attach="material" />
      </sprite>
      <sprite ref={g2Ref} scale={[18, 18, 1]}>
        <primitive object={MAT2} attach="material" />
      </sprite>
      <sprite ref={g3Ref} scale={[30, 30, 1]}>
        <primitive object={MAT3} attach="material" />
      </sprite>

      {/* Sunlight */}
      <pointLight position={[0, 0, 0]} intensity={12} distance={800} decay={1.1} color="#fff0c8" />
      <pointLight position={[0, 0, 0]} intensity={4}  distance={420} decay={1.6} color="#ff9922" />
    </>
  )
}
