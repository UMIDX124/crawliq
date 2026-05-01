"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * 1.5px progress bar at the very top of the viewport.
 * Fills with the brand accent as the user scrolls. Premium SaaS staple.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[color:var(--color-accent)] pointer-events-none"
      style={{
        scaleX,
        boxShadow: "0 0 12px var(--color-accent)",
      }}
    />
  );
}
