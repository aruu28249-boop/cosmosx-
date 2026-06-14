import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Stars() {
  const points = useRef();
  const starGeo = new THREE.BufferGeometry();
  const starVerts = [];
  for (let i = 0; i < 2000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    starVerts.push(x, y, z);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
  const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');
  const material = new THREE.PointsMaterial({
    size: 1.5,
    sizeAttenuation: true,
    map: sprite,
    transparent: true,
    depthWrite: false,
    opacity: 0.8,
    color: 0xffffff,
  });
  return <points ref={points} geometry={starGeo} material={material} />;
}

function StarfieldBackground() {
  const mouse = useRef([0, 0]);
  const canvasRef = useRef();

  useEffect(() => {
    const handle = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.current = [
        (e.clientX - rect.left) / rect.width - 0.5,
        (e.clientY - rect.top) / rect.height - 0.5,
      ];
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const Camera = () => {
    const cam = useRef();
    useFrame(() => {
      if (cam.current) {
        cam.current.position.x += (mouse.current[0] * 30 - cam.current.position.x) * 0.05;
        cam.current.position.y += (-mouse.current[1] * 30 - cam.current.position.y) * 0.05;
        cam.current.lookAt(0, 0, 0);
      }
    });
    return null;
  };

  return (
    <div className="absolute inset-0 pointer-events-none" ref={canvasRef}>
      <Canvas>
        <Camera />
        <Stars />
      </Canvas>
    </div>
  );
}

export default StarfieldBackground;
