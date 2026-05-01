"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { KineticHeading, FadeChildren } from "@/components/kinetic-heading";
import { LiveTicker } from "@/components/live-ticker";
import { CountUp } from "@/components/count-up";
import { InlineAudit } from "@/components/inline-audit";
import { HeroDashboard } from "@/components/hero-dashboard";
import { Magnetic } from "@/components/magnetic";

const stats = [
  { to: 240, suffix: "+", label: "Signals checked" },
  { to: 8, prefix: "<", suffix: "s", label: "Median audit" },
  { to: 5, label: "AI auditors" },
  { to: 98, suffix: "%", label: "Detection rate" },
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
      className="relative pt-28 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-28 px-5 md:px-8 overflow-hidden"
    >
      {/* mesh gradient bg — radial cobalt + slate, very faint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 15% 0%, rgb(0 102 255 / 0.06), transparent 60%),
            radial-gradient(ellipse 50% 40% at 100% 100%, rgb(0 102 255 / 0.04), transparent 60%)
          `,
        }}
      />

      {/* faint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(29 29 31 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(29 29 31 / 0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 50% 35%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative w-full max-w-[1320px] mx-auto">
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
                  "audited",
                  { italic: "like an" },
                  { italic: "expert" },
                  "would.",
                ]}
                delayBase={0.3}
              />

              {/* sub */}
              <FadeChildren delay={1.3}>
                <p className="mt-6 lg:mt-8 max-w-[560px] text-balance text-fg-muted text-[16px] sm:text-[17px] lg:text-[18.5px] leading-[1.6]">
                  Five AI auditors crawl your site in parallel — On-Page,
                  Technical, Content, Off-Site, and Competitor. They explain
                  exactly what&rsquo;s broken, why it matters, and how to fix
                  it. No checklists. No fluff.
                </p>
              </FadeChildren>

              {/* URL input */}
              <FadeChildren delay={1.5} className="w-full max-w-[560px] mt-8 lg:mt-10">
                <form onSubmit={handleSubmit} noValidate>
                  <div
                    className={`group relative flex items-center rounded-md border bg-[color:var(--color-surface)] transition-all ${
                      error
                        ? "border-[color:var(--color-crit)] shadow-[0_0_0_4px_rgb(239_68_68/_0.18)]"
                        : "border-[color:var(--color-border-strong)] focus-within:border-[color:var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]"
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
                      className="m-1 sm:m-1.5 inline-flex items-center gap-1.5 sm:gap-2 rounded-[6px] bg-[color:var(--color-accent)] px-3 sm:px-5 py-2.5 sm:py-3 font-display text-[12px] sm:text-[13px] font-bold uppercase tracking-wide text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)] focus-ring shadow-[0_4px_14px_-4px_rgb(0_102_255/_0.4)] btn-tactile"
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-7">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <CountUp
                        to={s.to}
                        prefix={s.prefix ?? ""}
                        suffix={s.suffix ?? ""}
                        className="font-display font-extrabold text-[28px] sm:text-[30px] lg:text-[34px] leading-none text-fg tabular-nums"
                      />
                      <div className="mt-2 font-mono text-[9.5px] sm:text-[10px] tracking-[0.16em] uppercase text-fg-muted">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </FadeChildren>
            </div>

            {/* RIGHT — audit dashboard widget (lg+ only) */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <HeroDashboard />
            </div>
          </div>
        ) : (
          <InlineAudit url={submittedUrl} onReset={reset} />
        )}
      </div>
    </section>
  );
}

