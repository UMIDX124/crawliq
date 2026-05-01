"use client";

/**
 * GlobalAuditCursor — site-wide custom audit reticle cursor.
 *
 * Hides the native cursor across the document and replaces it with a
 * CrawlIQ audit reticle (dashed ring + center dot + crosshair ticks).
 *
 * - Hides on touch devices and small viewports (<900px) — native cursor stays
 * - Honors prefers-reduced-motion (renders nothing, native cursor returns)
 * - Expands + flips to inverse-mode over interactive elements
 * - Trailing accent dot with lazy spring for motion sense
 * - Inline action label ("CLICK", "TYPE", "DRAG") next to reticle on hover
 * - Crosshair ticks pulse outward subtly when active
 */

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type Mode = "idle" | "link" | "button" | "input" | "drag";

const LABEL: Record<Mode, string> = {
  idle: "",
  link: "OPEN",
  button: "CLICK",
  input: "TYPE",
  drag: "DRAG",
};

export function GlobalAuditCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [active, setActive] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  // Inner reticle — snappy
  const sx = useSpring(x, { stiffness: 700, damping: 38, mass: 0.25 });
  const sy = useSpring(y, { stiffness: 700, damping: 38, mass: 0.25 });

  // Trailing dot — lazier
  const tx = useSpring(x, { stiffness: 200, damping: 22, mass: 0.6 });
  const ty = useSpring(y, { stiffness: 200, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(hover: none)").matches;
    const isNarrow = window.innerWidth < 900;
    if (isTouch || isNarrow) return;

    setEnabled(true);
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("input, textarea, [contenteditable='true']")) {
        setMode("input");
      } else if (t.closest("a")) {
        setMode("link");
      } else if (t.closest("button, [role='button'], label[for], [data-cursor='button']")) {
        setMode("button");
      } else if (t.closest("[data-cursor='drag']")) {
        setMode("drag");
      } else {
        setMode("idle");
      }
    };
    const onDown = () => setActive(true);
    const onUp = () => setActive(false);
    const onLeaveDoc = () => {
      x.set(-200);
      y.set(-200);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeaveDoc);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeaveDoc);
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  const hovering = mode !== "idle";
  const reticleSize = hovering ? 64 : 40;
  const innerR = active ? 6 : hovering ? 3 : 4;
  const outerR = hovering ? 28 : 16;

  return (
    <>
      {/* trailing dot — lags behind */}
      <motion.div
        aria-hidden
        style={{ x: tx, y: ty }}
        className="pointer-events-none fixed top-0 left-0 z-[200] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="rounded-full"
          style={{
            width: hovering ? 10 : 6,
            height: hovering ? 10 : 6,
            background: "var(--color-accent)",
            opacity: hovering ? 0.35 : 0.25,
            transition: "width 200ms, height 200ms, opacity 200ms",
          }}
        />
      </motion.div>

      {/* primary reticle */}
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed top-0 left-0 z-[201] -translate-x-1/2 -translate-y-1/2"
      >
        <svg
          width={reticleSize}
          height={reticleSize}
          viewBox="0 0 64 64"
          fill="none"
          style={{
            transition: "width 220ms cubic-bezier(0.16,1,0.3,1), height 220ms cubic-bezier(0.16,1,0.3,1)",
            filter: active ? "brightness(1.25)" : undefined,
          }}
        >
          {/* outer dashed ring */}
          <circle
            cx="32"
            cy="32"
            r={outerR}
            stroke="var(--color-accent)"
            strokeWidth="1.25"
            strokeDasharray="3 5"
            opacity="0.9"
            style={{ transition: "r 220ms cubic-bezier(0.16,1,0.3,1)" }}
          />
          {/* secondary inner ring — only on hover, gives instrument feel */}
          {hovering && (
            <circle
              cx="32"
              cy="32"
              r={outerR - 8}
              stroke="var(--color-accent)"
              strokeWidth="1"
              opacity="0.45"
            />
          )}
          {/* center dot */}
          <circle
            cx="32"
            cy="32"
            r={innerR}
            fill="var(--color-accent)"
            style={{ transition: "r 140ms" }}
          />
          {/* crosshair ticks — always visible; longer on hover */}
          <line
            x1="32"
            y1={hovering ? 2 : 12}
            x2="32"
            y2={hovering ? 8 : 16}
            stroke="var(--color-accent)"
            strokeWidth="1.25"
            opacity="0.85"
            style={{ transition: "y1 220ms, y2 220ms" }}
          />
          <line
            x1="32"
            y1={hovering ? 56 : 48}
            x2="32"
            y2={hovering ? 62 : 52}
            stroke="var(--color-accent)"
            strokeWidth="1.25"
            opacity="0.85"
            style={{ transition: "y1 220ms, y2 220ms" }}
          />
          <line
            x1={hovering ? 2 : 12}
            y1="32"
            x2={hovering ? 8 : 16}
            y2="32"
            stroke="var(--color-accent)"
            strokeWidth="1.25"
            opacity="0.85"
            style={{ transition: "x1 220ms, x2 220ms" }}
          />
          <line
            x1={hovering ? 56 : 48}
            y1="32"
            x2={hovering ? 62 : 52}
            y2="32"
            stroke="var(--color-accent)"
            strokeWidth="1.25"
            opacity="0.85"
            style={{ transition: "x1 220ms, x2 220ms" }}
          />
        </svg>
      </motion.div>

      {/* action label — small mono pill that appears next to reticle on hover */}
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed top-0 left-0 z-[202]"
      >
        <div
          style={{
            transform: `translate(${hovering ? 32 : 22}px, ${hovering ? -6 : -4}px)`,
            opacity: hovering ? 1 : 0,
            transition: "opacity 180ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1)",
          }}
          className="font-mono text-[9.5px] tracking-[0.22em] uppercase whitespace-nowrap rounded-sm px-1.5 py-0.5"
        >
          <span
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accent-fg)",
              padding: "2px 6px",
              borderRadius: "3px",
              fontWeight: 700,
            }}
          >
            {LABEL[mode]}
          </span>
        </div>
      </motion.div>
    </>
  );
}
