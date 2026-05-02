"use client";

import { motion } from "framer-motion";

/**
 * Section bridge with optional report-style page marker.
 * - Animated accent line drawn from center
 * - Page-of-pages marker centered on the line: "§ 03 / 12 — end of section"
 *
 * Replaces hard cuts between sections with a soft document-style transition.
 */
export function SectionBridge({
  num,
  total = "12",
  label = "end of section",
}: {
  num?: string;
  total?: string;
  label?: string;
}) {
  return (
    <div
      className="relative max-w-[1280px] mx-auto py-3"
      aria-hidden
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0.5 }}
        className="h-px mx-6"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--color-ink-strong) 28%, var(--color-ink) 48%, var(--color-accent) 52%, var(--color-ink-strong) 72%, transparent 100%)",
            opacity: 0.55,
          }}
        />
      </motion.div>

      {num && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none"
        >
          <span className="bg-[color:var(--color-bg)] px-4 font-mono text-[10px] tracking-[0.2em] uppercase">
            <span className="text-[color:var(--color-ink)] font-bold">§ {num}</span>
            <span className="text-fg-faint"> / {total} </span>
            <span className="text-fg-faint/60">— {label}</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
