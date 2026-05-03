"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useReducedMotion } from "framer-motion";
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
    tier: "Studio",
    monthly: 149,
    yearly: 119,
    blurb: "For small agencies running up to 10 client retainers.",
    cta: "Start Studio trial",
    ctaHref: "/sign-up?plan=studio",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 10 team seats", included: true },
      { text: "Client portal access", included: true },
      { text: "Scheduled auto re-audits", included: true },
      { text: "API access + webhooks", included: true },
      { text: "Email + chat support", included: true },
    ],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);
  const { isSignedIn } = useUser();

  return (
    <section id="pricing" className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <Reveal y={40} className="max-w-3xl">
          <h2 className="display-xl">
            Start free.{" "}
            <span className="italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]">
              Scale when you&rsquo;re ready.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-fg-muted text-[16px] md:text-[17px] leading-[1.65]">
            No hidden fees. No annual lock-in. Cancel anytime. Your audit data
            stays in your account — we don&rsquo;t sell it or train models on it.
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
              <PriceCard
                plan={p}
                annual={annual}
                isSignedIn={!!isSignedIn}
              />
            </Reveal>
          ))}
        </div>

        {/* Enterprise band — no sticker price, intentionally. The buyer for
            this tier is procurement at a 100+ staff agency or in-house team;
            they expect a conversation, not a self-serve checkout. Hidden
            pricing is the standard signal at this segment (Stripe / Vercel /
            Snowflake all do this). */}
        <Reveal delay={0.32}>
          <div className="mt-10 rounded-2xl section-ink relative overflow-hidden p-8 md:p-12 lg:p-14 register-marks">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.92 0 0 0 0 0.78 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                backgroundSize: "220px 220px",
              }}
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-center">
              <div>
                <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase mb-4" style={{ color: "var(--color-accent)" }}>
                  Enterprise · custom
                </div>
                <h3 className="display-xl" style={{ color: "#F4E9CD" }}>
                  Replace 0.5 of a senior SEO,{" "}
                  <span className="italic font-normal [font-family:var(--font-serif)] tracking-[-0.01em]" style={{ color: "rgb(244 233 205 / 0.78)" }}>
                    not your stack.
                  </span>
                </h3>
                <p className="mt-6 max-w-[60ch] text-[16px] leading-[1.7]" style={{ color: "rgb(244 233 205 / 0.72)" }}>
                  For agencies running 50+ client retainers, in-house teams at
                  Series-B+ companies, and platform partners embedding audits
                  into onboarding. Custom signal rules, dedicated infrastructure,
                  named senior auditor on escalation, SOC 2 in progress, white-
                  label client portal on your domain.
                </p>
                <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-w-[640px]">
                  {[
                    "50+ team seats",
                    "Custom domain client portal",
                    "Dedicated audit infrastructure",
                    "Custom signal detection rules",
                    "SSO / SAML",
                    "Named onboarding + CSM",
                    "99.9% uptime SLA",
                    "Quarterly business reviews",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px]" style={{ color: "rgb(244 233 205 / 0.85)" }}>
                      <span
                        aria-hidden
                        className="mt-2 inline-block w-1 h-1 rounded-full shrink-0"
                        style={{ background: "var(--color-accent)" }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4 items-start lg:items-end">
                <a
                  href="/talk-to-umer"
                  className="btn-tactile inline-flex items-center gap-2 rounded-md px-6 py-4 font-mono text-[12px] uppercase tracking-[0.16em] shadow-accent"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-accent-fg)",
                  }}
                >
                  Talk to Umer
                  <ArrowRight size={14} weight="bold" />
                </a>
                <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "rgb(244 233 205 / 0.55)" }}>
                  $5K–$15K / month · custom
                </div>
                <div className="text-[12px] leading-[1.6] max-w-[280px] lg:text-right" style={{ color: "rgb(244 233 205 / 0.55)" }}>
                  Founder-led conversation. 30 min. No SDR, no slide deck — just
                  the math on whether this saves your agency more than it costs.
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PriceCard({
  plan,
  annual,
  isSignedIn,
}: {
  plan: Plan;
  annual: boolean;
  isSignedIn: boolean;
}) {
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: -(py - 0.5) * 4, y: (px - 0.5) * 4 });
    setGlow({ x: px * 100, y: py * 100, active: true });
  };
  const reset = () => {
    setTilt({ x: 0, y: 0 });
    setGlow((g) => ({ ...g, active: false }));
  };

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
          ? "border-2 border-[color:var(--color-accent)] bg-[color:var(--color-surface)] shadow-accent"
          : "border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] shadow-layered shadow-layered-hover",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
        style={{
          opacity: glow.active ? 1 : 0,
          background: `radial-gradient(420px circle at ${glow.x}% ${glow.y}%, rgb(255 94 26 / 0.12), transparent 50%)`,
        }}
      />
      {plan.featured && (
        <span className="absolute top-0 -translate-y-1/2 left-7 inline-flex items-center gap-1.5 whitespace-nowrap bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-mono text-[10px] tracking-[0.22em] uppercase px-3 py-1.5 rounded-full ring-4 ring-[color:var(--color-bg)] shadow-[0_6px_18px_-6px_rgb(255_94_26/_0.55)]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent-fg)] pulse-dot" aria-hidden />
          Most popular
        </span>
      )}

      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted mb-5">
        {plan.tier}
      </div>

      <div className="flex items-baseline gap-2 mb-2 whitespace-nowrap">
        <span className="font-display font-extrabold text-[52px] leading-none tabular-nums">
          ${price}
        </span>
        <span className="text-fg-muted text-[15px]">/mo</span>
      </div>
      <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint mb-6 leading-snug">
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
                f.included
                  ? "text-fg"
                  : "text-[color:var(--color-fg-subtle)] line-through decoration-[color:var(--color-fg-subtle)] decoration-2 decoration-from-font",
              )}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={
          plan.tier === "Free"
            ? "/sign-up"
            : isSignedIn
              ? "/settings/billing"
              : "/sign-up"
        }
        className={cn(
          "btn-tactile group inline-flex items-center justify-center gap-2 rounded-md py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] focus-ring",
          plan.featured
            ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)]"
            : "border border-[color:var(--color-border-strong)] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
        )}
      >
        {plan.tier === "Free"
          ? plan.cta
          : isSignedIn
            ? `Upgrade to ${plan.tier}`
            : `Get ${plan.tier} access`}
        <ArrowRight
          size={14}
          weight="bold"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </a>
    </article>
  );
}
