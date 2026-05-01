"use client";

/**
 * /preview/watch-think — scroll-pinned terminal choreography.
 *
 * Section pins for 3 viewport heights. Five terminals don't all start
 * at once — they activate sequentially as scroll progresses through
 * the pinned region. Each has its own scroll-tied progress.
 */

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";

const AGENTS = [
  {
    id: "on-page",
    name: "On-Page",
    lines: [
      "fetching index.html…",
      "title: 78 chars (over 60 ✗)",
      "meta-desc: 142 chars ✓",
      "h1 count: 0 ✗ critical",
      "alt-text coverage: 87%",
      "score: 74 / 100",
    ],
  },
  {
    id: "technical",
    name: "Technical",
    lines: [
      "TLS handshake: TLS 1.3 ✓",
      "redirect chain: 3 hops ✗",
      "load time: 3.8s ✗",
      "robots.txt: present ✓",
      "canonical: missing on /blog/* ✗",
      "score: 58 / 100",
    ],
  },
  {
    id: "content",
    name: "Content",
    lines: [
      "tokenizing body text…",
      "word count: 1,840",
      "readability: grade 9.2 ✓",
      "topical clusters: 3 detected",
      "thin pages: 12 found ✗",
      "score: 91 / 100",
    ],
  },
  {
    id: "off-site",
    name: "Off-Site",
    lines: [
      "querying backlink graph…",
      "referring domains: 47",
      "median DA: 22 ✗ low",
      "anchor variance: 0.74 ✓",
      "toxic links: 12 ✗",
      "score: 66 / 100",
    ],
  },
  {
    id: "competitor",
    name: "Competitor",
    lines: [
      "identifying SERP rivals…",
      "[1] competitor-a.com",
      "[2] competitor-b.io",
      "content-gap: 8 keywords ✗",
      "backlink-gap: 124 domains ✗",
      "score: 52 / 100",
    ],
  },
];

const ACCENT = "var(--color-accent)";

export default function WatchThinkPreview() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const sp = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted/70 hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border)] rounded backdrop-blur"
      >
        ← preview index
      </Link>

      {/* intro */}
      <section className="relative pt-32 pb-16 px-6 md:px-10 text-center">
        <div className="max-w-[820px] mx-auto">
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-5">
            ◇ Phase 2 · scroll choreography
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,80px)] leading-[0.95] tracking-[-0.03em] mb-6">
            Watch the auditors think.
          </h1>
          <p className="text-fg-muted text-[16px] leading-[1.6] mb-3">
            Scroll. Each agent activates in sequence. Their findings stream as you progress.
          </p>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-faint">
            ↓ scroll
          </div>
        </div>
      </section>

      {/* Pinned scroll choreography section */}
      <section ref={ref} className="relative" style={{ height: "320vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <div className="w-full max-w-[1280px] mx-auto px-6 md:px-10">
            {/* progress rail */}
            <ProgressRail progress={sp} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12">
              {AGENTS.map((agent, i) => (
                <Terminal
                  key={agent.id}
                  agent={agent}
                  index={i}
                  total={AGENTS.length}
                  progress={sp}
                />
              ))}
            </div>

            <FinalSummary progress={sp} />
          </div>
        </div>
      </section>

      {/* exit */}
      <section className="py-32 px-6 md:px-10 text-center">
        <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-muted">
          ◇ end of choreography · {AGENTS.length} agents · all signals real
        </p>
      </section>
    </main>
  );
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  const widthPct = useTransform(progress, [0, 1], ["0%", "100%"]);
  const stagePct = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-muted shrink-0">
        Progress
      </span>
      <div className="flex-1 h-[2px] bg-[color:var(--color-bg-3)] relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            width: widthPct,
            background: ACCENT,
          }}
        />
      </div>
      <motion.span className="font-mono text-[10.5px] tabular-nums text-[color:var(--color-accent)] w-12 text-right shrink-0">
        {stagePct}
      </motion.span>
    </div>
  );
}

function Terminal({
  agent,
  index,
  total,
  progress,
}: {
  agent: (typeof AGENTS)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Stagger each terminal's activation across the scroll progress
  const start = index / total;
  const end = (index + 1) / total + 0.05;

  // Scale + glow as terminal becomes the focused one
  const focusOpacity = useTransform(progress, [start, (start + end) / 2, end], [0.35, 1, 0.85]);
  const borderOpacity = useTransform(progress, [start, (start + end) / 2, end], [0.10, 1, 0.5]);
  const scale = useTransform(progress, [start, (start + end) / 2, end], [0.96, 1.02, 1]);

  // How many lines to show — driven by progress through THIS agent's scroll window
  const lineFraction = useTransform(progress, [start, end], [0, 1]);

  return (
    <motion.div
      style={{
        opacity: focusOpacity,
        scale,
      }}
      className="relative"
    >
      <motion.div
        className="absolute inset-0 rounded-xl border-2 pointer-events-none"
        style={{
          borderColor: ACCENT,
          opacity: borderOpacity,
        }}
      />
      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden h-full flex flex-col">
        {/* terminal bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57] shrink-0" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e] shrink-0" />
          <span className="w-2 h-2 rounded-full bg-[#28c840] shrink-0" />
          <span className="ml-2 font-mono text-[10px] text-fg-muted truncate">
            {agent.id}.agent
          </span>
        </div>
        {/* output */}
        <div className="p-3 font-mono text-[10.5px] leading-[1.7] flex-1 min-h-[200px]">
          <div className="text-[color:var(--color-accent)] mb-1.5">▷ {agent.name}</div>
          <Lines progress={lineFraction} lines={agent.lines} />
        </div>
      </div>
    </motion.div>
  );
}

function Lines({
  progress,
  lines,
}: {
  progress: MotionValue<number>;
  lines: string[];
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {lines.map((line, i) => {
        const lineStart = i / lines.length;
        const lineEnd = (i + 1) / lines.length;
        return <Line key={i} progress={progress} start={lineStart} end={lineEnd} text={line} />;
      })}
    </div>
  );
}

function Line({
  progress,
  start,
  end,
  text,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  text: string;
}) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const x = useTransform(progress, [start, end], [-8, 0]);
  let color = "text-fg";
  if (text.includes("✗")) color = "text-[color:var(--color-crit)]";
  else if (text.includes("✓")) color = "text-[color:var(--color-pass)]";
  else if (text.startsWith("score:")) color = "text-[color:var(--color-accent)] font-bold";
  return (
    <motion.div className={color} style={{ opacity, x }}>
      {text}
    </motion.div>
  );
}

function FinalSummary({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.85, 1], [0, 1]);
  const y = useTransform(progress, [0.85, 1], [16, 0]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="mt-10 rounded-xl border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] p-6 max-w-2xl mx-auto text-center"
    >
      <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-accent)] mb-3">
        ◇ overall score
      </div>
      <div className="font-display font-black text-[64px] leading-none tabular-nums">
        68
      </div>
      <div className="mt-2 font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
        15 critical · 22 warnings · 18 passes
      </div>
    </motion.div>
  );
}
