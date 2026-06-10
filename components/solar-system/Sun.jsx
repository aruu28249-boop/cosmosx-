import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Build a soft radial-gradient sprite texture
function makeGlowTex(inner, mid, size = 512) {
  if (typeof document === 'undefined') return null
  const c   = document.createElement('canvas')
  c.width   = size
  c.height  = size
  const ctx = c.getContext('2d')
  const r   = size / 2
  const g   = ctx.createRadialGradient(r, r, 0, r, r, r)
  g.addColorStop(0.0,  inner)
  g.addColorStop(0.18, inner)
  g.addColorStop(0.50, mid)
  g.addColorStop(1.0,  'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

export default function Sun() {
  const coreRef = useRef()
  const s1Ref   = useRef()
  const s2Ref   = useRef()
  const s3Ref   = useRef()

  // Photosphere GLSL shader — granulation + limb darkening only
  const sunMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv      = uv;
        vNormal  = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;

      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float n(vec2 p){
        vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),
                   mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}

      void main(){
        // Slow animated granulation
        float g = fbm(vUv * 6. + vec2(time*.009, time*.006));

        // Accurate limb darkening  u≈0.6
        float mu   = max(0., dot(normalize(vNormal), vec3(0.,0.,1.)));
        float limb = 1. - 0.6*(1. - sqrt(mu));

        // Colour ramp: near-white hot centre → yellow → orange edge
        vec3 white  = vec3(1.00, 0.97, 0.90);
        vec3 yellow = vec3(1.00, 0.83, 0.20);
        vec3 orange = vec3(0.97, 0.46, 0.05);
        float t     = clamp(g * .6 + .4, 0., 1.);
        vec3 col    = mix(orange, yellow, t);
        col         = mix(col, white, t*t*.5);
        col        *= limb;
        col         = min(col * 1.65, vec3(1.));
        gl_FragColor = vec4(col, 1.);
      }
    `,
  }), [])

  // Three sprite glow layers (camera-facing → zero dark-ring artifacts)
  const m1 = useMemo(() => new THREE.SpriteMaterial({
    map: makeGlowTex('rgba(255,248,200,1)', 'rgba(255,170,30,0)'),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [])
  const m2 = useMemo(() => new THREE.SpriteMaterial({
    map: makeGlowTex('rgba(255,140,20,0.6)', 'rgba(220,70,5,0)'),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [])
  const m3 = useMemo(() => new THREE.SpriteMaterial({
    map: makeGlowTex('rgba(200,50,5,0.3)', 'rgba(100,20,0,0)', 256),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (sunMat.uniforms) sunMat.uniforms.time.value = t
    if (coreRef.current) coreRef.current.rotation.y += 0.0007

    if (s1Ref.current) { const s=19+Math.sin(t*1.1)*.8; s1Ref.current.scale.set(s,s,1) }
    if (s2Ref.current) { const s=36+Math.sin(t*.7+1.2)*1.5; s2Ref.current.scale.set(s,s,1); m2.opacity=.7+Math.sin(t*.9)*.15 }
    if (s3Ref.current) { const s=64+Math.sin(t*.45+2.0)*2.5; s3Ref.current.scale.set(s,s,1); m3.opacity=.5+Math.sin(t*.5)*.12 }
  })

  return (
    <>
      {/* Photosphere core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[5.5, 64, 64]} />
        <primitive object={sunMat} attach="material" />
      </mesh>

      {/* Camera-facing sprite glows — no geometry edges, no dark rings */}
      <sprite ref={s1Ref} scale={[19, 19, 1]}>
        <primitive object={m1} attach="material" />
      </sprite>
      <sprite ref={s2Ref} scale={[36, 36, 1]}>
        <primitive object={m2} attach="material" />
      </sprite>
      <sprite ref={s3Ref} scale={[64, 64, 1]}>
        <primitive object={m3} attach="material" />
      </sprite>

      {/* Sunlight */}
      <pointLight position={[0,0,0]} intensity={10} distance={700} decay={1.0} color="#fff8e0" />
      <pointLight position={[0,0,0]} intensity={4}  distance={400} decay={1.4} color="#ff7700" />
    </>
  )
}