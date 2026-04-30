"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { KineticHeading, FadeChildren } from "@/components/kinetic-heading";
import { LiveTicker } from "@/components/live-ticker";
import { CountUp } from "@/components/count-up";
import { InlineAudit } from "@/components/inline-audit";

const Globe3D = dynamic(
  () => import("@/components/globe-3d").then((m) => m.Globe3D),
  { ssr: false, loading: () => null },
);

const stats = [
  { to: 240, suffix: "+", label: "Signals checked per audit" },
  { to: 8, prefix: "<", suffix: "s", label: "Median audit time" },
  { to: 5, label: "AI auditor specialists" },
  { to: 98, suffix: "%", label: "Issue detection rate" },
];

export function Hero() {
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const heroRef = useRef<HTMLElement>(null);

  // cursor parallax — drives a small offset, used by globe + badge
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const globeX = useTransform(sx, (v) => v * 18);
  const globeY = useTransform(sy, (v) => v * 18);
  const badgeX = useTransform(sx, (v) => v * 6);
  const badgeY = useTransform(sy, (v) => v * 6);

  const onMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px);
    my.set(py);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let v = url.trim();
    if (!v.startsWith("http://") && !v.startsWith("https://")) {
      v = "https://" + v;
    }
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
      className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-32 pb-20 px-5 md:px-8 overflow-hidden"
    >
      {/* 3D wireframe globe — top-right ambient anchor */}
      <motion.div
        style={{ x: globeX, y: globeY }}
        className="pointer-events-none absolute -top-24 -right-32 md:top-12 md:right-8 w-[420px] h-[420px] md:w-[520px] md:h-[520px] opacity-[0.55]"
      >
        <Globe3D className="w-full h-full" />
      </motion.div>

      {/* faint grid behind text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(29 29 31 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(29 29 31 / 0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 35%, black 30%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[1200px] mx-auto flex flex-col items-center">
        {!submittedUrl ? (
          <>
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

            {/* kinetic H1 */}
            <KineticHeading
              className="font-display font-extrabold mt-8 text-balance text-center text-[clamp(46px,7vw,108px)] leading-[0.92] tracking-[-0.035em] max-w-[1100px]"
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
              <p className="mt-7 max-w-[640px] text-center text-balance text-fg-muted text-[17px] md:text-[19px] leading-[1.55]">
                Five AI auditors crawl your site in parallel — On-Page,
                Technical, Content, Off-Site, and Competitor. They explain
                exactly what&rsquo;s broken, why it matters, and how to fix it.
                No checklists. No fluff.
              </p>
            </FadeChildren>

            {/* URL input */}
            <FadeChildren delay={1.5} className="w-full max-w-[660px] mt-10">
              <form onSubmit={handleSubmit}>
                <div className="group relative flex items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] focus-within:border-[color:var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)] transition-all">
                  <span className="pl-4 pr-2 text-fg-faint font-mono text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    placeholder="yourwebsite.com"
                    value={url}
                    onChange={(e) =>
                      setUrl(e.target.value.replace(/^https?:\/\//, ""))
                    }
                    className="flex-1 bg-transparent py-4 pr-3 text-[15px] outline-none placeholder:text-fg-faint"
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Website URL"
                  />
                  <button
                    type="submit"
                    className="btn-tactile m-1.5 inline-flex items-center gap-2 rounded-[6px] bg-[color:var(--color-accent)] px-5 py-3 font-display text-[13px] font-bold uppercase tracking-wide text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)] focus-ring shadow-[0_4px_14px_-4px_rgb(0_102_255/_0.4)]"
                  >
                    <Sparkle size={14} weight="fill" />
                    Run audit
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
              </form>

              {/* live ticker beneath input */}
              <div className="mt-5 flex justify-center">
                <LiveTicker />
              </div>
            </FadeChildren>

            {/* stats */}
            <FadeChildren delay={1.8}>
              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-16 gap-y-9 max-w-3xl">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <CountUp
                      to={s.to}
                      prefix={s.prefix ?? ""}
                      suffix={s.suffix ?? ""}
                      className="font-display font-extrabold text-[36px] md:text-[42px] leading-none text-fg tabular-nums"
                    />
                    <div className="mt-2.5 font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeChildren>

            {/* scroll indicator */}
            <FadeChildren
              delay={2.1}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
            >
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-faint">
                Scroll
              </span>
              <span className="block w-[20px] h-[30px] rounded-full border border-[color:var(--color-border-strong)] flex items-start justify-center pt-1.5">
                <span className="scroll-dot block w-[3px] h-[6px] rounded-full bg-[color:var(--color-accent)]" />
              </span>
            </FadeChildren>
          </>
        ) : (
          <InlineAudit url={submittedUrl} onReset={reset} />
        )}
      </div>
    </section>
  );
}
