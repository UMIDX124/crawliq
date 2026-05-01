"use client";

/**
 * /preview/pricing-3d — pricing cards with cursor-driven 3D depth.
 * Each card has parallax layers (header / price / features / CTA on
 * different Z planes). Featured card has a cursor-tracked border glow.
 */

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Check, Minus, ArrowRight } from "@phosphor-icons/react";

const PLANS = [
  {
    tier: "Free",
    monthly: 0,
    blurb: "Single-site checks, curiosity audits.",
    features: [
      { text: "3 audits per month", included: true },
      { text: "On-Page + Technical pillars", included: true },
      { text: "PDF export", included: false },
      { text: "Competitor gap analysis", included: false },
    ],
  },
  {
    tier: "Pro",
    monthly: 49,
    blurb: "Freelancers and growing agencies running weekly audits.",
    featured: true,
    features: [
      { text: "Unlimited audits", included: true },
      { text: "All 5 audit pillars", included: true },
      { text: "White-label PDF reports", included: true },
      { text: "Competitor gap analysis", included: true },
    ],
  },
  {
    tier: "Agency",
    monthly: 149,
    blurb: "Teams managing many client sites with scheduled re-audits.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 10 team seats", included: true },
      { text: "Scheduled auto re-audits", included: true },
      { text: "API access + webhooks", included: true },
    ],
  },
];

export default function Pricing3DPreview() {
  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      <Link
        href="/preview"
        className="btn-tactile fixed top-4 left-4 z-50 px-3.5 py-2 backdrop-blur-md font-mono text-[10px] tracking-[0.22em] uppercase border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/70 rounded-full text-fg-muted hover:text-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]"
      >
        ← preview index
      </Link>

      <section className="pt-40 pb-20 px-6 md:px-10 text-center">
        <div className="max-w-[820px] mx-auto">
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] mb-4">
            &lt; 05 / 12 · PRICING &gt;
          </div>
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-6">
            ◇ Phase 5 · cursor 3D depth
          </div>
          <h1 className="font-display font-black text-balance text-[clamp(36px,6vw,80px)] leading-[0.92] tracking-[-0.035em] mb-6">
            Start free. Scale up.
          </h1>
          <p className="text-balance text-[color:var(--color-fg-muted)] text-[16px] leading-[1.6] max-w-[60ch] mx-auto">
            Move your cursor over the cards. Each layer (header / price / features / CTA) sits on its own Z-plane.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-10 py-12">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 items-stretch">
          {PLANS.map((p) => (
            <PricingCard key={p.tier} plan={p} />
          ))}
        </div>
      </section>

      <section className="py-40 px-6 md:px-10 text-center">
        <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)]">
          ◇ depth via cursor parallax
        </p>
        <p className="mt-4 font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-faint)]">
          &lt; 05 / 12 · END OF PHASE &gt;
        </p>
      </section>
    </main>
  );
}

function PricingCard({ plan }: { plan: (typeof PLANS)[number] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.4 });

  // Card tilts ~6°
  const rotY = useTransform(sx, (v) => (v - 0.5) * 8);
  const rotX = useTransform(sy, (v) => -(v - 0.5) * 8);

  // Each layer at its own Z depth — tilt creates parallax automatically
  const headerZ = 30;
  const priceZ = 50;
  const blurbZ = 20;
  const featuresZ = 40;
  const ctaZ = 60;

  // Cursor-tracked glow position
  const glowX = useTransform(sx, (v) => `${v * 100}%`);
  const glowY = useTransform(sy, (v) => `${v * 100}%`);
  const [glowActive, setGlowActive] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    setGlowActive(true);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
    setGlowActive(false);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        transformStyle: "preserve-3d",
        rotateX: reduce ? 0 : rotX,
        rotateY: reduce ? 0 : rotY,
        perspective: 1200,
      }}
      className={`card-lift relative rounded-2xl border ${plan.featured ? "border-[color:var(--color-accent)] shadow-[0_28px_70px_-32px_rgb(255_94_26/_0.55),0_8px_24px_-16px_rgb(26_22_18/_0.18)]" : "border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)] shadow-[0_8px_24px_-22px_rgb(26_22_18/_0.35)]"} bg-[color:var(--color-surface)] p-8 md:p-9 overflow-hidden`}
    >
      {plan.featured && (
        <span
          className="absolute -top-3 left-7 inline-flex items-center gap-1.5 whitespace-nowrap bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-mono text-[10px] tracking-[0.22em] uppercase font-bold px-3.5 py-1.5 rounded-full shadow-[0_6px_18px_-6px_rgb(255_94_26/_0.7)]"
          style={{ transform: `translateZ(${ctaZ + 20}px)` }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent-fg)] pulse-dot" />
          Most popular
        </span>
      )}

      {/* cursor glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glowActive && !reduce ? 1 : 0,
          background: useTransform(
            [glowX, glowY],
            ([x, y]) =>
              `radial-gradient(420px circle at ${x} ${y}, rgb(255 94 26 / 0.18), transparent 50%)`,
          ),
        }}
      />

      <div style={{ transform: `translateZ(${headerZ}px)` }} className="font-mono text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] mb-5">
        {plan.tier}
      </div>

      <div
        style={{ transform: `translateZ(${priceZ}px)` }}
        className="flex items-baseline gap-2 mb-2 whitespace-nowrap"
      >
        <span className="font-display font-extrabold text-[56px] leading-none tabular-nums tracking-[-0.035em]">
          ${plan.monthly}
        </span>
        <span className="text-[color:var(--color-fg-muted)] text-[15px]">/mo</span>
      </div>

      <p
        style={{ transform: `translateZ(${blurbZ}px)` }}
        className="text-[14px] text-[color:var(--color-fg-muted)] leading-[1.6] pb-7 mb-7 border-b border-[color:var(--color-border)]"
      >
        {plan.blurb}
      </p>

      <ul style={{ transform: `translateZ(${featuresZ}px)` }} className="flex flex-col mb-8 divide-y divide-[color:var(--color-border)]">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-3 text-[14px] py-2.5 first:pt-0 last:pb-0">
            {f.included ? (
              <Check size={16} weight="bold" className="text-[color:var(--color-accent)] shrink-0 mt-1" />
            ) : (
              <Minus size={16} weight="bold" className="text-[color:var(--color-fg-faint)] shrink-0 mt-1" />
            )}
            <span className={f.included ? "text-[color:var(--color-fg)]" : "text-[color:var(--color-fg-faint)] line-through"}>{f.text}</span>
          </li>
        ))}
      </ul>

      <a
        href="#"
        style={{ transform: `translateZ(${ctaZ}px)` }}
        className={`btn-tactile inline-flex items-center justify-center gap-2 rounded-md py-3.5 font-mono text-[12px] uppercase tracking-[0.22em] font-bold ${plan.featured ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)] shadow-[0_8px_22px_-10px_rgb(255_94_26/_0.6)]" : "border border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"}`}
      >
        Get {plan.tier} <ArrowRight size={14} weight="bold" />
      </a>
    </motion.article>
  );
}
