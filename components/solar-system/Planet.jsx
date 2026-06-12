'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Sprite glow texture helper ────────────────────────────────────────────────
function makeSpriteTex(inner, outer, size = 128) {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const r = size / 2
  const g = ctx.createRadialGradient(r, r, 0, r, r, r)
  g.addColorStop(0.0, inner)
  g.addColorStop(0.5, outer)
  g.addColorStop(1.0, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

// ── Per-planet visual definitions ─────────────────────────────────────────────
const PLANET_VISUALS = {
  Earth: {
    shader: true,
    atmosphereColor: new THREE.Color(0.28, 0.55, 1.0),
    atmosphereOpacity: 0.12,
    atmosphereScale: 1.08,
    vert: /* glsl */`
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    frag: /* glsl */`
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;

      // --- noise helpers ---
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
      float n(vec2 p){
        vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),
                   mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
      }
      // higher-detail fbm for continents
      float fbm(vec2 p){
        float v=0.,a=.5;
        for(int i=0;i<7;i++){v+=a*n(p);p*=2.02;a*=.48;}
        return v;
      }
      // smooth fbm for clouds (softer frequencies)
      float cfbm(vec2 p){
        float v=0.,a=.5;
        for(int i=0;i<5;i++){v+=a*n(p);p*=1.9;a*=.52;}
        return v;
      }

      void main() {
        // ── Continents ──────────────────────────────────────────────────────
        // Domain-warp the UV so continent edges are organic, not blobby
        vec2 q = vec2(fbm(vUv * 2.8 + vec2(0.0, 0.0)),
                      fbm(vUv * 2.8 + vec2(1.7, 9.2)));
        float land = fbm(vUv * 2.2 + 0.8 * q + vec2(0.3, 0.7));

        // ── Clouds (drift slowly east, ~25% coverage) ───────────────────
        vec2 cUv = vUv * 2.5 + vec2(time * 0.004, 0.0);
        float cloud = cfbm(cUv + vec2(0.8, 1.2));
        // Raised threshold → much less cloud coverage, more blue ocean visible
        float cloudMask = smoothstep(0.64, 0.74, cloud);

        // ── Polar ice (smaller caps, more ocean visible) ────────────────
        float lat   = abs(vUv.y - 0.5) * 2.0;
        float polar = smoothstep(0.78, 0.94, lat);

        // ── Surface colours ──────────────────────────────────────────────
        vec3 deepOcean   = vec3(0.02, 0.10, 0.45);
        vec3 shallowSea  = vec3(0.05, 0.28, 0.62);
        vec3 coast       = vec3(0.10, 0.44, 0.58);
        vec3 lowland     = vec3(0.20, 0.40, 0.16);   // dark green jungle
        vec3 midland     = vec3(0.30, 0.50, 0.20);   // mid green
        vec3 highland    = vec3(0.46, 0.40, 0.26);   // brown-tan
        vec3 mountain    = vec3(0.58, 0.54, 0.48);   // grey rock
        vec3 snow        = vec3(0.92, 0.95, 0.99);
        vec3 desert      = vec3(0.70, 0.60, 0.36);   // Sahara tan

        // ~65% ocean, ~35% land — realistic Earth water coverage
        vec3 surface;
        if (land < 0.36) {
          // Deep ocean
          surface = mix(deepOcean, shallowSea, smoothstep(0.20, 0.32, land));
          surface = mix(surface, coast, smoothstep(0.32, 0.36, land));
        } else if (land < 0.48) {
          // Green lowland / jungle
          float t    = smoothstep(0.36, 0.48, land);
          float trop = smoothstep(0.30, 0.55, lat);
          vec3 veg   = mix(lowland, midland, trop * 0.5);
          surface    = mix(coast, veg, t);
        } else if (land < 0.60) {
          // Mid green to tan
          float trop = smoothstep(0.22, 0.52, lat);
          surface    = mix(midland, mix(midland, desert, trop * 0.7), smoothstep(0.48, 0.60, land));
        } else if (land < 0.70) {
          surface = mix(highland, mountain, smoothstep(0.60, 0.70, land));
        } else {
          surface = mix(mountain, snow, smoothstep(0.70, 0.85, land));
        }

        // ── Polar caps override ──────────────────────────────────────────
        surface = mix(surface, snow, polar);

        // ── Cloud layer (thin wispy white) ───────────────────────────────
        vec3 cloudCol = mix(vec3(0.88,0.90,0.95), snow, 0.5);
        surface = mix(surface, cloudCol, cloudMask * 0.80);

        // ── Ocean specular glint (bright where normal faces viewer) ──────
        float isOcean   = 1.0 - smoothstep(0.32, 0.40, land);
        float spec      = pow(max(0.0, dot(normalize(vNormal), vec3(0.3, 0.5, 0.8))), 28.0);
        surface        += isOcean * spec * 0.55 * (1.0 - cloudMask);

        // ── Atmospheric limb scattering (very subtle blue haze only at grazing edge) ──
        float rim = 1.0 - max(0.0, dot(vNormal, vec3(0., 0., 1.)));
        surface   = mix(surface, vec3(0.30, 0.58, 1.0), pow(rim, 6.0) * 0.25);

        gl_FragColor = vec4(surface, 1.0);
      }
    `,
  },

  Mars: {
    shader: true,
    atmosphereColor: new THREE.Color(0.78, 0.30, 0.10),
    atmosphereOpacity: 0.14,
    atmosphereScale: 1.07,
    vert: /* glsl */`
      varying vec2 vUv; varying vec3 vNormal;
      void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
    `,
    frag: /* glsl */`
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
      void main(){
        vec2 q=vec2(fbm(vUv*3.+vec2(0.,0.)),fbm(vUv*3.+vec2(1.7,9.2)));
        float terrain=fbm(vUv*2.5+0.7*q+vec2(.2,.5));
        float craters=fbm(vUv*8.+vec2(1.3,.8));
        float lat=abs(vUv.y-.5)*2.; float polar=smoothstep(.80,.95,lat);
        vec3 rust=vec3(.72,.22,.06), dark=vec3(.42,.12,.04);
        vec3 bright=vec3(.88,.48,.22), highland=vec3(.60,.30,.12);
        vec3 iceCol=vec3(.93,.91,.89);
        vec3 surface=mix(dark,rust,smoothstep(.35,.58,terrain));
        surface=mix(surface,bright,smoothstep(.60,.76,terrain));
        surface=mix(surface,highland,smoothstep(.78,.90,terrain));
        surface*=1.-smoothstep(.62,.68,craters)*.30;
        surface=mix(surface,iceCol,polar);
        float rim=1.-max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface=mix(surface,vec3(.82,.34,.12),pow(rim,5.)*.40);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },

  Jupiter: {
    shader: true,
    atmosphereColor: new THREE.Color(0.82, 0.60, 0.35),
    atmosphereOpacity: 0.06,
    atmosphereScale: 1.03,
    vert: /* glsl */`
      varying vec2 vUv; varying vec3 vNormal;
      void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
    `,
    frag: /* glsl */`
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
      void main(){
        float bs=time*.004*(0.5+sin(vUv.y*12.)*.5);
        float turb=fbm(vec2(vUv.x*3.5+bs,vUv.y*1.8+time*.002))*.5;
        float stripe=sin(vUv.y*18.+turb*6.);
        vec2 sC=vec2(.28,.45); float sD=length((vUv-sC)*vec2(3.5,5.5));
        float spot=1.-smoothstep(.10,.22,sD);
        vec3 b1=vec3(.78,.55,.32),b2=vec3(.56,.36,.20);
        vec3 b3=vec3(.92,.80,.68),b4=vec3(.44,.22,.10);
        vec3 sCol=vec3(.72,.18,.08);
        float t=stripe*.5+.5;
        vec3 surface=mix(b4,b2,smoothstep(0.,.3,t));
        surface=mix(surface,b1,smoothstep(.3,.55,t));
        surface=mix(surface,b3,smoothstep(.55,.80,t));
        surface=mix(surface,b1,smoothstep(.80,1.,t));
        surface=mix(surface,sCol,spot*.85);
        float eye=1.-smoothstep(.03,.07,sD);
        surface=mix(surface,vec3(.92,.72,.60),eye*.6);
        float mu=max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface*=.6+.4*pow(mu,.3);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },
}

export default function Planet({ data, timeMultiplier = 1, onPlanetClick, activeEffect, onPositionUpdate, initialAngle, timeMachineAngle }) {
  const meshRef        = useRef()
  const atmoRef        = useRef()

  const moonRef        = useRef()
  const moon2Ref       = useRef()
  const moonGlow1Ref   = useRef()
  const moonGlow2Ref   = useRef()
  const angleRef       = useRef(0)
  const moonAngleRef   = useRef(0)
  const moon2AngleRef  = useRef(Math.PI)
  const opacityRef     = useRef(1)
  const initializedRef = useRef(false)

  const visual = PLANET_VISUALS[data.name]

  const shaderMat = useMemo(() => {
    if (!visual?.shader) return null
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader:   visual.vert,
      fragmentShader: visual.frag,
    })
  }, [data.name]) // eslint-disable-line

  const atmoMat = useMemo(() => {
    if (!visual?.atmosphereColor) return null
    return new THREE.MeshBasicMaterial({
      color: visual.atmosphereColor,
      transparent: true,
      opacity: visual.atmosphereOpacity ?? 0.15,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [data.name]) // eslint-disable-line

  // Separate glow material per moon (sharing one instance causes z-fighting)
  const moonGlowTex = useMemo(() =>
    makeSpriteTex('rgba(210,210,215,0.7)', 'rgba(160,165,180,0)'),
  [])
  const moonGlowMat1 = useMemo(() => new THREE.SpriteMaterial({
    map: moonGlowTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.80,
  }), [moonGlowTex])
  const moonGlowMat2 = useMemo(() => new THREE.SpriteMaterial({
    map: moonGlowTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.75,
  }), [moonGlowTex])

  useFrame(({ clock }, delta) => {
    // Initialize with real orbital angle on first frame
    if (!initializedRef.current) {
      initializedRef.current = true
      angleRef.current = initialAngle ?? (Math.random() * Math.PI * 2)
    }

    // Time machine mode: lerp toward target angle (shortest arc), orbit frozen
    if (timeMachineAngle != null) {
      const current = angleRef.current % (2 * Math.PI)
      let diff = timeMachineAngle - current
      if (diff > Math.PI)  diff -= 2 * Math.PI
      if (diff < -Math.PI) diff += 2 * Math.PI
      angleRef.current += diff * 0.05
    } else {
      // Normal orbit
      angleRef.current += data.orbitSpeed * delta * timeMultiplier * 0.3
    }
    const x = Math.cos(angleRef.current) * data.orbitRadius
    const z = Math.sin(angleRef.current) * data.orbitRadius
    meshRef.current.position.set(x, 0, z)
    meshRef.current.rotation.y += data.rotationSpeed * delta * timeMultiplier

    if (atmoRef.current) atmoRef.current.position.set(x, 0, z)

    if (shaderMat?.uniforms) shaderMat.uniforms.time.value = clock.elapsedTime
    if (onPositionUpdate) onPositionUpdate({ x, y: 0, z })

    // Jupiter disappear effect
    if (data.name === 'Jupiter' && activeEffect === 'jupiter-disappear') {
      if (shaderMat) shaderMat.transparent = true
      if (opacityRef.current > 0) opacityRef.current = Math.max(0, opacityRef.current - 0.005)
      if (shaderMat) shaderMat.opacity = opacityRef.current
      meshRef.current.visible = opacityRef.current > 0
      if (atmoRef.current) atmoRef.current.visible = opacityRef.current > 0
    } else if (data.name === 'Jupiter') {
      opacityRef.current = 1
      if (shaderMat) { shaderMat.transparent = false; shaderMat.opacity = 1 }
      meshRef.current.visible = true
      if (atmoRef.current) atmoRef.current.visible = true
    }

    // Two moons orbiting Earth
    if (data.name === 'Earth' && activeEffect === 'two-moons') {
      if (moonRef.current) {
        moonAngleRef.current += delta * 1.8
        const mx = x + Math.cos(moonAngleRef.current) * 4.5
        const mz = z + Math.sin(moonAngleRef.current) * 4.5
        moonRef.current.position.set(mx, 0, mz)
        if (moonGlow1Ref.current) moonGlow1Ref.current.position.set(mx, 0, mz)
      }
      if (moon2Ref.current) {
        moon2AngleRef.current += delta * 1.2
        const mx2 = x + Math.cos(moon2AngleRef.current) * 6.2
        const mz2 = z + Math.sin(moon2AngleRef.current) * 6.2
        moon2Ref.current.position.set(mx2, 0.5, mz2)
        if (moonGlow2Ref.current) moonGlow2Ref.current.position.set(mx2, 0.5, mz2)
      }
    }
  })

  const isEarth      = data.name === 'Earth'
  const showTwoMoons = isEarth && activeEffect === 'two-moons'
  const atmoScale    = visual?.atmosphereScale ?? 1.1

  return (
    <>
      {/* Planet sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onPlanetClick(data) }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={()  => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[data.size, 64, 64]} />
        {shaderMat
          ? <primitive object={shaderMat} attach="material" />
          : <meshStandardMaterial color={data.color} roughness={0.75} metalness={0.05} />
        }
      </mesh>

      {/* Atmosphere shell */}
      {atmoMat && (
        <mesh ref={atmoRef}>
          <sphereGeometry args={[data.size * atmoScale, 32, 32]} />
          <primitive object={atmoMat} attach="material" />
        </mesh>
      )}



      {/* Two moons with individual glow sprites */}
      {showTwoMoons && (
        <>
          {/* Moon 1 — larger, brighter grey */}
          <mesh ref={moonRef}>
            <sphereGeometry args={[0.75, 32, 32]} />
            <meshStandardMaterial
              color="#d8d8d8"
              roughness={0.88}
              metalness={0.0}
              emissive="#707070"
              emissiveIntensity={1.0}
            />
          </mesh>
          <sprite ref={moonGlow1Ref} scale={[5.0, 5.0, 1]}>
            <primitive object={moonGlowMat1} attach="material" />
          </sprite>

          {/* Moon 2 — smaller, slightly cooler grey */}
          <mesh ref={moon2Ref}>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshStandardMaterial
              color="#cccccc"
              roughness={0.90}
              metalness={0.0}
              emissive="#646464"
              emissiveIntensity={1.0}
            />
          </mesh>
          <sprite ref={moonGlow2Ref} scale={[4.0, 4.0, 1]}>
            <primitive object={moonGlowMat2} attach="material" />
          </sprite>
        </>
      )}
    </>
  )
}