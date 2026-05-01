"use client";

/**
 * /preview/features-h — vertical scroll converts to horizontal feature scroll.
 *
 * When user enters the pinned section, vertical scroll progresses the
 * inner container horizontally. After the last card crosses, vertical
 * scroll resumes naturally.
 */

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { MagnifyingGlass, GearSix, PencilLine, LinkSimple, Target, FilePdf, ChartBar, Code, Calendar } from "@phosphor-icons/react";

const FEATURES = [
  { icon: MagnifyingGlass, title: "On-Page", body: "Title, meta, h1, alt-text, OG, schema. Every signal a search engine reads on the page.", count: "240+ checks" },
  { icon: GearSix, title: "Technical", body: "HTTPS, redirects, sitemap, canonicals, schema, page weight, Core Web Vitals.", count: "Real crawl" },
  { icon: PencilLine, title: "Content", body: "Readability, depth vs competitors, freshness, topical authority, thin pages.", count: "AI-graded" },
  { icon: LinkSimple, title: "Off-Site", body: "Domain authority, backlink profile, anchor distribution, toxic link flags.", count: "Link intel" },
  { icon: Target, title: "Competitor", body: "Top 3 SERP rivals identified. Content gaps, backlink gaps, keyword overlap.", count: "Gap finder" },
  { icon: FilePdf, title: "PDF Export", body: "12-page branded report. Drop your logo, your colors, ship to clients.", count: "White-label" },
  { icon: ChartBar, title: "Score", body: "Each pillar produces a 0-100 score. Re-audit after fixes and watch the trend.", count: "0-100" },
  { icon: Code, title: "API + Webhooks", body: "Trigger audits programmatically. JSON findings, webhook events.", count: "Agency plan" },
  { icon: Calendar, title: "Scheduled", body: "Set weekly or monthly cadence. Get email digests when scores shift.", count: "Auto re-run" },
];

export default function FeaturesHPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const sp = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Inner track translates horizontally as vertical scroll progresses.
  // 9 cards, ~360px each + gaps, total ~3600px. Translate by full width.
  const x = useTransform(sp, [0, 1], ["0%", "-83%"]);

  // Progress bar
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
            ◇ Phase 3 · vertical → horizontal scroll
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,80px)] leading-[0.95] tracking-[-0.03em] mb-6">
            Every angle, every issue.
          </h1>
          <p className="text-fg-muted text-[16px] leading-[1.6]">
            Scroll down. Cards reveal one by one across. After the last card, vertical scroll resumes.
          </p>
        </div>
      </section>

      {/* Pinned section — height = N viewport heights for the horizontal scroll runway */}
      <section ref={ref} className="relative" style={{ height: "500vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
          {/* progress rail */}
          <div className="px-6 md:px-10 pb-8">
            <div className="max-w-[1280px] mx-auto flex items-center gap-4">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-muted shrink-0">
                ◇ scroll
              </span>
              <div className="flex-1 h-[2px] bg-[color:var(--color-bg-3)] relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[color:var(--color-accent)]"
                  style={{ width: widthPct }}
                />
              </div>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-muted shrink-0">
                {FEATURES.length} pillars
              </span>
            </div>
          </div>

          {/* horizontal track */}
          <motion.div
            style={{ x }}
            className="flex gap-5 px-6 md:px-10 will-change-transform"
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} progress={sp} total={FEATURES.length} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-10 text-center">
        <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-muted">
          ◇ vertical scroll resumes
        </p>
      </section>
    </main>
  );
}

function FeatureCard({
  feature,
  index,
  progress,
  total,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  // Each card has its own focus window in the scroll progress
  const start = Math.max(0, (index - 0.5) / total);
  const end = Math.min(1, (index + 1) / total);
  const focusOpacity = useTransform(progress, [start, (start + end) / 2, end], [0.45, 1, 0.85]);
  const scale = useTransform(progress, [start, (start + end) / 2, end], [0.95, 1.02, 1]);

  const Icon = feature.icon;
  return (
    <motion.article
      style={{ opacity: focusOpacity, scale }}
      className="shrink-0 w-[360px] md:w-[420px] h-[480px] rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 md:p-10 flex flex-col"
    >
      <div className="flex items-start justify-between mb-7">
        <div className="w-10 h-10 rounded-lg bg-[color:var(--color-accent-soft)] grid place-items-center text-[color:var(--color-accent)]">
          <Icon size={20} weight="duotone" />
        </div>
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-faint border border-[color:var(--color-border)] px-2 py-1 rounded whitespace-nowrap">
          {feature.count}
        </span>
      </div>
      <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-muted mb-2">
        Pillar · {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <h3 className="font-display font-extrabold text-[36px] leading-[1.05] tracking-[-0.02em] mb-5">
        {feature.title}
      </h3>
      <p className="text-fg-muted text-[15px] leading-[1.65] flex-1">
        {feature.body}
      </p>
      <div className="mt-6 pt-5 border-t border-[color:var(--color-border)]">
        <div className="font-display font-extrabold text-[44px] leading-none text-[color:var(--color-accent)] tabular-nums">
          {[92, 81, 94, 88, 86, 100, 87, 100, 100][index] ?? 90}
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.16em] uppercase text-fg-faint">
          sample score
        </div>
      </div>
    </motion.article>
  );
}
