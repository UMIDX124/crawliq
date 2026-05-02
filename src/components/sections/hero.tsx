"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { KineticHeading, FadeChildren } from "@/components/kinetic-heading";
import { LiveTicker } from "@/components/live-ticker";
import { CountUp } from "@/components/count-up";
import { InlineAudit } from "@/components/inline-audit";
import { Magnetic } from "@/components/magnetic";
import { AuditedSeal } from "@/components/audit-stamp";
import { HeroFloatingCards, HeroLiveFinding } from "@/components/hero-floating-cards";

// Lazy-load the R3F 3D scene — original CrawlIQ floating audit stamps + central
// reticle + wireframe grid floor + magenta key light + drag-to-orbit interaction.
const ThreeSceneHero = dynamic(
  () => import("@/components/three-scene-hero").then((m) => m.ThreeSceneHero),
  { ssr: false, loading: () => <div className="w-full aspect-square max-w-[560px] mx-auto" aria-hidden /> },
);

const stats = [
  { to: 267, label: "Checks per audit" },
  { to: 8, prefix: "<", suffix: "s", label: "Median run time" },
  { to: 5, label: "Specialist agents" },
];

export function Hero() {
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  // cursor parallax for badge
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const badgeX = useTransform(sx, (v) => v * 5);
  const badgeY = useTransform(sy, (v) => v * 5);

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = url.trim();
    if (!raw) {
      setError("Enter a URL to audit.");
      return;
    }
    let v = raw;
    if (!v.startsWith("http://") && !v.startsWith("https://")) {
      v = "https://" + v;
    }
    try {
      const u = new URL(v);
      if (!u.hostname.includes(".") || u.hostname.length < 4) {
        throw new Error("invalid host");
      }
    } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }
    setError(null);
    setSubmittedUrl(v);
    requestAnimationFrame(() => {
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const reset = () => {
    setSubmittedUrl(null);
    setUrl("");
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={onMove}
      className="relative pt-28 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-28 px-6 md:px-12 lg:px-16 overflow-hidden"
    >
      {/* editorial stage-light bg — warm radial from top-left + corner depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 55% at 12% -5%, rgb(255 94 26 / 0.10), transparent 60%),
            radial-gradient(ellipse 55% 45% at 100% 100%, rgb(26 22 18 / 0.07), transparent 60%)
          `,
        }}
      />

      {/* charcoal grid — visible enough to read as engineering paper */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(26 22 18 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(26 22 18 / 0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 50% 35%, black 30%, transparent 78%)",
        }}
      />

      {/* Floating audit-themed instrument cards — drift behind the hero,
          give cream stage real product density without fighting H1 / 3D scene */}
      <HeroFloatingCards />

      {/* Audited seal — small artifact near the bottom-left of hero, doesn't fight the dashboard widget */}
      <div className="hidden md:block absolute bottom-6 left-6 lg:bottom-10 lg:left-10 pointer-events-none opacity-50 hover:opacity-90 transition-opacity z-0 scale-75 lg:scale-100 motion-nano-drift-slow">
        <AuditedSeal />
      </div>

      {/* Live finding ticker — single big-motion card top-center, re-prints
          every ~4s. Heartbeat that says "this audit is RUNNING right now". */}
      <HeroLiveFinding className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 z-0" />

      <div className="relative w-full max-w-[1480px] mx-auto">
        {!submittedUrl ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* LEFT — copy + form */}
            <div className="flex flex-col items-start text-left">
              {/* eyebrow badge */}
              <motion.div
                style={{ x: badgeX, y: badgeY }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-accent)] bg-[color:var(--color-accent-soft)] px-3 py-1.5"
              >
                <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)]" />
                <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-accent)]">
                  AI auditors · live
                </span>
              </motion.div>

              {/* H1 */}
              <KineticHeading
                className="font-display font-extrabold mt-7 sm:mt-8 lg:mt-10 text-balance text-[clamp(40px,8.4vw,96px)] leading-[0.92] tracking-[-0.035em]"
                words={[
                  "Your website,",
                  "audited like an",
                  { italic: "expert" },
                  "would.",
                ]}
                delayBase={0.3}
              />

              {/* sub */}
              <FadeChildren delay={1.3}>
                <p className="mt-6 lg:mt-8 max-w-[560px] text-balance text-fg-muted text-[16px] sm:text-[17px] lg:text-[18.5px] leading-[1.6]">
                  Five AI auditors crawl your site in parallel — On-Page,
                  Technical, Content, Off-Site, and Competitor. Each finding is
                  written so a developer can ship the fix today, sourced from
                  Lighthouse, CrUX, and Search Console.
                </p>
              </FadeChildren>

              {/* URL input */}
              <FadeChildren delay={1.5} className="w-full max-w-[560px] mt-8 lg:mt-10">
                <form onSubmit={handleSubmit} noValidate>
                  <div
                    className={`group relative flex items-center rounded-lg border bg-[color:var(--color-surface)] shadow-[0_10px_36px_-16px_rgb(26_22_18_/_0.22),0_2px_4px_-1px_rgb(26_22_18_/_0.06)] transition-all ${
                      error
                        ? "border-[color:var(--color-crit)] shadow-[0_0_0_4px_rgb(185_28_28/_0.18)]"
                        : "border-[color:var(--color-border-strong)] focus-within:border-[color:var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-soft),0_12px_40px_-16px_rgb(255_94_26_/_0.30)]"
                    }`}
                  >
                    <span className="pl-3 sm:pl-4 pr-1.5 sm:pr-2 text-fg-faint font-mono text-[12px] sm:text-sm shrink-0">
                      https://
                    </span>
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="yourwebsite.com"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value.replace(/^https?:\/\//, ""));
                        if (error) setError(null);
                      }}
                      className="flex-1 min-w-0 bg-transparent py-3.5 sm:py-4 pr-2 sm:pr-3 text-[14px] sm:text-[15px] outline-none placeholder:text-fg-faint"
                      autoComplete="off"
                      spellCheck={false}
                      aria-label="Website URL"
                      aria-invalid={!!error}
                      aria-describedby={error ? "hero-url-error" : undefined}
                    />
                    <Magnetic
                      type="submit"
                      className="m-1 sm:m-1.5 inline-flex items-center gap-1.5 sm:gap-2 rounded-md bg-[color:var(--color-accent)] px-3 sm:px-5 py-2.5 sm:py-3 font-display text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)] focus-ring shadow-[0_10px_24px_-6px_rgb(255_94_26/_0.55),inset_0_1px_0_rgb(255_255_255/_0.22)] btn-tactile"
                    >
                      <Sparkle size={14} weight="fill" />
                      <span className="hidden sm:inline">Run audit</span>
                      <ArrowRight size={14} weight="bold" />
                    </Magnetic>
                  </div>
                  {error && (
                    <p
                      id="hero-url-error"
                      role="alert"
                      className="mt-2 font-mono text-[11px] tracking-[0.06em] text-[color:var(--color-crit)]"
                    >
                      {error}
                    </p>
                  )}
                </form>

                <div className="mt-4 sm:mt-5">
                  <LiveTicker />
                </div>
              </FadeChildren>

              {/* stats */}
              <FadeChildren delay={1.8} className="w-full max-w-[560px] mt-12 lg:mt-16">
                <div className="grid grid-cols-3 gap-x-5 sm:gap-x-6 gap-y-7">
                  {stats.map((s) => (
                    <div key={s.label} className="min-w-0">
                      <CountUp
                        to={s.to}
                        prefix={s.prefix ?? ""}
                        suffix={s.suffix ?? ""}
                        className="font-display font-extrabold text-[26px] sm:text-[30px] lg:text-[34px] leading-none text-fg tabular-nums whitespace-nowrap"
                      />
                      <div className="mt-2 font-mono text-[9.5px] sm:text-[10px] tracking-[0.14em] uppercase text-fg-muted leading-snug">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </FadeChildren>
            </div>

            {/* RIGHT — R3F 3D audit-stamps scene (lg+ only) */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <ThreeSceneHero />
            </div>
          </div>
        ) : (
          <InlineAudit url={submittedUrl} onReset={reset} />
        )}
      </div>
    </section>
  );
}

