"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Entry = {
  domain: string;
  score: number;
  ago: string;
};

const POOL: Entry[] = [
  { domain: "techstartup.com", score: 84, ago: "14s ago" },
  { domain: "yogastudio.app", score: 71, ago: "23s ago" },
  { domain: "mintbike.shop", score: 92, ago: "37s ago" },
  { domain: "norden.studio", score: 68, ago: "44s ago" },
  { domain: "harborlaw.com", score: 79, ago: "1m ago" },
  { domain: "fielddata.io", score: 88, ago: "1m ago" },
  { domain: "rivertide.media", score: 64, ago: "2m ago" },
  { domain: "northwood.cafe", score: 95, ago: "2m ago" },
  { domain: "atelier-fournier.fr", score: 73, ago: "3m ago" },
  { domain: "cobaltlabs.dev", score: 87, ago: "3m ago" },
];

export function LiveTicker() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % POOL.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const entry = POOL[idx];

  return (
    <div className="flex items-center gap-3 font-mono text-[11.5px] tracking-wide">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
      <span className="text-fg-muted">live</span>
      <span className="text-fg-faint">|</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${entry.domain}-${idx}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="text-fg flex items-center gap-2"
        >
          <span className="text-[color:var(--color-pass)]">✓</span>
          <span>{entry.domain}</span>
          <span className="text-fg-faint">scored</span>
          <span className="font-bold">{entry.score}</span>
          <span className="text-fg-faint hidden sm:inline">· {entry.ago}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
