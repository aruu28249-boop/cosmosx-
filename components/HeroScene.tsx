"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function Sun() {
  const sunRef = useRef<THREE.Group>(null);
  
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.1, 'rgba(255, 200, 50, 0.9)');
      gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.5)');
      gradient.addColorStop(0.6, 'rgba(150, 50, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(canvas);
    }
    return null;
  }, []);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={sunRef}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[4.0, 64, 64]} />
        <meshStandardMaterial emissive="#ffaa00" emissiveIntensity={3} color="#ffeecc" />
      </mesh>
      {/* Corona / Glow */}
      {texture && (
        <sprite scale={[30, 30, 1]}>
          <spriteMaterial map={texture} blending={THREE.AdditiveBlending} transparent opacity={1} depthWrite={false} />
        </sprite>
      )}
      <pointLight color="#ffeedd" intensity={150} distance={400} decay={1.5} />
    </group>
  );
}

function Planet({ distance, size, color, speed, offset = 0, hasRings = false }: { distance: number, size: number, color: string, speed: number, offset?: number, hasRings?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * speed;
    if (planetRef.current) planetRef.current.rotation.y += delta * speed * 2;
  });

  return (
    <group ref={groupRef} rotation={[0, offset, 0]}>
      <group position={[distance, 0, 0]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
        </mesh>
        {hasRings && (
          <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
            <meshStandardMaterial color="#aa9988" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function Nebula() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.z += delta * 0.02;
    }
  });

  const texture1 = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(90, 50, 255, 0.4)');
      gradient.addColorStop(0.5, 'rgba(40, 0, 150, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(canvas);
    }
    return null;
  }, []);

  const texture2 = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255, 60, 160, 0.25)');
      gradient.addColorStop(0.5, 'rgba(150, 0, 50, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(canvas);
    }
    return null;
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, -20]}>
      {texture1 && (
        <sprite scale={[80, 50, 1]} position={[-15, 8, 0]}>
          <spriteMaterial map={texture1} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.8} />
        </sprite>
      )}
      {texture2 && (
        <sprite scale={[60, 70, 1]} position={[15, -8, 5]}>
          <spriteMaterial map={texture2} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.6} />
        </sprite>
      )}
    </group>
  );
}

function LocalStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
    </group>
  );
}

export default function HeroScene({ showPlanets = true }: { showPlanets?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
      <Canvas camera={{ position: showPlanets ? [0, 35, 65] : [0, 15, 35], fov: 45 }}>
        <fog attach="fog" args={["#000000", 30, 150]} />
        <ambientLight intensity={showPlanets ? 0.6 : 0.8} />
        {!showPlanets && <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />}
        
        {!showPlanets && <Nebula />}
        {showPlanets && <LocalStars />}
        
        {showPlanets && (
          <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <group rotation={[0.2, 0, 0.05]}>
              <Sun />
              <Planet distance={7} size={0.25} color="#a09b96" speed={1.2} offset={0} /> {/* Mercury */}
              <Planet distance={10} size={0.55} color="#e3bb76" speed={0.9} offset={Math.PI / 3} /> {/* Venus */}
              <Planet distance={14} size={0.6} color="#2b5dff" speed={0.7} offset={Math.PI} /> {/* Earth */}
              <Planet distance={18} size={0.35} color="#dd4b2b" speed={0.5} offset={Math.PI * 1.5} /> {/* Mars */}
              <Planet distance={26} size={2.2} color="#c88b3a" speed={0.2} offset={Math.PI * 0.8} /> {/* Jupiter */}
              <Planet distance={35} size={1.8} color="#e5d0a1" speed={0.15} offset={Math.PI * 0.2} hasRings /> {/* Saturn */}
              <Planet distance={43} size={1.1} color="#a1e5e0" speed={0.1} offset={Math.PI * 1.2} /> {/* Uranus */}
              <Planet distance={50} size={1.0} color="#4b70dd" speed={0.08} offset={Math.PI * 0.6} /> {/* Neptune */}
            </group>
          </Float>
        )}
      </Canvas>
    </div>
  );
}
