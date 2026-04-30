"use client";

import { useState } from "react";
import { Check, Minus, ArrowRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";

type Plan = {
  tier: string;
  monthly: number;
  yearly: number;
  blurb: string;
  cta: string;
  ctaHref: string;
  featured?: boolean;
  features: { text: string; included: boolean }[];
};

const plans: Plan[] = [
  {
    tier: "Free",
    monthly: 0,
    yearly: 0,
    blurb: "For testing, single-site checks, and curiosity audits.",
    cta: "Start free audit",
    ctaHref: "/sign-up",
    features: [
      { text: "3 audits per month", included: true },
      { text: "On-Page + Technical pillars", included: true },
      { text: "Findings list with severity", included: true },
      { text: "PDF export", included: false },
      { text: "Competitor gap analysis", included: false },
      { text: "Team seats", included: false },
    ],
  },
  {
    tier: "Pro",
    monthly: 49,
    yearly: 39,
    blurb: "For freelancers and growing agencies running weekly audits.",
    cta: "Start Pro trial",
    ctaHref: "/sign-up?plan=pro",
    featured: true,
    features: [
      { text: "Unlimited audits", included: true },
      { text: "All 5 audit pillars", included: true },
      { text: "White-label PDF reports", included: true },
      { text: "Competitor gap analysis", included: true },
      { text: "Priority streaming results", included: true },
      { text: "Email + chat support", included: true },
    ],
  },
  {
    tier: "Agency",
    monthly: 149,
    yearly: 119,
    blurb: "For teams managing many client sites with scheduled re-audits.",
    cta: "Talk to sales",
    ctaHref: "#cta",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 10 team seats", included: true },
      { text: "Client portal access", included: true },
      { text: "Scheduled auto re-audits", included: true },
      { text: "API access + webhooks", included: true },
      { text: "Dedicated CSM", included: true },
    ],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Pricing
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Start free.{" "}
            <span className="italic font-light text-fg-muted">
              Scale when you&rsquo;re ready.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-fg-muted text-[16px] md:text-[17px] leading-[1.65]">
            No hidden fees. No annual lock-in. Cancel anytime.
          </p>
        </Reveal>

        {/* monthly / annual toggle */}
        <Reveal delay={0.08}>
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-1">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={cn(
                  "px-5 py-2 rounded-full font-mono text-[11px] tracking-[0.16em] uppercase transition-colors",
                  !annual
                    ? "bg-[color:var(--color-fg)] text-[color:var(--color-bg)]"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={cn(
                  "px-5 py-2 rounded-full font-mono text-[11px] tracking-[0.16em] uppercase transition-colors flex items-center gap-2",
                  annual
                    ? "bg-[color:var(--color-fg)] text-[color:var(--color-bg)]"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                Annual
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full font-mono text-[9px] tracking-[0.12em]",
                    annual
                      ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                      : "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
                  )}
                >
                  -20%
                </span>
              </button>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <Reveal key={p.tier} delay={i * 0.08}>
              <PriceCard plan={p} annual={annual} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 4, y: px * 4 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  const price = annual ? plan.yearly : plan.monthly;

  return (
    <article
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative h-full rounded-2xl p-8 md:p-9 flex flex-col transition-transform duration-300",
        plan.featured
          ? "border border-[color:var(--color-accent)] bg-[color:var(--color-surface)] shadow-[0_24px_48px_-24px_rgb(0_102_255/_0.25)]"
          : "border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
      )}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-7 inline-block bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1 rounded-full">
          Most popular
        </span>
      )}

      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted mb-5">
        {plan.tier}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display font-extrabold text-[52px] leading-none tabular-nums">
          ${price}
        </span>
        <span className="text-fg-muted text-[15px]">/mo</span>
      </div>
      <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint mb-6">
        {annual && price > 0
          ? `billed yearly · save $${(plan.monthly - plan.yearly) * 12}`
          : price === 0
            ? "free forever"
            : "billed monthly"}
      </div>

      <p className="text-[14px] text-fg-muted leading-[1.6] pb-7 mb-7 border-b border-[color:var(--color-border)]">
        {plan.blurb}
      </p>

      <ul className="flex flex-col gap-3 mb-9 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-3 text-[14px]">
            {f.included ? (
              <Check
                size={16}
                weight="bold"
                className="text-[color:var(--color-accent)] shrink-0 mt-1"
              />
            ) : (
              <Minus
                size={16}
                weight="bold"
                className="text-fg-faint shrink-0 mt-1"
              />
            )}
            <span
              className={cn(
                f.included ? "text-fg" : "text-fg-faint line-through",
              )}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={plan.ctaHref}
        className={cn(
          "btn-tactile group inline-flex items-center justify-center gap-2 rounded-md py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] focus-ring",
          plan.featured
            ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)]"
            : "border border-[color:var(--color-border-strong)] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
        )}
      >
        {plan.cta}
        <ArrowRight
          size={14}
          weight="bold"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </a>
    </article>
  );
}
