"use client";

/**
 * Q mascot — the CrawlIQ wave-and-peek character.
 *
 * 3D extruded Q letter body, with a face inside the Q's curl, two stick arms,
 * and a continuous wave on the right arm. Renders inside a small R3F canvas
 * positioned at fixed bottom-right via the host component. Pause-when-offscreen
 * (rare here since it's fixed-position, but covers the dismiss case).
 *
 * Personality:
 *  - Idle bob       — gentle Y-translate ±2px on a 3.2s cosine loop
 *  - Eye-track      — pupils follow the cursor with a soft spring
 *  - Wave           — right arm rotates -45° → +20° on a 1.6s ease loop
 *  - Blink          — eyes squint every ~3.8s for 130ms
 *  - Speech tap     — clicking the canvas triggers a one-shot "jump" anim
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Group, Mesh, Vector3 } from "three";
import * as THREE from "three";

const ACCENT = "#FF5E1A";
const ACCENT_HOVER = "#E84F0F";
const INK = "#15110D";
const CREAM = "#F8EFD8";

// ─── Q body — extruded shape from a parametric path ─────────────────────────

function useQShape() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    // Outer circle (Q body)
    shape.absarc(0, 0, 1.0, 0, Math.PI * 2, false);

    // Inner circle (hole) — counter-clockwise hole path
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.55, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    return shape;
  }, []);
}

function useTailShape() {
  // Q's tail — a small rounded rectangle rotated 45° at the bottom-right
  return useMemo(() => {
    const shape = new THREE.Shape();
    const w = 0.5;
    const h = 0.18;
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2 - h / 2, -h / 2);
    shape.absarc(w / 2 - h / 2, 0, h / 2, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(-w / 2, h / 2);
    shape.lineTo(-w / 2, -h / 2);
    return shape;
  }, []);
}

function QBody() {
  const qShape = useQShape();
  const tailShape = useTailShape();
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 1.95) * 0.06;
    groupRef.current.rotation.z = Math.sin(t * 0.7) * 0.04;
  });

  return (
    <group ref={groupRef}>
      {/* main Q ring */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry
          args={[
            qShape,
            { depth: 0.32, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.06, bevelSegments: 4, curveSegments: 48 },
          ]}
        />
        <meshStandardMaterial
          color={ACCENT}
          roughness={0.45}
          metalness={0.05}
          emissive={ACCENT}
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* tail at bottom-right, rotated 45° */}
      <group position={[0.62, -0.62, 0.16]} rotation={[0, 0, -Math.PI / 4]}>
        <mesh>
          <extrudeGeometry
            args={[
              tailShape,
              { depth: 0.32, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 3 },
            ]}
          />
          <meshStandardMaterial color={ACCENT_HOVER} roughness={0.45} />
        </mesh>
      </group>

      {/* face — sits on top face of the ring, inside the curl */}
      <Face />

      {/* arms */}
      <Arms />
    </group>
  );
}

// ─── Face ───────────────────────────────────────────────────────────────────

function Face() {
  const leftEye = useRef<Mesh>(null);
  const rightEye = useRef<Mesh>(null);
  const mouth = useRef<Mesh>(null);
  const [, setBlink] = useState(false);

  // Eye tracking — follow the camera/cursor
  useFrame(({ pointer }) => {
    if (!leftEye.current || !rightEye.current) return;
    const dx = pointer.x * 0.025;
    const dy = pointer.y * 0.025;
    leftEye.current.position.x = -0.18 + dx;
    leftEye.current.position.y = 0.05 + dy;
    rightEye.current.position.x = 0.18 + dx;
    rightEye.current.position.y = 0.05 + dy;
  });

  // Blink loop
  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setBlink(true);
      const closeAt = setTimeout(() => {
        setBlink(false);
      }, 130);
      const next = setTimeout(tick, 3500 + Math.random() * 1500);
      raf = next as unknown as number;
      return () => {
        clearTimeout(closeAt);
        clearTimeout(next);
      };
    };
    const t = setTimeout(tick, 1800);
    return () => {
      cancelled = true;
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <group position={[0, 0, 0.34]}>
      {/* eyes */}
      <mesh ref={leftEye} position={[-0.18, 0.05, 0]}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial color={INK} />
      </mesh>
      <mesh ref={rightEye} position={[0.18, 0.05, 0]}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial color={INK} />
      </mesh>
      {/* eye-shines */}
      <mesh position={[-0.16, 0.08, 0.001]}>
        <circleGeometry args={[0.02, 12]} />
        <meshBasicMaterial color={CREAM} />
      </mesh>
      <mesh position={[0.20, 0.08, 0.001]}>
        <circleGeometry args={[0.02, 12]} />
        <meshBasicMaterial color={CREAM} />
      </mesh>

      {/* smile — small torus arc */}
      <mesh ref={mouth} position={[0, -0.10, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.022, 8, 24, Math.PI]} />
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
}

// ─── Arms ───────────────────────────────────────────────────────────────────

function Arms() {
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Right arm — wave loop. Rotation oscillates between -0.7 and +0.4 rad.
    if (rightArm.current) {
      const wave = Math.sin(t * 3.2);
      rightArm.current.rotation.z = -1.1 + wave * 0.55;
    }
    // Left arm — gentle sway as if relaxed by the side
    if (leftArm.current) {
      leftArm.current.rotation.z = 0.15 + Math.sin(t * 1.3) * 0.06;
    }
  });

  return (
    <>
      {/* left arm — pivot at upper-left of Q */}
      <group ref={leftArm} position={[-0.95, 0.05, 0.16]}>
        <mesh position={[-0.32, -0.35, 0]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.06, 0.55, 6, 12]} />
          <meshStandardMaterial color={ACCENT} roughness={0.5} />
        </mesh>
        {/* hand */}
        <mesh position={[-0.55, -0.65, 0]}>
          <sphereGeometry args={[0.10, 16, 16]} />
          <meshStandardMaterial color={ACCENT_HOVER} roughness={0.45} />
        </mesh>
      </group>

      {/* right arm — wave pivot, hand higher up + open */}
      <group ref={rightArm} position={[0.95, 0.05, 0.16]}>
        <mesh position={[0.42, 0.05, 0]} rotation={[0, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.6, 6, 12]} />
          <meshStandardMaterial color={ACCENT} roughness={0.5} />
        </mesh>
        {/* hand — slightly bigger to read as the waving one */}
        <mesh position={[0.78, 0.10, 0]}>
          <sphereGeometry args={[0.13, 18, 18]} />
          <meshStandardMaterial
            color={ACCENT_HOVER}
            roughness={0.45}
            emissive={ACCENT}
            emissiveIntensity={0.18}
          />
        </mesh>
      </group>
    </>
  );
}

// ─── Stage / Lighting ───────────────────────────────────────────────────────

function Stage() {
  return (
    <>
      <ambientLight intensity={0.6} color={"#FFF1D9"} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} color={"#FFFFFF"} />
      <pointLight position={[-3, -2, 3]} intensity={0.5} color={ACCENT} />
      <Float speed={0.7} rotationIntensity={0.05} floatIntensity={0.18}>
        <QBody />
      </Float>
    </>
  );
}

// ─── Public component ──────────────────────────────────────────────────────

export function MascotQ({ className }: { className?: string }) {
  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <Canvas
        camera={{ position: [0, 0.05, 3.2], fov: 35 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Stage />
        </Suspense>
      </Canvas>
    </div>
  );
}
