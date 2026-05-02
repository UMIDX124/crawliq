"use client";

/**
 * Hero floating audit-themed cards.
 *
 * Renders 8 small "instrument readouts" (finding chips, score badges,
 * severity dots, HTTP codes, crawl signals) that drift slowly behind the
 * hero text — gives the cream stage real product-instrument density
 * without competing with the H1 / 3D scene.
 *
 * Motion budget per card:
 *   - nano: 4-7px Y drift on a 14-22s loop, slight rotate (±0.6deg)
 *   - micro: opacity 0.55 → 0.95 pulse on a 6-9s loop
 *   - big (one card only): the "live finding" that re-prints every 4s
 *
 * Pointer-events disabled so the form & 3D scene stay interactive.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle,
  Warning,
  XCircle,
  Lightning,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
} from "@phosphor-icons/react";

type FloatCard =
  | { kind: "score"; pillar: string; score: number; trend: "up" | "down" }
  | { kind: "finding"; severity: "pass" | "warn" | "crit"; label: string; detail: string }
  | { kind: "status"; code: number; path: string }
  | { kind: "metric"; label: string; value: string; status: "pass" | "warn" | "crit" }
  | { kind: "signal"; label: string; state: "set" | "missing" };

const CARDS: Array<{
  card: FloatCard;
  // position percentages relative to the hero box.
  // Right side > 60% intentionally avoided where the 3D scene lives — only
  // small chips peek into that zone. Left/center/bottom densify the text
  // half so the page reads as an "instrument panel", not an empty stage.
  x: string;
  y: string;
  // animation timing
  drift: number;
  pulse: number;
  rotate: number;
  delay: number;
  scale?: number;
}> = [
  // top band — frame the H1 with two micro readouts
  {
    card: { kind: "status", code: 200, path: "/—" },
    x: "3%", y: "12%", drift: 14, pulse: 9, rotate: 0.6, delay: 0.2,
    scale: 0.95,
  },
  {
    card: { kind: "signal", label: "canonical", state: "set" },
    x: "44%", y: "6%", drift: 12, pulse: 7, rotate: -0.8, delay: 0.6,
    scale: 0.95,
  },
  // mid-left — sits next to the H1 verb, becomes part of typography
  {
    card: { kind: "score", pillar: "On-Page", score: 87, trend: "up" },
    x: "1%", y: "38%", drift: 16, pulse: 7, rotate: -1.2, delay: 1.0,
  },
  {
    card: { kind: "metric", label: "LCP", value: "1.4s", status: "pass" },
    x: "48%", y: "30%", drift: 12, pulse: 6, rotate: -0.4, delay: 1.4,
  },
  // bottom-left — drift below the URL form (after content scrolls past, the
  // form is centered at ~y:75% on lg screens; cards at y:88% peek under)
  {
    card: { kind: "finding", severity: "crit", label: "H1 missing", detail: "sample page" },
    x: "2%", y: "66%", drift: 14, pulse: 8, rotate: 0.8, delay: 1.8,
  },
  {
    card: { kind: "finding", severity: "warn", label: "Alt-text gap", detail: "image scan" },
    x: "44%", y: "88%", drift: 18, pulse: 7, rotate: -1.0, delay: 2.2,
  },
  // mid-right edge — small chips that peek next to the 3D scene without
  // overlapping its dense zone (kept under x:78% area)
  {
    card: { kind: "metric", label: "CLS", value: "0.04", status: "pass" },
    x: "70%", y: "10%", drift: 14, pulse: 6, rotate: 0.6, delay: 2.6,
    scale: 0.92,
  },
  {
    card: { kind: "signal", label: "schema.org", state: "set" },
    x: "76%", y: "92%", drift: 16, pulse: 8, rotate: 1.0, delay: 3.0,
    scale: 0.92,
  },
];

export function HeroFloatingCards() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden hidden md:block" aria-hidden>
      {CARDS.map((c, i) => (
        <motion.div
          key={i}
          className="absolute will-change-transform"
          style={{ left: c.x, top: c.y, scale: c.scale ?? 1 }}
          initial={{ opacity: 0, y: 14, rotate: c.rotate }}
          animate={
            reduce
              ? { opacity: 0.85, y: 0, rotate: c.rotate }
              : {
                  opacity: [0.78, 1, 0.78],
                  y: [0, -c.drift, 0],
                  rotate: [c.rotate, c.rotate * 0.4, c.rotate],
                }
          }
          transition={{
            duration: c.pulse * 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: c.delay,
          }}
        >
          <FloatingCardRender card={c.card} />
        </motion.div>
      ))}
    </div>
  );
}

function FloatingCardRender({ card }: { card: FloatCard }) {
  switch (card.kind) {
    case "score":
      return <ScoreChip pillar={card.pillar} score={card.score} trend={card.trend} />;
    case "finding":
      return <FindingCard severity={card.severity} label={card.label} detail={card.detail} />;
    case "status":
      return <StatusCode code={card.code} path={card.path} />;
    case "metric":
      return <MetricChip label={card.label} value={card.value} status={card.status} />;
    case "signal":
      return <SignalChip label={card.label} state={card.state} />;
  }
}

const layeredShadow =
  "shadow-[0_1px_0_0_rgb(255_255_255_/_0.55)_inset,0_1px_2px_-1px_rgb(26_22_18_/_0.05),0_8px_16px_-6px_rgb(26_22_18_/_0.10),0_24px_48px_-18px_rgb(26_22_18_/_0.16)]";

function ScoreChip({ pillar, score, trend }: { pillar: string; score: number; trend: "up" | "down" }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] backdrop-blur-sm pl-3 pr-4 py-2.5 ${layeredShadow}`}
    >
      <div className="font-display font-extrabold text-[26px] leading-none tabular-nums text-[color:var(--color-fg)]">
        {score}
      </div>
      <div className="leading-tight">
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-fg-faint">
          {pillar}
        </div>
        <div className="flex items-center gap-1 font-mono text-[9.5px] tracking-[0.14em] uppercase text-[color:var(--color-pass)]">
          <span className="inline-block">▲</span>
          <span>+{trend === "up" ? 6 : 4}</span>
        </div>
      </div>
    </div>
  );
}

function FindingCard({
  severity,
  label,
  detail,
}: {
  severity: "pass" | "warn" | "crit";
  label: string;
  detail: string;
}) {
  const Icon = severity === "pass" ? CheckCircle : severity === "warn" ? Warning : XCircle;
  const colorVar =
    severity === "pass"
      ? "var(--color-pass)"
      : severity === "warn"
        ? "var(--color-warn)"
        : "var(--color-crit)";
  const bgVar =
    severity === "pass"
      ? "var(--color-pass-bg)"
      : severity === "warn"
        ? "var(--color-warn-bg)"
        : "var(--color-crit-bg)";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] backdrop-blur-sm px-3 py-2 ${layeredShadow}`}
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-md"
        style={{ background: bgVar, color: colorVar }}
      >
        <Icon size={13} weight="bold" />
      </span>
      <div className="leading-tight">
        <div className="font-display font-bold text-[12px] text-[color:var(--color-fg)]">
          {label}
        </div>
        <div className="font-mono text-[9.5px] tracking-[0.06em] text-fg-faint truncate max-w-[140px]">
          {detail}
        </div>
      </div>
    </div>
  );
}

function StatusCode({ code, path }: { code: number; path: string }) {
  const isOk = code >= 200 && code < 300;
  const isRedirect = code >= 300 && code < 400;
  const colorVar = isOk
    ? "var(--color-pass)"
    : isRedirect
      ? "var(--color-warn)"
      : "var(--color-crit)";

  return (
    <div
      className={`flex items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] backdrop-blur-sm px-2.5 py-1.5 ${layeredShadow}`}
    >
      <span
        className="font-mono font-bold text-[11px] tabular-nums tracking-[0.04em]"
        style={{ color: colorVar }}
      >
        {code}
      </span>
      <span className="font-mono text-[10px] tracking-[0.04em] text-fg-muted truncate max-w-[120px]">
        {path}
      </span>
    </div>
  );
}

function MetricChip({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "pass" | "warn" | "crit";
}) {
  const colorVar =
    status === "pass"
      ? "var(--color-pass)"
      : status === "warn"
        ? "var(--color-warn)"
        : "var(--color-crit)";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] backdrop-blur-sm px-3 py-2 ${layeredShadow}`}
    >
      <Lightning size={12} weight="fill" style={{ color: colorVar }} />
      <span className="font-mono text-[9.5px] tracking-[0.18em] uppercase text-fg-faint">
        {label}
      </span>
      <span className="font-display font-extrabold text-[13px] tabular-nums text-[color:var(--color-fg)]">
        {value}
      </span>
    </div>
  );
}

function SignalChip({ label, state }: { label: string; state: "set" | "missing" }) {
  const isSet = state === "set";
  const colorVar = isSet ? "var(--color-pass)" : "var(--color-crit)";

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] backdrop-blur-sm px-3 py-1.5 ${layeredShadow}`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full pulse-dot"
        style={{ background: colorVar }}
      />
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-muted">
        {label}
      </span>
      <span
        className="font-mono text-[9.5px] tracking-[0.14em] uppercase font-bold"
        style={{ color: colorVar }}
      >
        {isSet ? "set" : "missing"}
      </span>
    </div>
  );
}

/**
 * "Live finding" big-motion card — single one near top center, re-prints
 * a new finding every ~4s with a flip-card transition. Adds the heartbeat
 * that says "this audit is RUNNING right now".
 */
export function HeroLiveFinding({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % LIVE_TICKS.length), 4200);
    return () => clearInterval(id);
  }, [reduce]);

  const tick = LIVE_TICKS[idx];

  return (
    <div className={`pointer-events-none ${className ?? ""}`} aria-hidden>
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center gap-3 rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] backdrop-blur-md pl-3 pr-4 py-2.5 ${layeredShadow}`}
      >
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0"
          style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
        >
          <tick.Icon size={13} weight="bold" />
        </span>
        <div className="leading-tight min-w-0">
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-fg-faint mb-0.5">
            demo · pass {String(idx + 1).padStart(2, "0")} / {String(LIVE_TICKS.length).padStart(2, "0")}
          </div>
          <div className="font-display font-bold text-[12.5px] text-[color:var(--color-fg)] truncate">
            {tick.label}
          </div>
        </div>
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot shrink-0 ml-1"
        />
      </motion.div>
    </div>
  );
}

const LIVE_TICKS = [
  { Icon: ImageIcon, label: "scanning image alt-text" },
  { Icon: LinkIcon, label: "checking internal links" },
  { Icon: Code, label: "parsing JSON-LD schema" },
  { Icon: Lightning, label: "measuring Core Web Vitals" },
  { Icon: Warning, label: "validating meta tags" },
  { Icon: CheckCircle, label: "verifying canonical tags" },
];
