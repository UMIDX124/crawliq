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

// Floating 3D AUDIT STAMP SEALS — extruded versions of CrawlIQ's signature
// stamp mark. Five of them at varied angles/sizes, scattered around the
// central reticle. Stamps reinforce "this is an audit deliverable" — unique
// to CrawlIQ, not the same 3D scene every other SaaS uses.
const STAMPS = [
  { x: -3.8, y: 1.5, z: -1.0, rotX: -0.25, rotY: 0.35, rotZ: -0.18, scale: 0.85, finding: false, glow: 0.4 },
  { x: 3.6, y: 1.0, z: -0.6, rotX: -0.15, rotY: -0.45, rotZ: 0.22, scale: 0.7, finding: true, glow: 1.1 },
  { x: -2.4, y: -1.6, z: 1.4, rotX: 0.3, rotY: 0.55, rotZ: 0.1, scale: 0.6, finding: false, glow: 0.3 },
  { x: 3.4, y: -1.4, z: 1.0, rotX: 0.22, rotY: -0.25, rotZ: -0.1, scale: 0.95, finding: true, glow: 0.9 },
  { x: -4.2, y: 0.0, z: 0.6, rotX: -0.05, rotY: 0.65, rotZ: 0.15, scale: 0.55, finding: false, glow: 0.35 },
];

// Severity dots scattered wider, more deliberately
const SEVERITY_DOTS = Array.from({ length: 14 }).map((_, i) => {
  const a = (Math.PI * 2 * i) / 14 + i * 0.21;
  const r = 2.2 + (i % 3) * 0.9;
  const sev = i % 7 === 0 ? "crit" : i % 4 === 0 ? "warn" : "pass";
  return {
    x: Math.cos(a) * r,
    y: 0.6 + (i % 5) * 0.5,
    z: Math.sin(a) * r,
    color: sev === "crit" ? CRIT : sev === "warn" ? WARN : PASS,
    size: 0.06 + (i % 3) * 0.015,
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

function AuditStamp3D({
  data,
  index,
}: {
  data: (typeof STAMPS)[number];
  index: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = data.y + Math.sin(t * 0.45 + index * 1.7) * 0.14;
    // slow per-stamp rotation around its own normal
    ref.current.rotation.z = data.rotZ + Math.sin(t * 0.3 + index) * 0.08;
  });

  const stampColor = data.finding ? ACCENT : INK;
  const stampGlow = data.glow;

  return (
    <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.2}>
      <group
        ref={ref}
        position={[data.x, data.y, data.z]}
        rotation={[data.rotX, data.rotY, data.rotZ]}
        scale={data.scale}
      >
        {/* outer broken/dashed ring — recreate the AuditedSeal mark in 3D */}
        {Array.from({ length: 24 }).map((_, i) => {
          if (i % 2) return null;
          const a1 = (Math.PI * 2 * i) / 24;
          const a2 = (Math.PI * 2 * (i + 1)) / 24;
          const ax = (a1 + a2) / 2;
          const r = 1.0;
          return (
            <mesh
              key={i}
              position={[Math.cos(ax) * r, Math.sin(ax) * r, 0]}
              rotation={[0, 0, ax + Math.PI / 2]}
            >
              <boxGeometry args={[0.13, 0.025, 0.06]} />
              <meshStandardMaterial
                color={stampColor}
                emissive={stampColor}
                emissiveIntensity={stampGlow}
              />
            </mesh>
          );
        })}
        {/* inner solid ring */}
        <mesh>
          <torusGeometry args={[0.74, 0.022, 12, 64]} />
          <meshStandardMaterial
            color={stampColor}
            emissive={stampColor}
            emissiveIntensity={stampGlow * 0.8}
          />
        </mesh>
        {/* register crosshair lines */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.018, 0.16, 0.04]} />
          <meshStandardMaterial color={stampColor} emissive={stampColor} emissiveIntensity={stampGlow * 0.6} />
        </mesh>
        <mesh position={[0, -1.0, 0]}>
          <boxGeometry args={[0.018, 0.16, 0.04]} />
          <meshStandardMaterial color={stampColor} emissive={stampColor} emissiveIntensity={stampGlow * 0.6} />
        </mesh>
        <mesh position={[1.0, 0, 0]}>
          <boxGeometry args={[0.16, 0.018, 0.04]} />
          <meshStandardMaterial color={stampColor} emissive={stampColor} emissiveIntensity={stampGlow * 0.6} />
        </mesh>
        <mesh position={[-1.0, 0, 0]}>
          <boxGeometry args={[0.16, 0.018, 0.04]} />
          <meshStandardMaterial color={stampColor} emissive={stampColor} emissiveIntensity={stampGlow * 0.6} />
        </mesh>
        {/* center mark — small octahedron (stamp imprint) */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial
            color={stampColor}
            emissive={stampColor}
            emissiveIntensity={stampGlow * 1.2}
            flatShading
          />
        </mesh>
        {/* finding indicator — small magenta dot offset (only on stamps with findings) */}
        {data.finding && (
          <mesh position={[0.62, 0.62, 0.05]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.6} />
          </mesh>
        )}
      </group>
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

      {/* 5 floating audit stamps — extruded versions of the AuditedSeal mark */}
      {STAMPS.map((s, i) => (
        <AuditStamp3D key={i} data={s} index={i} />
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
