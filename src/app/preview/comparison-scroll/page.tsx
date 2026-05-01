"use client";

/**
 * /preview/comparison-scroll — pinned comparison table where each row
 * reveals progressively as scroll advances. Summary card scales out
 * after the final row is revealed.
 */

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { Check, Minus } from "@phosphor-icons/react";

const ROWS = [
  { label: "On-page audit", us: true, lh: true, ah: true, manual: true },
  { label: "Technical crawl", us: true, lh: true, ah: true, manual: false },
  { label: "AI-written explanations", us: true, lh: false, ah: false, manual: true },
  { label: "Content depth + topic gap", us: true, lh: false, ah: "partial", manual: false },
  { label: "Competitor gap analysis", us: true, lh: false, ah: true, manual: false },
  { label: "Streaming results in <10s", us: true, lh: false, ah: false, manual: false },
  { label: "Prioritized fix list", us: true, lh: false, ah: false, manual: false },
  { label: "PDF / white-label export", us: true, lh: false, ah: true, manual: true },
  { label: "Cost per audit", us: "$0–149/mo", lh: "free", ah: "$$$", manual: "$$$$$" },
];

export default function ComparisonScrollPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const sp = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const widthPct = useTransform(sp, [0, 1], ["0%", "100%"]);

  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted/70 hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border)] rounded backdrop-blur"
      >
        ← preview index
      </Link>

      <section className="pt-32 pb-12 px-6 md:px-10 text-center">
        <div className="max-w-[820px] mx-auto">
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-5">
            ◇ Phase 4 · pinned table reveal
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,80px)] leading-[0.95] tracking-[-0.03em] mb-6">
            One tool. Replaces five.
          </h1>
          <p className="text-fg-muted text-[16px] leading-[1.6]">
            Scroll. Each row appears. The CrawlIQ check arrives first, then the competitor marks settle.
          </p>
        </div>
      </section>

      <section ref={ref} className="relative" style={{ height: "350vh" }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 md:px-10">
          <div className="w-full max-w-[1100px]">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-muted shrink-0">
                ◇ rows revealed
              </span>
              <div className="flex-1 h-[2px] bg-[color:var(--color-bg-3)] relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[color:var(--color-accent)]"
                  style={{ width: widthPct }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden">
              {/* header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
                <div className="px-5 md:px-7 py-5 font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted">
                  Capability
                </div>
                <div className="px-3 py-5 text-center font-display font-extrabold text-[14px] text-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] border-l border-[color:var(--color-border)]">
                  CrawlIQ
                </div>
                <div className="px-3 py-5 text-center font-display font-bold text-[13px] border-l border-[color:var(--color-border)]">
                  Lighthouse
                </div>
                <div className="px-3 py-5 text-center font-display font-bold text-[13px] border-l border-[color:var(--color-border)]">
                  Ahrefs
                </div>
                <div className="px-3 py-5 text-center font-display font-bold text-[13px] border-l border-[color:var(--color-border)]">
                  Manual
                </div>
              </div>

              {ROWS.map((row, i) => (
                <Row key={row.label} row={row} index={i} total={ROWS.length} progress={sp} />
              ))}
            </div>

            <Summary progress={sp} />
          </div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-10 text-center">
        <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-muted">
          ◇ end of comparison
        </p>
      </section>
    </main>
  );
}

function Row({
  row,
  index,
  total,
  progress,
}: {
  row: (typeof ROWS)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / (total + 1);
  const end = (index + 1) / (total + 1);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [10, 0]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center border-b border-[color:var(--color-border)] last:border-b-0"
    >
      <div className="px-5 md:px-7 py-4 text-[14px]">{row.label}</div>
      <Cell value={row.us} progress={progress} start={start} delay={0.1} accent />
      <Cell value={row.lh} progress={progress} start={start} delay={0.18} />
      <Cell value={row.ah} progress={progress} start={start} delay={0.26} />
      <Cell value={row.manual} progress={progress} start={start} delay={0.34} />
    </motion.div>
  );
}

function Cell({
  value,
  progress,
  start,
  delay,
  accent,
}: {
  value: boolean | "partial" | string;
  progress: MotionValue<number>;
  start: number;
  delay: number;
  accent?: boolean;
}) {
  const o = useTransform(progress, [start + delay * 0.05, start + delay * 0.05 + 0.04], [0, 1]);
  const s = useTransform(progress, [start + delay * 0.05, start + delay * 0.05 + 0.04], [0.7, 1]);
  return (
    <motion.div
      style={{ opacity: o, scale: s }}
      className={`py-4 text-center border-l border-[color:var(--color-border)] ${accent ? "bg-[color:var(--color-accent-soft)]" : ""}`}
    >
      {value === true ? (
        <Check size={18} weight="bold" className={accent ? "mx-auto text-[color:var(--color-accent)]" : "mx-auto text-[color:var(--color-pass)]"} />
      ) : value === false ? (
        <Minus size={16} weight="bold" className="mx-auto text-fg-faint" />
      ) : value === "partial" ? (
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-muted">partial</span>
      ) : (
        <span className={`font-mono text-[10.5px] tracking-[0.12em] uppercase ${accent ? "text-[color:var(--color-accent)]" : "text-fg-muted"}`}>
          {value}
        </span>
      )}
    </motion.div>
  );
}

function Summary({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.88, 1], [0, 1]);
  const scale = useTransform(progress, [0.88, 1], [0.85, 1]);
  return (
    <motion.div
      style={{ opacity, scale }}
      className="mt-6 rounded-2xl border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] p-6 text-center max-w-md mx-auto"
    >
      <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-accent)] mb-2">
        ◇ verdict
      </div>
      <div className="font-display font-black text-[28px] leading-tight">
        9 / 9 capabilities · 1 tool
      </div>
    </motion.div>
  );
}
