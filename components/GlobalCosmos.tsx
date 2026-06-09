"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function MovingStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
    if (ref.current) ref.current.rotation.x += delta * 0.005;
  });
  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0.5} fade speed={1} />
    </group>
  );
}

export default function GlobalCosmos() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <MovingStars />
      </Canvas>
    </div>
  );
}
