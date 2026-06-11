import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Module-scope helpers (created once, never re-created) ────────────────────
// All Three.js objects that need frame-by-frame mutation live here at module
// scope — this is the standard R3F pattern and avoids all hooks/refs lint rules.

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

// Photosphere shader
const SUN_MAT = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 } },
  vertexShader: /* glsl */`
    varying vec2 vUv; varying vec3 vNormal;
    void main() {
      vUv = uv; vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
    }
  `,
  fragmentShader: /* glsl */`
    uniform float time; varying vec2 vUv; varying vec3 vNormal;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
    void main(){
      float g   = fbm(vUv*6.+vec2(time*.009,time*.006));
      float mu  = max(0.,dot(normalize(vNormal),vec3(0.,0.,1.)));
      float limb= 1.-0.6*(1.-sqrt(mu));
      vec3 white=vec3(1.00,0.98,0.92), yellow=vec3(1.00,0.84,0.22), orange=vec3(0.98,0.47,0.06);
      float t=clamp(g*.6+.4,0.,1.);
      vec3 col=mix(orange,yellow,t); col=mix(col,white,t*t*.5);
      col*=limb; col=min(col*1.7,vec3(1.));
      gl_FragColor=vec4(col,1.);
    }
  `,
})

// 5-layer corona sprite materials
const MAT1 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,252,220,0.80)' },
    { at: 0.18, color: 'rgba(255,230,100,0.50)' },
    { at: 0.40, color: 'rgba(255,170,30,0.18)'  },
    { at: 0.70, color: 'rgba(255,120,0,0.04)'   },
    { at: 1.00, color: 'rgba(0,0,0,0)'          },
  ], 512),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
})
const MAT2 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,220,80,0.45)'  },
    { at: 0.25, color: 'rgba(255,160,20,0.28)'  },
    { at: 0.55, color: 'rgba(240,90,10,0.10)'   },
    { at: 0.80, color: 'rgba(200,50,0,0.02)'    },
    { at: 1.00, color: 'rgba(0,0,0,0)'          },
  ], 512),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
})
const MAT3 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,150,20,0.28)'  },
    { at: 0.30, color: 'rgba(240,80,5,0.14)'    },
    { at: 0.60, color: 'rgba(180,40,0,0.05)'    },
    { at: 1.00, color: 'rgba(0,0,0,0)'          },
  ], 256),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
})
const MAT4 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,200,50,0.16)'  },
    { at: 0.35, color: 'rgba(255,120,10,0.08)'  },
    { at: 0.70, color: 'rgba(200,60,0,0.02)'    },
    { at: 1.00, color: 'rgba(0,0,0,0)'          },
  ], 256),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
})
const MAT5 = new THREE.SpriteMaterial({
  map: makeRadialTex([
    { at: 0.00, color: 'rgba(255,180,40,0.08)'  },
    { at: 0.40, color: 'rgba(255,100,10,0.03)'  },
    { at: 1.00, color: 'rgba(0,0,0,0)'          },
  ], 128),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
})

// ─── Component ────────────────────────────────────────────────────────────────
export default function Sun() {
  const coreRef = useRef()
  const g1Ref   = useRef()
  const g2Ref   = useRef()
  const g3Ref   = useRef()
  const g4Ref   = useRef()
  const g5Ref   = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    SUN_MAT.uniforms.time.value = t
    if (coreRef.current) coreRef.current.rotation.y += 0.0007

    if (g1Ref.current) { const s = 13.0 + Math.sin(t * 1.3) * 0.4;  g1Ref.current.scale.set(s, s, 1) }
    if (g2Ref.current) { const s = 20.0 + Math.sin(t * 0.9 + 1.0) * 0.7; g2Ref.current.scale.set(s, s, 1); MAT2.opacity = 0.90 + Math.sin(t * 1.1) * 0.08 }
    if (g3Ref.current) { const s = 32.0 + Math.sin(t * 0.7 + 2.0) * 1.2; g3Ref.current.scale.set(s, s, 1); MAT3.opacity = 0.85 + Math.sin(t * 0.8) * 0.10 }
    if (g4Ref.current) { const s = 52.0 + Math.sin(t * 0.5 + 0.5) * 1.8; g4Ref.current.scale.set(s, s, 1); MAT4.opacity = 0.80 + Math.sin(t * 0.6) * 0.12 }
    if (g5Ref.current) { const s = 85.0 + Math.sin(t * 0.35 + 3.0) * 2.5; g5Ref.current.scale.set(s, s, 1); MAT5.opacity = 0.75 + Math.sin(t * 0.4) * 0.15 }
  })

  return (
    <>
      {/* Photosphere core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[5.5, 64, 64]} />
        <primitive object={SUN_MAT} attach="material" />
      </mesh>

      {/* 5-layer additive corona — camera-facing sprites, zero ring artifacts */}
      <sprite ref={g1Ref} scale={[13, 13, 1]}>
        <primitive object={MAT1} attach="material" />
      </sprite>
      <sprite ref={g2Ref} scale={[20, 20, 1]}>
        <primitive object={MAT2} attach="material" />
      </sprite>
      <sprite ref={g3Ref} scale={[32, 32, 1]}>
        <primitive object={MAT3} attach="material" />
      </sprite>
      <sprite ref={g4Ref} scale={[52, 52, 1]}>
        <primitive object={MAT4} attach="material" />
      </sprite>
      <sprite ref={g5Ref} scale={[85, 85, 1]}>
        <primitive object={MAT5} attach="material" />
      </sprite>

      {/* Sunlight */}
      <pointLight position={[0,0,0]} intensity={12} distance={800} decay={1.0} color="#fff8e0" />
      <pointLight position={[0,0,0]} intensity={5}  distance={450} decay={1.4} color="#ff8800" />
    </>
  )
}