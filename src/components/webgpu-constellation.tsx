"use client";

/**
 * WebGPU audit constellation.
 *
 * 267 particles (= "267 checks per audit") orbit a central node.
 * Each particle belongs to one of 5 pillars and clusters with its peers
 * once an `activate` flag flips. Color encodes severity (pass/warn/crit).
 * Pure GPU compute via Three.js TSL — no CPU per-frame work, runs 60fps
 * even on integrated graphics.
 *
 * Falls back to a static SVG when:
 *   - WebGPU unavailable (Firefox, old browsers)
 *   - prefers-reduced-motion
 *   - WebGPU init fails
 */

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three/webgpu";

const TOTAL = 267; // matches the "Checks per audit" stat
const PILLARS = 5;

type Phase = "init" | "loading" | "running" | "fallback";

export function WebGPUConstellation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("init");

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let cancelled = false;

    async function run() {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setPhase("fallback");
        return;
      }
      const supportsWebGPU =
        typeof navigator !== "undefined" && "gpu" in navigator;
      if (!supportsWebGPU) {
        setPhase("fallback");
        return;
      }
      if (!containerRef.current) return;

      setPhase("loading");

      try {
        const [THREE, TSL] = await Promise.all([
          import("three/webgpu"),
          import("three/tsl"),
        ]);
        if (cancelled) return;

        const {
          color,
          time,
          uniform,
          float,
          vec3,
          instancedArray,
          instanceIndex,
          hash,
          Fn,
          mix,
          smoothstep,
          positionWorld,
          cameraPosition,
        } = TSL;

        const container = containerRef.current!;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 11);
        camera.lookAt(0, 0, 0);

        // Scene with pure black fog so far particles fade into the bg
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0A0A0A, 12, 22);

        // Storage buffers
        const positions = instancedArray(TOTAL, "vec3");
        const targets = instancedArray(TOTAL, "vec3");
        const seeds = instancedArray(TOTAL, "vec3");

        // Uniforms
        const cluster = uniform(0);     // 0 = orbit, 1 = clustered
        const dtUniform = uniform(0);
        const tUniform = uniform(0);

        // Init: assign each particle to a pillar (0..4), random orbit + cluster target
        const init = Fn(() => {
          const pos = positions.element(instanceIndex);
          const tgt = targets.element(instanceIndex);
          const seed = seeds.element(instanceIndex);

          const pillar = instanceIndex.mod(PILLARS).toFloat();
          const angle = pillar.mul(Math.PI * 2 / PILLARS).add(hash(instanceIndex).mul(0.4));
          const radius = float(3.6).add(hash(instanceIndex.add(1)).mul(0.5));

          // orbit positions distributed on a torus-ish band
          const ox = angle.cos().mul(radius);
          const oy = hash(instanceIndex.add(2)).sub(0.5).mul(2.4);
          const oz = angle.sin().mul(radius);
          pos.assign(vec3(ox, oy, oz));

          // cluster target = compact group near pillar center, slightly off-axis
          const cAngle = pillar.mul(Math.PI * 2 / PILLARS);
          const cR = float(2.8);
          const jitter = hash(instanceIndex.add(3)).sub(0.5).mul(0.7);
          const cx = cAngle.cos().mul(cR).add(jitter);
          const cy = hash(instanceIndex.add(4)).sub(0.5).mul(0.9);
          const cz = cAngle.sin().mul(cR).add(jitter);
          tgt.assign(vec3(cx, cy, cz));

          // pre-rolled per-particle randomness
          seed.assign(vec3(
            hash(instanceIndex.add(5)),
            hash(instanceIndex.add(6)),
            hash(instanceIndex.add(7)),
          ));
        })().compute(TOTAL);

        // Update: orbit motion + lerp toward target when activated
        const update = Fn(() => {
          const pos = positions.element(instanceIndex);
          const tgt = targets.element(instanceIndex);
          const seed = seeds.element(instanceIndex);

          const pillar = instanceIndex.mod(PILLARS).toFloat();
          const orbitSpeed = float(0.3).add(seed.x.mul(0.2));
          const angleNow = tUniform.mul(orbitSpeed).add(pillar.mul(Math.PI * 2 / PILLARS)).add(seed.y.mul(6.28));
          const radius = float(3.6).add(seed.x.mul(0.5));
          const orbitX = angleNow.cos().mul(radius);
          const orbitY = seed.z.sub(0.5).mul(2.4).add(tUniform.add(seed.x.mul(10)).sin().mul(0.18));
          const orbitZ = angleNow.sin().mul(radius);

          // lerp factor based on uniform
          const k = cluster.mul(smoothstep(float(0), float(1), cluster));
          const newX = mix(orbitX, tgt.x, k);
          const newY = mix(orbitY, tgt.y, k);
          const newZ = mix(orbitZ, tgt.z, k);
          pos.assign(vec3(newX, newY, newZ));
        })().compute(TOTAL);

        // Renderer
        const renderer = new THREE.WebGPURenderer({
          antialias: true,
          alpha: true,
        });
        await renderer.init();
        if (cancelled) {
          renderer.dispose();
          return;
        }
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Particle mesh — small spheres, instanced, additive glow on dark bg.
        const geo = new THREE.SphereGeometry(0.05, 6, 6);
        const mat = new THREE.MeshBasicNodeMaterial();
        mat.transparent = true;
        mat.depthWrite = false;
        mat.blending = THREE.AdditiveBlending;

        // Position from compute buffer
        mat.positionNode = positions.element(instanceIndex);

        // Color: hot magenta default, warn yellow for ~15%, red for ~5%.
        // Severity is deterministic from per-particle hash seed.
        mat.colorNode = Fn(() => {
          const seed = seeds.element(instanceIndex);
          const sev = seed.x;
          const magenta = color(0xFF1A6E);
          const warnYellow = color(0xFFC107);
          const red = color(0xFF4757);
          const isCrit = sev.lessThan(0.05).toFloat();
          const inWarnBand = sev.lessThan(0.20).toFloat();
          const isWarn = inWarnBand.sub(isCrit).max(float(0));
          const baseColor = magenta
            .mul(float(1).sub(isCrit).sub(isWarn))
            .add(warnYellow.mul(isWarn))
            .add(red.mul(isCrit));
          // depth fade: closer brighter, farther dimmer
          const dist = positionWorld.sub(cameraPosition).length();
          const fade = float(1.4).sub(smoothstep(float(7), float(15), dist));
          return baseColor.mul(fade.clamp(float(0.35), float(1.4)));
        })();

        const mesh = new THREE.InstancedMesh(geo, mat, TOTAL);
        scene.add(mesh);

        // Center node — solid sphere with subtle additive halo around it
        const centerGeo = new THREE.SphereGeometry(0.42, 24, 24);
        const centerMat = new THREE.MeshBasicNodeMaterial();
        centerMat.colorNode = color(0xFF1A6E);
        const center = new THREE.Mesh(centerGeo, centerMat);
        scene.add(center);

        // Center halo — additive green glow that breathes with the pulse
        const haloGeo = new THREE.RingGeometry(0.5, 0.78, 48);
        const haloMat = new THREE.MeshBasicNodeMaterial();
        haloMat.colorNode = color(0xFF1A6E);
        haloMat.transparent = true;
        haloMat.opacity = 0.28;
        haloMat.blending = THREE.AdditiveBlending;
        haloMat.depthWrite = false;
        haloMat.side = THREE.DoubleSide;
        const halo = new THREE.Mesh(haloGeo, haloMat);
        scene.add(halo);

        // Outer dashed ring (orbit guide) — white hairline on black
        const dashedPts: THREE.Vector3[] = [];
        const dashedSegs = 80;
        const outerR = 4.0;
        for (let i = 0; i < dashedSegs; i++) {
          if (i % 2) continue; // skip alternating to make dashes
          const a1 = (Math.PI * 2 * i) / dashedSegs;
          const a2 = (Math.PI * 2 * (i + 1)) / dashedSegs;
          dashedPts.push(new THREE.Vector3(Math.cos(a1) * outerR, 0, Math.sin(a1) * outerR));
          dashedPts.push(new THREE.Vector3(Math.cos(a2) * outerR, 0, Math.sin(a2) * outerR));
        }
        const dashedGeo = new THREE.BufferGeometry().setFromPoints(dashedPts);
        const dashedMat = new THREE.LineBasicNodeMaterial();
        dashedMat.colorNode = color(0xFFFFFF);
        dashedMat.transparent = true;
        dashedMat.opacity = 0.45;
        const dashedRing = new THREE.LineSegments(dashedGeo, dashedMat);
        dashedRing.rotation.x = -Math.PI / 2;
        scene.add(dashedRing);

        // Inner solid ring at cluster radius (2.8)
        const innerRingGeo = new THREE.RingGeometry(2.78, 2.82, 80);
        const innerRingMat = new THREE.MeshBasicNodeMaterial();
        innerRingMat.colorNode = color(0xFFFFFF);
        innerRingMat.transparent = true;
        innerRingMat.opacity = 0.16;
        innerRingMat.side = THREE.DoubleSide;
        const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
        innerRing.rotation.x = -Math.PI / 2;
        scene.add(innerRing);

        // 5 always-visible pillar marker dots at cluster targets — green additive
        const pillarMarkers: THREE.Mesh[] = [];
        for (let i = 0; i < PILLARS; i++) {
          const angle = (Math.PI * 2 * i) / PILLARS;
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.10, 16, 16),
            new THREE.MeshBasicNodeMaterial(),
          );
          m.position.set(Math.cos(angle) * 2.8, 0, Math.sin(angle) * 2.8);
          (m.material as THREE.MeshBasicNodeMaterial).colorNode = color(0xFF1A6E);
          (m.material as THREE.MeshBasicNodeMaterial).transparent = true;
          (m.material as THREE.MeshBasicNodeMaterial).opacity = 0.6;
          (m.material as THREE.MeshBasicNodeMaterial).blending = THREE.AdditiveBlending;
          (m.material as THREE.MeshBasicNodeMaterial).depthWrite = false;
          scene.add(m);
          pillarMarkers.push(m);
        }

        // Initialize particle positions
        renderer.compute(init);

        // Mouse parallax
        const target = { x: 0, y: 0 };
        const onMove = (e: MouseEvent) => {
          const r = container.getBoundingClientRect();
          target.x = ((e.clientX - r.left) / r.width - 0.5) * 1.2;
          target.y = -((e.clientY - r.top) / r.height - 0.5) * 0.8;
        };
        container.addEventListener("mousemove", onMove);

        // Resize
        const onResize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        // Cluster toggle on scroll past hero
        const onScroll = () => {
          const r = container.getBoundingClientRect();
          const visible = r.bottom > 100 && r.top < window.innerHeight;
          if (!visible) return;
          const scrollPct = Math.min(1, Math.max(0, -r.top / (window.innerHeight * 0.6)));
          cluster.value = scrollPct;
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        // Pause render loop when constellation is off-screen — saves significant GPU
        let inView = true;
        const io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) inView = e.isIntersecting;
          },
          { rootMargin: "120px" },
        );
        io.observe(container);

        // Animate
        const clock = new THREE.Clock();
        let lastFrame = 0;
        const animate = () => {
          if (!inView) {
            lastFrame = requestAnimationFrame(animate);
            return;
          }
          const dt = Math.min(clock.getDelta(), 0.08);
          const t = clock.getElapsedTime();
          dtUniform.value = dt;
          tUniform.value = t;

          // smooth camera parallax
          camera.position.x += (target.x - camera.position.x) * 0.04;
          camera.position.y += (target.y - camera.position.y) * 0.04;
          camera.lookAt(0, 0, 0);

          // gentle center pulse + halo breath
          const pulse = 1 + Math.sin(t * 1.6) * 0.07;
          center.scale.setScalar(pulse);
          halo.scale.setScalar(1 + Math.sin(t * 1.2) * 0.18);
          haloMat.opacity = 0.18 + Math.sin(t * 1.2) * 0.10;

          // pillar markers brighten as cluster forms
          const k = cluster.value;
          for (const m of pillarMarkers) {
            const pm = m.material as THREE.MeshBasicNodeMaterial;
            pm.opacity = 0.45 + k * 0.4;
            m.scale.setScalar(1 + k * 0.4);
          }

          // dashed outer ring slow rotation; inner ring opposite slow
          dashedRing.rotation.z = t * 0.18;
          innerRing.rotation.z = -t * 0.12;
          innerRingMat.opacity = 0.14 + k * 0.18;

          renderer.compute(update);
          renderer.render(scene, camera);
          lastFrame = requestAnimationFrame(animate);
        };
        lastFrame = requestAnimationFrame(animate);

        setPhase("running");

        cleanup = () => {
          cancelAnimationFrame(lastFrame);
          io.disconnect();
          window.removeEventListener("resize", onResize);
          window.removeEventListener("scroll", onScroll);
          container.removeEventListener("mousemove", onMove);
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
          geo.dispose();
          centerGeo.dispose();
          haloGeo.dispose();
          dashedGeo.dispose();
          innerRingGeo.dispose();
          for (const m of pillarMarkers) {
            (m.geometry as THREE.BufferGeometry).dispose();
          }
        };
      } catch (err) {
        console.warn("[constellation] WebGPU init failed, falling back", err);
        if (!cancelled) setPhase("fallback");
      }
    }

    run();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[560px] mx-auto"
      aria-hidden
    >
      {phase !== "running" && <FallbackConstellation />}
      <CornerLabels />
    </div>
  );
}

function FallbackConstellation() {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" aria-hidden>
      {/* outer ring */}
      <circle cx="200" cy="200" r="160" stroke="var(--color-accent)" strokeOpacity="0.4" strokeWidth="1" fill="none" strokeDasharray="3 5" />
      <circle cx="200" cy="200" r="120" stroke="var(--color-accent)" strokeOpacity="0.25" strokeWidth="1" fill="none" />
      {/* center */}
      <circle cx="200" cy="200" r="14" fill="var(--color-accent)" />
      {/* 5 pillar dots */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = 200 + 160 * Math.cos(a);
        const y = 200 + 160 * Math.sin(a);
        return (
          <g key={i}>
            <line x1="200" y1="200" x2={x} y2={y} stroke="var(--color-accent)" strokeOpacity="0.3" strokeWidth="1" />
            <circle cx={x} cy={y} r="6" fill="var(--color-accent)" />
          </g>
        );
      })}
      {/* 24 orbiting particles (subset of the 267) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 24;
        const r = 130 + (i % 3) * 12;
        const x = 200 + r * Math.cos(a);
        const y = 200 + r * Math.sin(a);
        return (
          <circle key={`p${i}`} cx={x} cy={y} r="2" fill="var(--color-accent)" opacity="0.7" />
        );
      })}
    </svg>
  );
}

function CornerLabels() {
  return (
    <div className="pointer-events-none absolute inset-0 font-mono text-[9.5px] tracking-[0.2em] uppercase text-fg-muted/70">
      <span className="absolute top-2 left-2">◇ audit.engine</span>
      <span className="absolute top-2 right-2">{TOTAL} signals</span>
      <span className="absolute bottom-2 left-2">5 pillars</span>
      <span className="absolute bottom-2 right-2 text-[color:var(--color-accent)]">live · v1</span>
    </div>
  );
}
