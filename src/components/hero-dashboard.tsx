"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  Sparkle,
} from "@phosphor-icons/react";

type Tick = { label: string; value: string; status: "pass" | "warn" | "crit" };

const ticks: Tick[] = [
  { label: "HTTPS", value: "ok", status: "pass" },
  { label: "Title", value: "47 chars", status: "pass" },
  { label: "Meta desc", value: "154 chars", status: "pass" },
  { label: "H1 count", value: "1", status: "pass" },
  { label: "Load time", value: "2.4s", status: "warn" },
  { label: "Canonical", value: "missing", status: "crit" },
  { label: "OG tags", value: "complete", status: "pass" },
  { label: "Alt-text", value: "94%", status: "warn" },
  { label: "JSON-LD", value: "4 types", status: "pass" },
  { label: "Sitemap", value: "247 urls", status: "pass" },
];

const findings = [
  {
    sev: "crit" as const,
    title: "Canonical missing on /blog/* routes",
    cat: "technical",
  },
  {
    sev: "warn" as const,
    title: "LCP 2.4s — compress hero image",
    cat: "performance",
  },
  {
    sev: "pass" as const,
    title: "Schema.org Organization detected",
    cat: "technical",
  },
];

export function HeroDashboard() {
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tickIdx, setTickIdx] = useState(0);
  const [findingIdx, setFindingIdx] = useState(0);

  useEffect(() => {
    let s = 0;
    const id = setInterval(() => {
      s += 1;
      if (s > 87) {
        clearInterval(id);
        setScore(87);
        return;
      }
      setScore(s);
    }, 28);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 6));
    }, 220);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTickIdx((i) => (i + 1) % ticks.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFindingIdx((i) => (i + 1) % findings.length);
    }, 2700);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.85, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[460px] mx-auto"
    >
      {/* main card */}
      <div className="relative rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden shadow-[0_1px_0_rgb(255_255_255/_0.7)_inset,0_24px_56px_-24px_rgb(26_22_18/_0.18)]">
        {/* terminal bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-fg-muted">
            crawliq · live audit
          </span>
          <span className="ml-auto inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
        </div>

        {/* score header */}
        <div className="p-6 pb-5 border-b border-[color:var(--color-border)]">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-muted">
                example.com
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display font-extrabold text-[64px] leading-none tabular-nums">
                  {score}
                </span>
                <span className="font-mono text-[14px] text-fg-faint">/100</span>
              </div>
              <div className="mt-1 font-mono text-[10.5px] tracking-[0.16em] uppercase text-[color:var(--color-accent)]">
                Grade B+
              </div>
            </div>
            {/* ring */}
            <div className="relative w-[72px] h-[72px]">
              <svg
                width="72"
                height="72"
                viewBox="0 0 72 72"
                className="-rotate-90"
              >
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="rgb(26 22 18 / 0.10)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="var(--color-accent)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - score / 100)}
                  style={{ transition: "stroke-dashoffset 80ms linear" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <Sparkle
                  size={18}
                  weight="fill"
                  className="text-[color:var(--color-accent)]"
                />
              </div>
            </div>
          </div>

          {/* progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-fg-muted mb-1.5">
              <span>analyzing signals</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-[color:var(--color-bg-3)] overflow-hidden">
              <div
                className="h-full bg-[color:var(--color-accent)] transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* live tick row */}
        <div className="px-6 py-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-muted">
              checking
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tickIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 font-mono text-[12px]"
              >
                <StatusDot status={ticks[tickIdx].status} />
                <span className="text-fg">{ticks[tickIdx].label}</span>
                <span className="text-fg-faint">·</span>
                <span
                  className="font-bold tabular-nums"
                  style={{
                    color:
                      ticks[tickIdx].status === "pass"
                        ? "var(--color-pass)"
                        : ticks[tickIdx].status === "warn"
                          ? "var(--color-warn)"
                          : "var(--color-crit)",
                  }}
                >
                  {ticks[tickIdx].value}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* finding card */}
        <div className="p-6">
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-muted mb-3">
            Top finding
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={findingIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32 }}
              className="rounded-lg border p-4 flex items-start gap-3"
              style={{
                backgroundColor:
                  findings[findingIdx].sev === "pass"
                    ? "var(--color-pass-bg)"
                    : findings[findingIdx].sev === "warn"
                      ? "var(--color-warn-bg)"
                      : "var(--color-crit-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <SevIcon sev={findings[findingIdx].sev} />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium leading-snug mb-1">
                  {findings[findingIdx].title}
                </div>
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                  {findings[findingIdx].cat}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* floating tag bottom-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="hidden lg:flex absolute -bottom-5 -left-5 items-center gap-2 rounded-full bg-[color:var(--color-fg)] text-[color:var(--color-bg)] pl-2.5 pr-4 py-2 shadow-[0_12px_32px_-12px_rgb(26_22_18/_0.32)]"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
          7.4s · complete
        </span>
      </motion.div>

      {/* floating mini card top-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="hidden lg:block absolute -top-6 -right-6 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3.5 shadow-[0_12px_32px_-12px_rgb(26_22_18/_0.24)]"
      >
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-fg-muted mb-1.5">
          Critical
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-[22px] leading-none text-[color:var(--color-crit)] tabular-nums">
            3
          </span>
          <span className="font-mono text-[10px] text-fg-muted">issues</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatusDot({ status }: { status: "pass" | "warn" | "crit" }) {
  const color =
    status === "pass"
      ? "var(--color-pass)"
      : status === "warn"
        ? "var(--color-warn)"
        : "var(--color-crit)";
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function SevIcon({ sev }: { sev: "pass" | "warn" | "crit" }) {
  const map = {
    pass: { Icon: CheckCircle, color: "var(--color-pass)" },
    warn: { Icon: WarningCircle, color: "var(--color-warn)" },
    crit: { Icon: XCircle, color: "var(--color-crit)" },
  } as const;
  const Icon = map[sev].Icon;
  return (
    <Icon
      size={18}
      weight="fill"
      style={{ color: map[sev].color, flexShrink: 0, marginTop: 2 }}
    />
  );
}
