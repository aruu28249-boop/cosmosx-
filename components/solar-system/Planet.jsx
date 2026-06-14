'use client'
import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail, Html } from '@react-three/drei'
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

        // ── Clouds (drift slowly east with more dynamic movement) ───────────────────
        vec2 cUv = vUv * 2.5 + vec2(time * 0.006, 0.0);
        vec2 cUv2 = vUv * 3.0 + vec2(time * 0.004, time * 0.002);
        float cloud = cfbm(cUv + vec2(0.8, 1.2));
        float cloud2 = cfbm(cUv2 + vec2(1.5, 0.5));
        // More dynamic cloud coverage with varying opacity
        float cloudMask = smoothstep(0.62, 0.76, cloud) * smoothstep(0.58, 0.72, cloud2);

        // ── Polar ice (dynamic with seasonal hint) ────────────────
        float lat   = abs(vUv.y - 0.5) * 2.0;
        float polar = smoothstep(0.76, 0.94, lat);

        // ── Surface colours ──────────────────────────────────────────────
        vec3 deepOcean   = vec3(0.02, 0.10, 0.45);
        vec3 shallowSea  = vec3(0.05, 0.28, 0.62);
        vec3 coast       = vec3(0.10, 0.44, 0.58);
        vec3 lowland     = vec3(0.20, 0.40, 0.16);
        vec3 midland     = vec3(0.30, 0.50, 0.20);
        vec3 highland    = vec3(0.46, 0.40, 0.26);
        vec3 mountain    = vec3(0.58, 0.54, 0.48);
        vec3 snow        = vec3(0.92, 0.95, 0.99);
        vec3 desert      = vec3(0.70, 0.60, 0.36);

        vec3 surface;
        if (land < 0.36) {
          surface = mix(deepOcean, shallowSea, smoothstep(0.20, 0.32, land));
          surface = mix(surface, coast, smoothstep(0.32, 0.36, land));
        } else if (land < 0.48) {
          float t    = smoothstep(0.36, 0.48, land);
          float trop = smoothstep(0.30, 0.55, lat);
          vec3 veg   = mix(lowland, midland, trop * 0.5);
          surface    = mix(coast, veg, t);
        } else if (land < 0.60) {
          float trop = smoothstep(0.22, 0.52, lat);
          surface    = mix(midland, mix(midland, desert, trop * 0.7), smoothstep(0.48, 0.60, land));
        } else if (land < 0.70) {
          surface = mix(highland, mountain, smoothstep(0.60, 0.70, land));
        } else {
          surface = mix(mountain, snow, smoothstep(0.70, 0.85, land));
        }

        surface = mix(surface, snow, polar);

        // ── More dynamic cloud layer with shadows ───────────────────────────────
        vec3 cloudCol = mix(vec3(0.88,0.90,0.95), snow, 0.5);
        vec3 cloudShadow = vec3(0.0, 0.02, 0.08);
        surface = mix(surface, cloudCol, cloudMask * 0.85);
        surface = mix(surface, surface * 0.7 + cloudShadow, cloudMask * 0.15);

        // ── Enhanced ocean specular with animated glint ──────
        float isOcean   = 1.0 - smoothstep(0.32, 0.40, land);
        float spec      = pow(max(0.0, dot(normalize(vNormal), vec3(0.3, 0.5, 0.8))), 28.0);
        float glint     = sin(time * 2.0 + vUv.x * 10.0) * 0.5 + 0.5;
        surface        += isOcean * spec * 0.60 * (1.0 - cloudMask) * (0.8 + glint * 0.2);

        // ── Atmospheric limb scattering ──
        float rim = 1.0 - max(0.0, dot(vNormal, vec3(0., 0., 1.)));
        surface   = mix(surface, vec3(0.30, 0.58, 1.0), pow(rim, 6.0) * 0.28);

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
        
        // Dust storm animation
        vec2 dUv=vUv*3.+vec2(time*.003,time*.001);
        float dust=fbm(dUv+vec2(.5,.3));
        float dustStorm=smoothstep(.55,.70,dust);
        
        vec3 rust=vec3(.72,.22,.06), dark=vec3(.42,.12,.04);
        vec3 bright=vec3(.88,.48,.22), highland=vec3(.60,.30,.12);
        vec3 iceCol=vec3(.93,.91,.89);
        vec3 dustColor=vec3(.78,.38,.18);
        
        vec3 surface=mix(dark,rust,smoothstep(.35,.58,terrain));
        surface=mix(surface,bright,smoothstep(.60,.76,terrain));
        surface=mix(surface,highland,smoothstep(.78,.90,terrain));
        surface*=1.-smoothstep(.62,.68,craters)*.30;
        
        // Apply dust storm with varying intensity
        surface=mix(surface,dustColor,dustStorm*.25);
        
        surface=mix(surface,iceCol,polar);
        float rim=1.-max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface=mix(surface,vec3(.82,.34,.12),pow(rim,5.)*.42);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },

  Jupiter: {
    shader: true,
    atmosphereColor: new THREE.Color(0.88, 0.65, 0.40),
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
        // More turbulent band movement
        float bs=time*.005*(0.5+sin(vUv.y*12.)*.5);
        float turb=fbm(vec2(vUv.x*4.+bs,vUv.y*2.+time*.003))*.6;
        float turb2=fbm(vec2(vUv.x*3.+time*.002,vUv.y*1.5))*.4;
        float stripe=sin(vUv.y*20.+(turb+turb2)*7.);
        
        // Great Red Spot with subtle animation
        vec2 sC=vec2(.28,.45);
        sC.x+=sin(time*.001)*.02;
        float sD=length((vUv-sC)*vec2(3.5,5.5));
        float spot=1.-smoothstep(.10,.22,sD);
        
        // Secondary storm
        vec2 sC2=vec2(.65,.35);
        sC2.x+=cos(time*.0008)*.015;
        float sD2=length((vUv-sC2)*vec2(4.,3.));
        float spot2=1.-smoothstep(.06,.12,sD2);
        
        // Jupiter - more distinct orange/brown bands
        vec3 b1=vec3(.92,.72,.45),b2=vec3(.72,.48,.22);
        vec3 b3=vec3(.82,.62,.35),b4=vec3(.52,.32,.12);
        vec3 b5=vec3(.62,.42,.18), sCol=vec3(.78,.22,.08), sCol2=vec3(.68,.32,.15);
        float t=stripe*.5+.5;
        vec3 surface=mix(b4,b5,smoothstep(0.,.2,t));
        surface=mix(surface,b2,smoothstep(.2,.4,t));
        surface=mix(surface,b3,smoothstep(.4,.6,t));
        surface=mix(surface,b1,smoothstep(.6,.8,t));
        surface=mix(surface,b3,smoothstep(.8,1.,t));
        surface=mix(surface,sCol,spot*.85);
        surface=mix(surface,sCol2,spot2*.5);
        float eye=1.-smoothstep(.03,.07,sD);
        surface=mix(surface,vec3(.95,.78,.55),eye*.6);
        float mu=max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface*=.6+.4*pow(mu,.3);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },

  Mercury: {
    shader: true,
    atmosphereColor: new THREE.Color(0.6, 0.55, 0.5),
    atmosphereOpacity: 0.04,
    atmosphereScale: 1.02,
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
        vec2 q=vec2(fbm(vUv*4.+vec2(0.,0.)),fbm(vUv*4.+vec2(1.7,9.2)));
        float terrain=fbm(vUv*3.5+0.6*q+vec2(.1,.3));
        float craters=fbm(vUv*12.+vec2(2.1,1.4));
        float rayed=fbm(vUv*20.+vec2(4.2,3.8));
        
        // Mercury - more realistic with brownish/reddish hues from iron oxides
        vec3 dark=vec3(.38,.32,.28), mid=vec3(.52,.46,.42);
        vec3 light=vec3(.68,.62,.58), bright=vec3(.78,.72,.68);
        vec3 reddish=vec3(.62,.48,.42);
        
        vec3 surface=mix(dark,mid,smoothstep(.40,.55,terrain));
        surface=mix(surface,light,smoothstep(.55,.70,terrain));
        surface=mix(surface,bright,smoothstep(.75,.88,terrain));
        surface=mix(surface,reddish,smoothstep(.45,.65,terrain)*.3);
        
        surface*=1.-smoothstep(.55,.65,craters)*.35;
        surface*=1.-smoothstep(.70,.82,rayed)*.15;
        
        float lat=abs(vUv.y-.5)*2.;
        float polar=smoothstep(.85,.95,lat);
        vec3 ice=vec3(.92,.91,.89);
        surface=mix(surface,ice,polar*.3);
        
        float mu=max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface*=.5+.5*pow(mu,.4);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },

  Venus: {
    shader: true,
    atmosphereColor: new THREE.Color(0.9, 0.7, 0.4),
    atmosphereOpacity: 0.15,
    atmosphereScale: 1.1,
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
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
      void main(){
        float swirl=time*.0015;
        vec2 cUv=vUv*2.8+vec2(swirl,swirl*.5);
        float clouds=fbm(cUv+vec2(.3,.6));
        float clouds2=fbm(cUv*1.3+vec2(.9,.4));
        float cloudMask=smoothstep(.42,.58,clouds)*smoothstep(.48,.65,clouds2);
        
        // Venus - distinctly orange/yellow, very different from Saturn
        vec3 bright=vec3(.95,.75,.35), mid=vec3(.85,.62,.28);
        vec3 dark=vec3(.72,.52,.18), orange=vec3(.88,.68,.25);
        
        float stripe=sin(vUv.y*30.+clouds*4.)*.5+.5;
        vec3 surface=mix(dark,orange,smoothstep(0.,.3,stripe));
        surface=mix(surface,mid,smoothstep(.3,.6,stripe));
        surface=mix(surface,bright,smoothstep(.6,1.,stripe));
        
        // Cloud layer
        surface=mix(surface,vec3(.92,.82,.55),cloudMask*.35);
        
        float rim=1.-max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface=mix(surface,vec3(.95,.82,.60),pow(rim,3.)*.25);
        float mu=max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface*=.55+.45*pow(mu,.4);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },

  Saturn: {
    shader: true,
    atmosphereColor: new THREE.Color(0.98, 0.92, 0.65),
    atmosphereOpacity: 0.08,
    atmosphereScale: 1.05,
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
        float turb=fbm(vec2(vUv.x*4.+time*.003,vUv.y*2.+time*.0015))*.4;
        float stripe=sin(vUv.y*22.+turb*5.)*.5+.5;
        
        // Saturn - more golden/pale, distinct from Jupiter
        vec3 b1=vec3(.98,.88,.62), b2=vec3(.88,.78,.52);
        vec3 b3=vec3(.78,.68,.42), b4=vec3(.68,.58,.32);
        vec3 b5=vec3(.58,.48,.22);
        vec3 surface=mix(b5,b4,smoothstep(0.,.2,stripe));
        surface=mix(surface,b3,smoothstep(.2,.4,stripe));
        surface=mix(surface,b2,smoothstep(.4,.6,stripe));
        surface=mix(surface,b1,smoothstep(.6,.8,stripe));
        surface=mix(surface,b2,smoothstep(.8,1.,stripe));
        float mu=max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface*=.6+.4*pow(mu,.3);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },

  Uranus: {
    shader: true,
    atmosphereColor: new THREE.Color(0.7, 0.9, 1.0),
    atmosphereOpacity: 0.15,
    atmosphereScale: 1.08,
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
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
      void main(){
        float haze=fbm(vUv*3.+vec2(time*.001,0.))*.3;
        // Tone down colors so they don't exceed the 0.55 bloom threshold
        vec3 pale=vec3(.55,.65,.70), mid=vec3(.45,.58,.68);
        vec3 deep=vec3(.35,.50,.62);
        float lat=abs(vUv.y-.5)*2.;
        vec3 surface=mix(deep,mid,smoothstep(0.,.4,lat));
        surface=mix(surface,pale,smoothstep(.4,.7,lat));
        surface=mix(surface,mid,smoothstep(.7,1.,lat));
        surface+=haze*vec3(.08,.1,.12);
        float rim=1.-max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface=mix(surface,vec3(.7,.8,.9),pow(rim,5.)*.3);
        float mu=max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface*=.5+.4*pow(mu,.35);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },

  Neptune: {
    shader: true,
    atmosphereColor: new THREE.Color(0.4, 0.6, 1.0),
    atmosphereOpacity: 0.12,
    atmosphereScale: 1.06,
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
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
      void main(){
        float storm=time*.003;
        vec2 sUv=vUv*2.5+vec2(storm,storm*.6);
        float clouds=fbm(sUv+vec2(.3,.7));
        float stormMask=smoothstep(.52,.68,clouds);
        vec2 spot=vec2(.35,.45);
        float sD=length((vUv-spot)*vec2(4.,6.));
        float darkSpot=1.-smoothstep(.08,.15,sD);
        vec3 deep=vec3(.28,.48,.95), mid=vec3(.42,.65,.98);
        vec3 bright=vec3(.58,.78,1.0), stormCol=vec3(.32,.55,.92);
        float lat=abs(vUv.y-.5)*2.;
        vec3 surface=mix(deep,mid,smoothstep(0.,.5,lat));
        surface=mix(surface,bright,smoothstep(.5,1.,lat));
        surface=mix(surface,stormCol,stormMask*.35);
        surface*=1.-darkSpot*.25;
        float rim=1.-max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface=mix(surface,vec3(.65,.85,1.0),pow(rim,4.)*.35);
        float mu=max(0.,dot(vNormal,vec3(0.,0.,1.)));
        surface*=.6+.4*pow(mu,.35);
        gl_FragColor=vec4(surface,1.);
      }
    `,
  },
}

export default function Planet({ data, timeMultiplier = 1, onPlanetClick, activeEffect, onPositionUpdate, initialAngle, timeMachineAngle, timeMachineFrozen, isReturning }) {
  const meshRef        = useRef()
  const atmoRef        = useRef()
  const labelRef       = useRef()
  const initializedRef = useRef(false)
  const [hovered, setHovered] = useState(false)

  const moonRef        = useRef()
  const moon2Ref       = useRef()
  const moonGlow1Ref   = useRef()
  const moonGlow2Ref   = useRef()
  const ringRef        = useRef()
  const angleRef       = useRef(0)
  const moonAngleRef   = useRef(0)
  const moon2AngleRef  = useRef(Math.PI)
  const realAngleRef   = useRef(0)
  const opacityRef     = useRef(1)
  const visual = PLANET_VISUALS[data.name]

  // Saturn ring material
  const ringMat = useMemo(() => {
    if (data.name !== 'Saturn') return null
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      vertexShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPos;
        
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
        float n(vec2 p){
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x),
                     mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        float fbm(vec2 p){
          float v = 0.0, a = 0.5;
          for(int i = 0; i < 4; i++) { v += a * n(p); p *= 2.0; a *= 0.5; }
          return v;
        }
        
        void main() {
          float dist = length(vUv - 0.5) * 2.0;
          
          // Ring gaps (Cassini division, etc.)
          float gap1 = smoothstep(0.45, 0.48, dist) * smoothstep(0.52, 0.48, dist);
          float gap2 = smoothstep(0.72, 0.75, dist) * smoothstep(0.78, 0.75, dist);
          float gap3 = smoothstep(0.88, 0.90, dist) * smoothstep(0.92, 0.90, dist);
          float gaps = gap1 * 0.6 + gap2 * 0.4 + gap3 * 0.3;
          
          // Ring texture
          float ringNoise = fbm(vec2(dist * 20.0, time * 0.001));
          float ringPattern = smoothstep(0.3, 0.7, ringNoise);
          
          // Color variation across rings
          vec3 innerColor = vec3(0.85, 0.72, 0.45);
          vec3 midColor = vec3(0.75, 0.62, 0.38);
          vec3 outerColor = vec3(0.65, 0.52, 0.30);
          
          vec3 color = mix(innerColor, midColor, smoothstep(0.4, 0.6, dist));
          color = mix(color, outerColor, smoothstep(0.6, 0.8, dist));
          color += ringPattern * vec3(0.05, 0.04, 0.02);
          
          // Fade at edges
          float alpha = smoothstep(0.35, 0.42, dist) * smoothstep(0.95, 0.88, dist);
          alpha *= (1.0 - gaps);
          
          gl_FragColor = vec4(color, alpha * 0.85);
        }
      `,
    })
  }, [data.name])

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

  const backgroundAngleRef = useRef(0)
  const lastTmAngleRef = useRef(null)
  const lerpSpeedRef = useRef(0.08)

  useEffect(() => {
    if (timeMachineAngle != null) {
      // User scrubbed the time machine: snap the simulation base to this historical date
      realAngleRef.current = timeMachineAngle
      lastTmAngleRef.current = timeMachineAngle
      lerpSpeedRef.current = 0.08
    } else if (lastTmAngleRef.current != null) {
      // User clicked 'Back to Today': snap the simulation base back to the live background date
      realAngleRef.current = backgroundAngleRef.current
      lastTmAngleRef.current = null
      lerpSpeedRef.current = 0.08
    }
  }, [timeMachineAngle])

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.033)
    const t  = clock.elapsedTime

    if (!initializedRef.current && data.orbitRadius > 0) {
      angleRef.current = initialAngle ?? (Math.random() * Math.PI * 2)
      realAngleRef.current = angleRef.current
      backgroundAngleRef.current = angleRef.current
      initializedRef.current = true
    }

    if (initializedRef.current) {
      const advance = data.orbitSpeed * dt * timeMultiplier * 0.3
      // The background 'live' time always ticks forward
      backgroundAngleRef.current += advance
      // The actual simulation time also ticks forward, even if we are in the past/future
      realAngleRef.current += advance
      
      // Visually spin towards the active simulation time (creates the rapid scrub effect)
      angleRef.current = THREE.MathUtils.lerp(angleRef.current, realAngleRef.current, lerpSpeedRef.current)
    }

    // ── Scenario speed modifier ───────────────────────────────────────────
    let scenarioMult = 1
    if (activeEffect === 'sun-brighter') {
      scenarioMult = 1.5
    }
    if (activeEffect === 'jupiter-disappear' && data.name !== 'Jupiter') {
      scenarioMult = 1 + Math.sin(t * 0.6 + data.orbitRadius) * 0.25
    }
    if (activeEffect === 'rogue-planet') {
      scenarioMult = 1 + Math.sin(t * 0.7 + data.orbitRadius * 0.4) * 0.4
    }
    if (activeEffect === 'sun-dies') {
      scenarioMult = 0.25
    }
    if (activeEffect === 'solar-flare' && data.orbitRadius < 30) {
      scenarioMult = 1.15
    }

    angleRef.current += data.orbitSpeed * dt * timeMultiplier * scenarioMult * 0.3

    let orbitR = data.orbitRadius
    let y = 0

    // ── Per-scenario orbital perturbations ────────────────────────────────
    if (activeEffect === 'jupiter-disappear' && data.name !== 'Jupiter') {
      // Orbits destabilise — slight elliptical stretch + inclination wobble
      orbitR *= 1 + Math.sin(t * 0.25 + data.orbitRadius) * 0.04
      y = Math.sin(t * 0.45 + data.orbitRadius * 0.8) * 1.2
    }
    if (activeEffect === 'asteroid-hit-mars' && data.name === 'Mars') {
      // Impact knocks Mars into a slightly tilted orbit
      y = Math.sin(t * 1.6) * 1.8
    }
    if (activeEffect === 'two-moons' && data.name === 'Earth') {
      // Extra tidal forces from second moon cause slight orbital wobble
      y = Math.sin(t * 0.9) * 0.4
    }
    if (activeEffect === 'sun-brighter') {
      // Increased radiation pressure subtly perturbs smaller planets
      y = Math.sin(t * 0.5 + data.orbitRadius * 0.3) * (data.size < 2 ? 0.5 : 0.15)
    }
    if (activeEffect === 'rogue-planet') {
      // Massive interloper gravity distorts all orbits
      orbitR *= 1 + Math.sin(t * 1.1 + data.orbitRadius * 0.5) * 0.12
      y = Math.sin(t * 0.8 + data.orbitRadius * 0.9) * 3.5
    }
    if (activeEffect === 'sun-dies') {
      // Orbits expand slowly as Sun loses mass
      orbitR *= 1 + Math.min(t * 0.008, 0.18)
      y = Math.sin(t * 0.2 + data.orbitRadius * 0.3) * 0.3
    }
    if (activeEffect === 'solar-flare' && data.orbitRadius < 35) {
      // Inner planets buffeted by intense radiation and CME
      y = Math.sin(t * 2.5 + data.orbitRadius) * 1.2
    }

    const x = Math.cos(angleRef.current) * orbitR
    const z = Math.sin(angleRef.current) * orbitR
    meshRef.current.position.set(x, y, z)
    const isEarthStopped = activeEffect === 'earth-stops' && data.name === 'Earth'
    meshRef.current.rotation.y += (isEarthStopped ? 0 : data.rotationSpeed) * dt * timeMultiplier * scenarioMult

    if (atmoRef.current) atmoRef.current.position.set(x, y, z)
    if (ringRef.current) ringRef.current.position.set(x, y, z)
    if (labelRef.current) labelRef.current.position.set(x, y + data.size + 1.2 + (hovered ? 0.3 : 0), z)

    // Smooth hover scaling
    const targetScale = hovered ? 1.08 : 1.0
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)
    if (atmoRef.current) atmoRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)
    if (ringRef.current) ringRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)

    if (meshRef.current?.material?.uniforms?.time) {
      meshRef.current.material.uniforms.time.value = t
    }
    if (ringRef.current?.material?.uniforms?.time) {
      ringRef.current.material.uniforms.time.value = t
    }
    if (onPositionUpdate) onPositionUpdate({ x, y: 0, z })

    // Jupiter disappear effect
    if (data.name === 'Jupiter' && activeEffect === 'jupiter-disappear') {
      if (meshRef.current?.material) meshRef.current.material.transparent = true
      if (opacityRef.current > 0) opacityRef.current = Math.max(0, opacityRef.current - 0.005)
      if (meshRef.current?.material) meshRef.current.material.opacity = opacityRef.current
      meshRef.current.visible = opacityRef.current > 0
      if (atmoRef.current) atmoRef.current.visible = opacityRef.current > 0
    } else if (data.name === 'Jupiter') {
      opacityRef.current = 1
      if (meshRef.current?.material) { 
        meshRef.current.material.transparent = false
        meshRef.current.material.opacity = 1 
      }
      meshRef.current.visible = true
      if (atmoRef.current) atmoRef.current.visible = true
    }

    // Two moons orbiting Earth
    if (data.name === 'Earth' && activeEffect === 'two-moons') {
      if (moonRef.current) {
        moonAngleRef.current += dt * 1.8
        const mx = x + Math.cos(moonAngleRef.current) * 4.5
        const mz = z + Math.sin(moonAngleRef.current) * 4.5
        moonRef.current.position.set(mx, 0, mz)
        if (moonGlow1Ref.current) moonGlow1Ref.current.position.set(mx, 0, mz)
      }
      if (moon2Ref.current) {
        moon2AngleRef.current += dt * 1.2
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
      {/* Planet sphere with Trail */}
      <Trail
        width={(timeMachineFrozen || isReturning) ? data.size * 1.4 : data.size * 0.5}
        length={(timeMachineFrozen || isReturning) ? 320 : 250}
        color={visual?.atmosphereColor ?? data.color}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onPlanetClick(data) }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto' }}
        >
          <sphereGeometry args={[data.size, 64, 64]} />
          {shaderMat
            ? <primitive object={shaderMat} attach="material" />
            : <meshStandardMaterial color={data.color} roughness={0.75} metalness={0.05} />
          }
        </mesh>
      </Trail>

      {/* Atmosphere shell */}
      {atmoMat && (
        <mesh ref={atmoRef}>
          <sphereGeometry args={[data.size * atmoScale, 32, 32]} />
          <primitive object={atmoMat} attach="material" />
        </mesh>
      )}

      {/* 3D Label */}
      <group ref={labelRef}>
        <Html distanceFactor={60} center zIndexRange={[100, 0]}>
          <div style={{
            color: visual?.atmosphereColor ? `#${visual.atmosphereColor.getHexString()}` : data.color,
            fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.2em',
            pointerEvents: 'none', textShadow: '0 0 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)',
            textTransform: 'uppercase', opacity: 0.85, fontFamily: 'sans-serif'
          }}>
            {data.name}
          </div>
        </Html>
      </group>

      {/* Saturn's rings */}
      {data.name === 'Saturn' && ringMat && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.size * 1.4, data.size * 2.3, 64]} />
          <primitive object={ringMat} attach="material" />
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