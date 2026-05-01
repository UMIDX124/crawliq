"use client";

/**
 * Three-Scene Hero — original CrawlIQ 3D scene.
 *
 * R3F + drei scene with:
 *  - Floating reticle ring (the brand mark, extruded into 3D)
 *  - Five pillar pyramids — one per audit pillar, scattered with depth
 *  - Severity dot scatter (pass-green / warn-amber / crit-red)
 *  - Central AUDITED medallion (extruded ring with text)
 *  - Wireframe grid floor for spatial context
 *  - Soft ambient + magenta key light
 *  - OrbitControls — drag to rotate
 *  - Auto-orbit when idle
 *  - Pauses when off-screen
 *
 * All CrawlIQ-original assets. No external 3D models.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Float } from "@react-three/drei";
import { Group, Mesh } from "three";
import * as THREE from "three";

const ACCENT = "#FF1A6E";
const PASS = "#00DC82";
const WARN = "#FFC107";
const CRIT = "#FF4757";
const INK = "#FFFFFF";

// Five pillar positions on a circle, slightly varied y/scale for depth
const PILLAR_POSITIONS = Array.from({ length: 5 }).map((_, i) => {
  const a = (Math.PI * 2 * i) / 5 + 0.3;
  return {
    x: Math.cos(a) * 3.4,
    y: -0.2 + (i % 2) * 0.8,
    z: Math.sin(a) * 3.4,
    scale: 0.9 + (i % 3) * 0.18,
    rot: i * 0.6,
  };
});

// Random severity dot scatter — deterministic via seeded angles
const SEVERITY_DOTS = Array.from({ length: 18 }).map((_, i) => {
  const a = (Math.PI * 2 * i) / 18 + i * 0.13;
  const r = 1.6 + (i % 4) * 0.7;
  const sev = i % 9 === 0 ? "crit" : i % 4 === 0 ? "warn" : "pass";
  return {
    x: Math.cos(a) * r,
    y: -1.5 + (i % 5) * 0.8,
    z: Math.sin(a) * r,
    color: sev === "crit" ? CRIT : sev === "warn" ? WARN : PASS,
    size: 0.07 + (i % 3) * 0.018,
  };
});

function ReticleRing() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = t * 0.18;
  });
  return (
    <group ref={ref} position={[0, 0.4, 0]}>
      {/* outer dashed ring — many small torus segments */}
      {Array.from({ length: 28 }).map((_, i) => {
        if (i % 2) return null;
        const a1 = (Math.PI * 2 * i) / 28;
        const a2 = (Math.PI * 2 * (i + 1)) / 28;
        const ax = (a1 + a2) / 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(ax) * 1.6, 0, Math.sin(ax) * 1.6]}
            rotation={[Math.PI / 2, 0, ax + Math.PI / 2]}
          >
            <boxGeometry args={[0.18, 0.04, 0.04]} />
            <meshStandardMaterial color={INK} emissive={INK} emissiveIntensity={0.3} roughness={0.3} />
          </mesh>
        );
      })}
      {/* inner solid 3/4 torus arc */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[1.1, 0.03, 16, 64, Math.PI * 1.5]} />
        <meshStandardMaterial color={INK} emissive={INK} emissiveIntensity={0.25} roughness={0.4} />
      </mesh>
      {/* core sphere */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      {/* "finding" dot offset to NE */}
      <mesh position={[1.0, 0, -0.7]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.2} />
      </mesh>
      {/* connecting line center → finding */}
      <mesh position={[0.5, 0, -0.35]} rotation={[0, Math.atan2(0.7, -1.0) + Math.PI / 2, 0]}>
        <boxGeometry args={[1.22, 0.012, 0.012]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function PillarPyramid({
  position,
  scale,
  rot,
  index,
}: {
  position: [number, number, number];
  scale: number;
  rot: number;
  index: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = rot + t * 0.15;
    // gentle bob
    ref.current.position.y = position[1] + Math.sin(t * 0.6 + index * 1.3) * 0.18;
  });
  // alternating colors: 3 in ink, 2 with magenta tint for visual rhythm
  const color = index % 3 === 0 ? ACCENT : INK;
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={ref} position={position} rotation={[0, rot, 0]} scale={scale}>
        <coneGeometry args={[0.6, 1.2, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={index % 3 === 0 ? 0.5 : 0.15}
          roughness={0.35}
          metalness={0.2}
          flatShading
        />
      </mesh>
    </Float>
  );
}

function SeverityDot({
  position,
  color,
  size,
  index,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  index: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // subtle pulse
    const s = 1 + Math.sin(t * 2 + index) * 0.15;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.85}
        roughness={0.2}
      />
    </mesh>
  );
}

function CentralMedallion() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.4;
    ref.current.position.y = -2.6 + Math.sin(t * 0.9) * 0.08;
  });
  // small medallion under everything — stamp-like
  return (
    <group ref={ref} position={[0, -2.6, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.03, 16, 80]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.015, 12, 64]} />
        <meshStandardMaterial color={INK} emissive={INK} emissiveIntensity={0.3} />
      </mesh>
      {/* register crosses */}
      {[
        [-0.6, 0, 0],
        [0.6, 0, 0],
        [0, 0, -0.6],
        [0, 0, 0.6],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.05, 0.005, 0.005]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* lighting */}
      <ambientLight intensity={0.25} color={"#202028"} />
      <pointLight position={[3, 4, 2]} intensity={2.4} color={ACCENT} distance={14} />
      <pointLight position={[-4, 2, -3]} intensity={1.2} color={"#5BBCFF"} distance={12} />
      <pointLight position={[0, -3, 4]} intensity={0.6} color={"#FFFFFF"} distance={10} />

      {/* fog */}
      <fog attach="fog" args={["#0A0A0A", 6, 18]} />

      {/* wireframe floor */}
      <Grid
        position={[0, -3, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#252528"
        sectionSize={2}
        sectionThickness={1}
        sectionColor={ACCENT}
        fadeDistance={14}
        fadeStrength={1}
        infiniteGrid
      />

      {/* central reticle (lifted slightly) */}
      <ReticleRing />

      {/* 5 pillar pyramids */}
      {PILLAR_POSITIONS.map((p, i) => (
        <PillarPyramid
          key={i}
          position={[p.x, p.y, p.z]}
          scale={p.scale}
          rot={p.rot}
          index={i}
        />
      ))}

      {/* severity dots scattered */}
      {SEVERITY_DOTS.map((d, i) => (
        <SeverityDot
          key={i}
          position={[d.x, d.y, d.z]}
          color={d.color}
          size={d.size}
          index={i}
        />
      ))}

      {/* central audited medallion below */}
      <CentralMedallion />
    </>
  );
}

export function ThreeSceneHero() {
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onChange = () => setReduced(m.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 grid place-items-center pointer-events-none"
        aria-hidden
      >
        <div
          className="w-64 h-64 rounded-full border-2 border-dashed"
          style={{ borderColor: ACCENT, opacity: 0.4 }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 1.8, 7.5], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={inView ? "always" : "never"}
        onCreated={({ scene }) => {
          scene.background = null;
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.45}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Re-export THREE so consumer can extend if needed
export { THREE };
