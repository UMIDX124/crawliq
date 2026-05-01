"use client";

/**
 * AuditCursor — region-scoped custom cursor.
 *
 * When the user's mouse enters the wrapping region, the native cursor is
 * hidden and a CrawlIQ reticle follows the cursor with spring damping.
 * The cursor reverts to native on exit. Reduced-motion users keep native.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function AuditCursorRegion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.3 });
  const [inside, setInside] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };
    const onEnter = () => setInside(true);
    const onLeave = () => setInside(false);
    const onOverInteractive = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a, button, input, [role='button']"));
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseover", onOverInteractive);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseover", onOverInteractive);
    };
  }, [reduce, x, y]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} style={{ cursor: !reduce && inside ? "none" : "auto" }}>
      {children}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-[60] -translate-x-1/2 -translate-y-1/2"
          style={{
            x: sx,
            y: sy,
            opacity: inside ? 1 : 0,
            transition: "opacity 200ms",
          }}
        >
          {/* reticle */}
          <svg
            width={hovering ? 64 : 40}
            height={hovering ? 64 : 40}
            viewBox="0 0 64 64"
            fill="none"
            style={{ transition: "width 220ms, height 220ms" }}
          >
            <circle
              cx="32"
              cy="32"
              r="22"
              stroke="var(--color-accent)"
              strokeWidth="1.25"
              strokeDasharray="3 5"
              opacity="0.85"
            />
            <circle
              cx="32"
              cy="32"
              r={hovering ? 12 : 4}
              fill="var(--color-accent)"
              style={{ transition: "r 200ms" }}
            />
            {/* crosshair */}
            <line x1="32" y1="6" x2="32" y2="14" stroke="var(--color-accent)" strokeWidth="1" />
            <line x1="32" y1="50" x2="32" y2="58" stroke="var(--color-accent)" strokeWidth="1" />
            <line x1="6" y1="32" x2="14" y2="32" stroke="var(--color-accent)" strokeWidth="1" />
            <line x1="50" y1="32" x2="58" y2="32" stroke="var(--color-accent)" strokeWidth="1" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
