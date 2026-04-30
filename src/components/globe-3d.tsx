"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Wireframe } from "@react-three/drei";
import * as THREE from "three";

function SpinningGlobe() {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.18;
    ref.current.rotation.x += delta * 0.05;
  });

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.4, 4), []);

  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        <Wireframe
          stroke="#0066ff"
          thickness={0.02}
          dash
          dashLength={0.32}
          dashInvert
          fillOpacity={0}
        />
      </mesh>
      {/* faint inner sphere for depth */}
      <mesh geometry={geometry} scale={0.6}>
        <meshBasicMaterial
          color="#0066ff"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

export function Globe3D({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 35 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          <SpinningGlobe />
        </Suspense>
      </Canvas>
    </div>
  );
}
