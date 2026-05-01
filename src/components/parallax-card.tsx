"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Mouse-tracked 3D parallax wrapper for cards.
 * - Outer card tilts ~3° with cursor (perspective)
 * - Inner content lifts toward cursor (subtle Z translation)
 * - Ambient cursor-tracked glow
 * - Honors prefers-reduced-motion (renders static)
 */
export function ParallaxCard({
  children,
  className,
  intensity = 1,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.4 });

  const rotY = useTransform(sx, (v) => (v - 0.5) * 6 * intensity);
  const rotX = useTransform(sy, (v) => -(v - 0.5) * 6 * intensity);
  const glowX = useTransform(sx, (v) => `${v * 100}%`);
  const glowY = useTransform(sy, (v) => `${v * 100}%`);

  const transform = useMotionTemplate`perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${glowX} ${glowY}, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 55%)`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ transform, transformStyle: "preserve-3d" }}
      className={`relative ${className ?? ""}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glowBg }}
      />
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
    </motion.div>
  );
}
