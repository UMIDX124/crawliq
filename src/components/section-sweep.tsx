"use client";

/**
 * SectionSweep — animated full-bleed accent sweep that fires when a new
 * section enters the viewport. Pure CSS + Framer Motion, no WebGL needed.
 * Works as a clean section transition between major beats.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function SweepSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (reduce || played) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.15) {
            setPlayed(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: [0, 0.15, 0.3] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, played]);

  return (
    <section ref={ref} id={id} className={`relative overflow-hidden ${className ?? ""}`}>
      {!reduce && played && (
        <motion.div
          aria-hidden
          initial={{ x: "-100%" }}
          animate={{ x: "110%" }}
          transition={{ duration: 0.7, ease: [0.85, 0, 0.15, 1] }}
          className="pointer-events-none absolute inset-y-0 z-20"
          style={{
            width: "60%",
            background:
              "linear-gradient(90deg, transparent 0%, rgb(255 94 26 / 0.08) 30%, rgb(255 94 26 / 0.18) 50%, rgb(255 94 26 / 0.08) 70%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />
      )}
      {children}
    </section>
  );
}
