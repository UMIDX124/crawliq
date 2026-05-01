"use client";

import { motion, useReducedMotion } from "framer-motion";

const pillars = [
  { name: "On-Page", val: 92 },
  { name: "Technical", val: 81 },
  { name: "Content", val: 94 },
  { name: "Off-Site", val: 88 },
  { name: "Competitor", val: 86 },
];

export function ScoreVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-3">
      {pillars.map((p, i) => (
        <div key={p.name} className="flex items-center gap-4">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-fg-muted w-24">
            {p.name}
          </div>
          <div className="flex-1 h-2 rounded-full bg-[color:var(--color-bg-3)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[color:var(--color-accent)] origin-left"
              initial={reduce ? { width: `${p.val}%` } : { width: "0%" }}
              whileInView={{ width: `${p.val}%` }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: reduce ? 0 : 1.1,
                ease: [0.16, 1, 0.3, 1],
                delay: reduce ? 0 : 0.1 + i * 0.08,
              }}
            />
          </div>
          <div className="font-display font-extrabold text-[15px] tabular-nums w-10 text-right">
            {p.val}
          </div>
        </div>
      ))}
    </div>
  );
}
