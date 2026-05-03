"use client";

import { motion } from "framer-motion";

/**
 * Section bridge with optional report-style page marker.
 * - Animated 3-stop hairline drawn from center (ink + tangerine register)
 * - Editorial marker centered on the line: "§ 03 — end of section"
 *
 * The /total ratio was dropped — it conflicted with the per-section eyebrow
 * numbering and read as fake page-of-pages metadata.
 */
export function SectionBridge({
  num,
  label = "end of section",
}: {
  num?: string;
  /** retained for back-compat; no longer rendered */
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
            <span className="text-fg-faint/60"> — {label}</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
