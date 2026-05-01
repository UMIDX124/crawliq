"use client";

/**
 * GlobalAuditCursor — site-wide custom cursor.
 *
 * Renders a CrawlIQ-themed reticle that follows the viewport mouse with
 * spring damping. Sits OVER the native cursor (doesn't hide it) so the
 * effect is additive — users keep their familiar cursor with a subtle
 * brand accent following it.
 *
 * - Hides on touch devices and small viewports
 * - Honors prefers-reduced-motion (renders nothing)
 * - Expands when hovering links / buttons / inputs
 * - Faint trailing dot for motion sense
 */

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function GlobalAuditCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  // Inner reticle — snappy
  const sx = useSpring(x, { stiffness: 700, damping: 38, mass: 0.25 });
  const sy = useSpring(y, { stiffness: 700, damping: 38, mass: 0.25 });

  // Trailing dot — lazier
  const tx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 });
  const ty = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    // Disable on touch / small viewports
    const isTouch = window.matchMedia("(hover: none)").matches;
    const isNarrow = window.innerWidth < 900;
    if (isTouch || isNarrow) return;

    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      setHovering(!!t?.closest("a, button, input, textarea, [role='button'], label[for]"));
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
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* trailing dot — lags behind, fades on idle */}
      <motion.div
        aria-hidden
        style={{ x: tx, y: ty }}
        className="pointer-events-none fixed top-0 left-0 z-[200] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
      >
        <div
          className="rounded-full"
          style={{
            width: hovering ? 8 : 5,
            height: hovering ? 8 : 5,
            background: "var(--color-accent)",
            opacity: 0.45,
            transition: "width 200ms, height 200ms",
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
          width={hovering ? 56 : 36}
          height={hovering ? 56 : 36}
          viewBox="0 0 56 56"
          fill="none"
          style={{
            transition: "width 200ms cubic-bezier(0.16,1,0.3,1), height 200ms cubic-bezier(0.16,1,0.3,1)",
            filter: active ? "brightness(1.3)" : undefined,
          }}
        >
          {/* outer dashed ring */}
          <circle
            cx="28"
            cy="28"
            r={hovering ? 24 : 14}
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.85"
            style={{ transition: "r 200ms cubic-bezier(0.16,1,0.3,1)" }}
          />
          {/* inner filled dot */}
          <circle
            cx="28"
            cy="28"
            r={active ? 5 : hovering ? 3 : 2.5}
            fill="var(--color-accent)"
            style={{ transition: "r 120ms" }}
          />
          {/* crosshair ticks — only when hovering */}
          {hovering && (
            <>
              <line x1="28" y1="2" x2="28" y2="6" stroke="var(--color-accent)" strokeWidth="1" />
              <line x1="28" y1="50" x2="28" y2="54" stroke="var(--color-accent)" strokeWidth="1" />
              <line x1="2" y1="28" x2="6" y2="28" stroke="var(--color-accent)" strokeWidth="1" />
              <line x1="50" y1="28" x2="54" y2="28" stroke="var(--color-accent)" strokeWidth="1" />
            </>
          )}
        </svg>
      </motion.div>
    </>
  );
}
