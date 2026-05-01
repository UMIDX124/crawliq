"use client";

import { motion } from "framer-motion";

/**
 * Animated accent line that grows from center as it enters viewport.
 * Replaces the static <div className="hairline" /> dividers between sections.
 * Subtle but premium — visitors register the cinematic transition without
 * consciously noticing it.
 */
export function SectionBridge() {
  return (
    <div
      className="relative h-px max-w-[1280px] mx-auto"
      aria-hidden
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0.5 }}
        className="h-full mx-6"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--color-border-strong) 30%, var(--color-accent) 50%, var(--color-border-strong) 70%, transparent 100%)",
            opacity: 0.6,
          }}
        />
      </motion.div>
    </div>
  );
}
