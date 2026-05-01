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

const ACCENT = "#FF5E1A";
const PASS = "#047857";
const WARN = "#B45309";
const CRIT = "#B91C1C";
const INK = "#1A1612";       // dark warm-charcoal — visible on cream bg
const INK_SOFT = "#5C544A";  // muted secondary lines

// PAGE CARDS — floating webpage-preview rectangles representing the URLs
// being audited. Replaces the prior 5-pyramid stamp cluster (felt cramped
// and shape-generic). Three cards now, spread wider with deeper depth, each
// carrying a score badge so the metaphor reads instantly: "audit cards".
const PAGE_CARDS = [
  { x: -4.6, y: 1.8, z: -0.6, rotX: -0.18, rotY: 0.42, rotZ: -0.06, scale: 1.0, score: 92, status: "pass" as const },
  { x: 4.4, y: -0.4, z: -1.2, rotX: 0.10, rotY: -0.55, rotZ: 0.05, scale: 0.85, score: 74, status: "warn" as const },
  { x: -2.0, y: -1.9, z: 2.0, rotX: 0.28, rotY: 0.30, rotZ: -0.04, scale: 0.78, score: 58, status: "crit" as const },
];

// Reduced severity dot count (was 14 → now 6) — less visual noise, more depth
const SEVERITY_DOTS = Array.from({ length: 6 }).map((_, i) => {
  const a = (Math.PI * 2 * i) / 6 + i * 0.18;
  const r = 2.6 + (i % 2) * 1.2;
  const sev = i % 5 === 0 ? "crit" : i % 3 === 0 ? "warn" : "pass";
  return {
    x: Math.cos(a) * r,
    y: 0.4 + (i % 3) * 0.6,
    z: Math.sin(a) * r,
    color: sev === "crit" ? CRIT : sev === "warn" ? WARN : PASS,
    size: 0.07 + (i % 2) * 0.02,
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

function PageCard3D({
  data,
  index,
}: {
  data: (typeof PAGE_CARDS)[number];
  index: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = data.y + Math.sin(t * 0.42 + index * 1.7) * 0.12;
    ref.current.rotation.z = data.rotZ + Math.sin(t * 0.28 + index) * 0.04;
  });

  // status colors picked for cream bg legibility
  const statusColor = data.status === "crit" ? CRIT : data.status === "warn" ? WARN : PASS;
  const statusGlow = data.status === "crit" ? 1.0 : data.status === "warn" ? 0.75 : 0.55;

  // page-card dimensions — landscape browser-window proportions
  const W = 1.85;
  const H = 1.25;
  const D = 0.06;
  const CHROME_H = 0.22;

  return (
    <Float speed={0.55} rotationIntensity={0.08} floatIntensity={0.18}>
      <group
        ref={ref}
        position={[data.x, data.y, data.z]}
        rotation={[data.rotX, data.rotY, data.rotZ]}
        scale={data.scale}
      >
        {/* card panel — browser-window body */}
        <mesh>
          <boxGeometry args={[W, H, D]} />
          <meshStandardMaterial
            color={"#FAF6EE"}
            emissive={"#FAF6EE"}
            emissiveIntensity={0.18}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>

        {/* browser chrome bar — top strip in slightly darker cream */}
        <mesh position={[0, H / 2 - CHROME_H / 2, D / 2 + 0.001]}>
          <planeGeometry args={[W - 0.04, CHROME_H]} />
          <meshStandardMaterial color={"#E5DDCD"} roughness={0.7} />
        </mesh>

        {/* traffic-light dots in chrome */}
        {[
          { x: -W / 2 + 0.12, color: CRIT },
          { x: -W / 2 + 0.22, color: WARN },
          { x: -W / 2 + 0.32, color: PASS },
        ].map((dot, i) => (
          <mesh
            key={i}
            position={[dot.x, H / 2 - CHROME_H / 2, D / 2 + 0.005]}
          >
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color={dot.color} emissive={dot.color} emissiveIntensity={0.4} />
          </mesh>
        ))}

        {/* URL bar — thin pill in chrome */}
        <mesh position={[0.15, H / 2 - CHROME_H / 2, D / 2 + 0.004]}>
          <planeGeometry args={[W * 0.55, CHROME_H * 0.45]} />
          <meshStandardMaterial color={"#F5F0E8"} roughness={0.8} />
        </mesh>

        {/* content lines — three thin bars suggesting page text */}
        {Array.from({ length: 3 }).map((_, i) => {
          const widths = [W * 0.55, W * 0.7, W * 0.42];
          return (
            <mesh
              key={i}
              position={[
                -W / 2 + 0.18 + widths[i] / 2,
                H / 2 - CHROME_H - 0.18 - i * 0.16,
                D / 2 + 0.003,
              ]}
            >
              <planeGeometry args={[widths[i], 0.06]} />
              <meshStandardMaterial color={INK_SOFT} opacity={0.55} transparent />
            </mesh>
          );
        })}

        {/* score badge — bottom-right, status-colored disc */}
        <group position={[W / 2 - 0.32, -H / 2 + 0.28, D / 2 + 0.02]}>
          <mesh>
            <circleGeometry args={[0.24, 32]} />
            <meshStandardMaterial
              color={statusColor}
              emissive={statusColor}
              emissiveIntensity={statusGlow}
            />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <ringGeometry args={[0.24, 0.255, 32]} />
            <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={statusGlow * 1.4} />
          </mesh>
        </group>

        {/* edge highlight — top-left corner accent line */}
        <mesh position={[-W / 2 + 0.4, H / 2 - CHROME_H / 2, D / 2 + 0.006]}>
          <planeGeometry args={[0.04, CHROME_H * 0.4]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.9} />
        </mesh>

        {/* faint accent edge frame — outline the card so it pops on cream */}
        <mesh position={[0, 0, -D / 2 - 0.001]}>
          <planeGeometry args={[W + 0.04, H + 0.04]} />
          <meshBasicMaterial color={ACCENT} opacity={0.18} transparent />
        </mesh>
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
      {/* lighting — re-tuned for cream bg, warmer overall */}
      <ambientLight intensity={0.55} color={"#FFF6E8"} />
      <pointLight position={[3, 4, 2]} intensity={2.0} color={ACCENT} distance={14} />
      <pointLight position={[-4, 2, -3]} intensity={0.9} color={"#FFD7B5"} distance={12} />
      <pointLight position={[0, -3, 4]} intensity={0.5} color={"#FFFFFF"} distance={10} />

      {/* fog — cream so distant geometry fades into bg */}
      <fog attach="fog" args={["#F5F0E8", 7, 20]} />

      {/* wireframe floor — subtle warm-charcoal cells on cream */}
      <Grid
        position={[0, -3, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#C7BFB1"
        sectionSize={2}
        sectionThickness={1}
        sectionColor={ACCENT}
        fadeDistance={14}
        fadeStrength={1}
        infiniteGrid
      />

      {/* central reticle (lifted slightly) */}
      <ReticleRing />

      {/* 3 floating page-cards — replaces the prior 5-stamp pyramid cluster */}
      {PAGE_CARDS.map((c, i) => (
        <PageCard3D key={i} data={c} index={i} />
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
        className="relative w-full aspect-square max-w-[560px] mx-auto grid place-items-center pointer-events-none"
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
      className="relative w-full aspect-square max-w-[560px] mx-auto overflow-hidden rounded-2xl"
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
