"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  ArrowRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { CrawlSignals, Finding } from "@/lib/audit";

type Phase = "idle" | "crawling" | "analyzing" | "done" | "error";

type AuditPayload = {
  score: number;
  grade: string;
  summary: string;
  findings: Finding[];
  quickWins: string[];
};

export function InlineAudit({
  url,
  onReset,
}: {
  url: string;
  onReset: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [signals, setSignals] = useState<CrawlSignals | null>(null);
  const [parsed, setParsed] = useState<AuditPayload | null>(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    void run(url, ctrl);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  async function run(target: string, controller: AbortController) {
    setSignals(null);
    setParsed(null);
    setRaw("");
    setError(null);
    setPhase("crawling");
    setStatusMessage(`Fetching ${target}`);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target.trim() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => null);
        setError(errBody?.error ?? `Request failed (${res.status})`);
        setPhase("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const blocks = buf.split("\n\n");
        buf = blocks.pop() ?? "";
        for (const b of blocks) {
          const t = b.trim();
          if (!t.startsWith("data:")) continue;
          try {
            const ev = JSON.parse(t.slice(5).trim());
            applyEvent(ev);
          } catch {
            /* ignore malformed */
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setPhase("error");
    }
  }

  function applyEvent(ev: {
    type: string;
    phase?: Phase;
    message?: string;
    signals?: CrawlSignals;
    chunk?: string;
    raw?: string;
  }) {
    if (ev.type === "status" && ev.phase) {
      setPhase(ev.phase);
      if (ev.message) setStatusMessage(ev.message);
    } else if (ev.type === "signals" && ev.signals) {
      setSignals(ev.signals);
    } else if (ev.type === "delta" && ev.chunk) {
      setRaw((p) => p + ev.chunk);
    } else if (ev.type === "result" && ev.raw) {
      try {
        setParsed(JSON.parse(ev.raw) as AuditPayload);
      } catch {
        /* leave raw stream */
      }
    } else if (ev.type === "error" && ev.message) {
      setError(ev.message);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1080px] mx-auto"
    >
      {/* status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <PhaseBadge phase={phase} />
          <span className="font-mono text-[12px] text-fg-muted truncate max-w-[480px]">
            {error ?? statusMessage}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-fg transition-colors"
        >
          ← Audit another site
        </button>
      </div>

      {/* main panel */}
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden shadow-[0_1px_0_rgb(255_255_255/_0.6)_inset,0_24px_48px_-24px_rgb(26_22_18/_0.16)]">
        {/* terminal bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[12px] text-fg-muted truncate">
            crawliq · {url}
          </span>
          {parsed && (
            <a
              href={`/audit?url=${encodeURIComponent(url)}`}
              className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--color-accent)] hover:underline"
            >
              Open full report <ArrowRight size={12} weight="bold" />
            </a>
          )}
        </div>

        {/* content */}
        <div className="p-6 md:p-8">
          {!signals && phase !== "error" && (
            <CrawlingState />
          )}
          {signals && (
            <SignalsGrid signals={signals} compact />
          )}
          {(raw || parsed) && (
            <div className="mt-7 pt-7 border-t border-[color:var(--color-border)]">
              {parsed ? (
                <ParsedView parsed={parsed} />
              ) : (
                <StreamingView raw={raw} />
              )}
            </div>
          )}
          {phase === "error" && (
            <ErrorView message={error ?? statusMessage} onReset={onReset} />
          )}
        </div>
      </div>
    </motion.section>
  );
}

function PhaseBadge({ phase }: { phase: Phase }) {
  const map: Record<
    Phase,
    { label: string; color: string; bg: string; dot: boolean }
  > = {
    idle: { label: "—", color: "var(--color-fg-muted)", bg: "transparent", dot: false },
    crawling: {
      label: "01 / Crawling",
      color: "var(--color-accent)",
      bg: "var(--color-accent-soft)",
      dot: true,
    },
    analyzing: {
      label: "02 / Analyzing",
      color: "var(--color-accent)",
      bg: "var(--color-accent-soft)",
      dot: true,
    },
    done: {
      label: "✓ Complete",
      color: "var(--color-pass)",
      bg: "var(--color-pass-bg)",
      dot: false,
    },
    error: {
      label: "✗ Failed",
      color: "var(--color-crit)",
      bg: "var(--color-crit-bg)",
      dot: false,
    },
  };
  const v = map[phase];
  return (
    <span
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full font-mono text-[10.5px] tracking-[0.14em] uppercase"
      style={{ color: v.color, backgroundColor: v.bg }}
    >
      {v.dot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full pulse-dot"
          style={{ backgroundColor: v.color }}
        />
      )}
      {v.label}
    </span>
  );
}

function CrawlingState() {
  return (
    <div className="space-y-3">
      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted mb-2">
        Reading HTML…
      </div>
      <div className="scan-line w-[92%]" />
      <div className="scan-line w-[78%]" style={{ animationDelay: "0.2s" }} />
      <div className="scan-line w-[64%]" style={{ animationDelay: "0.4s" }} />
      <div className="scan-line w-[88%]" style={{ animationDelay: "0.6s" }} />
    </div>
  );
}

function SignalsGrid({
  signals,
  compact = false,
}: {
  signals: CrawlSignals;
  compact?: boolean;
}) {
  const items = [
    {
      label: "HTTP",
      value: String(signals.status),
      ok: signals.status >= 200 && signals.status < 300,
    },
    { label: "HTTPS", value: signals.hasHttps ? "yes" : "no", ok: signals.hasHttps },
    {
      label: "Load",
      value: `${signals.loadTimeMs}ms`,
      ok: signals.loadTimeMs < 1500,
    },
    {
      label: "Title",
      value: signals.title ? `${signals.titleLength}c` : "miss",
      ok: !!signals.title && signals.titleLength <= 60,
    },
    {
      label: "Meta",
      value: signals.metaDescription ? `${signals.metaDescriptionLength}c` : "miss",
      ok: !!signals.metaDescription,
    },
    { label: "H1", value: String(signals.h1.length), ok: signals.h1.length === 1 },
    {
      label: "Imgs",
      value: `${signals.imageCount}/${signals.imagesMissingAlt}`,
      ok: signals.imagesMissingAlt === 0,
    },
    {
      label: "OG",
      value: signals.hasOpenGraph ? "yes" : "no",
      ok: signals.hasOpenGraph,
    },
  ];
  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted mb-3">
        Crawl signals · {(signals.byteSize / 1024).toFixed(0)} KB · {signals.wordCount} words
      </div>
      <div
        className={cn(
          "grid gap-px bg-[color:var(--color-border)] rounded-lg overflow-hidden border border-[color:var(--color-border)]",
          compact
            ? "grid-cols-4 md:grid-cols-8"
            : "grid-cols-2 md:grid-cols-4",
        )}
      >
        {items.map((it) => (
          <div
            key={it.label}
            className="bg-[color:var(--color-surface)] px-3 py-3"
          >
            <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-fg-faint">
              {it.label}
            </div>
            <div
              className="mt-1 font-mono text-[14px] font-bold tabular-nums"
              style={{
                color: it.ok ? "var(--color-pass)" : "var(--color-fg)",
              }}
            >
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreamingView({ raw }: { raw: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted mb-3">
        AI auditor analysis · streaming
      </div>
      <pre className="font-mono text-[12.5px] leading-[1.7] text-fg whitespace-pre-wrap break-words opacity-80 max-h-[280px] overflow-auto">
        {raw || "…"}
      </pre>
    </div>
  );
}

function ParsedView({ parsed }: { parsed: AuditPayload }) {
  const counts = {
    crit: parsed.findings.filter((f) => f.severity === "critical").length,
    warn: parsed.findings.filter((f) => f.severity === "warning").length,
    pass: parsed.findings.filter((f) => f.severity === "pass").length,
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-7">
      <aside>
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted">
          Score
        </div>
        <div className="mt-1 font-display font-extrabold text-[60px] leading-none tabular-nums">
          {parsed.score}
          <span className="text-fg-faint text-[22px] font-normal">/100</span>
        </div>
        <div className="mt-1 font-mono text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
          Grade {parsed.grade}
        </div>
        <p className="mt-5 text-[13.5px] leading-[1.6] text-fg-muted">
          {parsed.summary}
        </p>
        <div className="mt-6 pt-5 border-t border-[color:var(--color-border)] grid grid-cols-3 gap-3">
          <Tally label="Critical" value={counts.crit} status="crit" />
          <Tally label="Warning" value={counts.warn} status="warn" />
          <Tally label="Passing" value={counts.pass} status="pass" />
        </div>
        {parsed.quickWins?.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[color:var(--color-border)]">
            <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-faint mb-3">
              Quick wins
            </div>
            <ul className="flex flex-col gap-2">
              {parsed.quickWins.slice(0, 4).map((qw, i) => (
                <li key={i} className="text-[13px] leading-[1.55] text-fg">
                  → {qw}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence>
          {parsed.findings.slice(0, 8).map((f, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="rounded-lg border p-5 flex gap-3.5 items-start"
              style={{
                backgroundColor:
                  f.severity === "critical"
                    ? "var(--color-crit-bg)"
                    : f.severity === "warning"
                      ? "var(--color-warn-bg)"
                      : "var(--color-pass-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <SevIcon severity={f.severity} />
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <span
                    className="font-mono text-[10px] tracking-[0.16em] uppercase font-bold"
                    style={{
                      color:
                        f.severity === "critical"
                          ? "var(--color-crit)"
                          : f.severity === "warning"
                            ? "var(--color-warn)"
                            : "var(--color-pass)",
                    }}
                  >
                    {f.severity}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-fg-faint">
                    {f.category}
                  </span>
                </div>
                <h3 className="font-display font-bold text-[15px] mb-1.5 leading-snug">
                  {f.title}
                </h3>
                <p className="text-[13px] leading-[1.6] text-fg-muted">
                  {f.detail}
                </p>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ErrorView({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="flex items-start gap-4 p-2">
      <XCircle
        size={22}
        weight="fill"
        style={{ color: "var(--color-crit)" }}
      />
      <div className="flex-1">
        <div className="font-display font-bold text-[15px] mb-1">
          Couldn&rsquo;t reach that URL
        </div>
        <p className="text-[13.5px] text-fg-muted leading-[1.6]">{message}</p>
        <button
          onClick={onReset}
          type="button"
          className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-[color:var(--color-accent)] hover:underline"
        >
          Try another URL <ArrowRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function SevIcon({
  severity,
}: {
  severity: "critical" | "warning" | "pass";
}) {
  const map = {
    critical: { Icon: XCircle, color: "var(--color-crit)" },
    warning: { Icon: WarningCircle, color: "var(--color-warn)" },
    pass: { Icon: CheckCircle, color: "var(--color-pass)" },
  } as const;
  const m = map[severity] ?? map.warning;
  const Icon = m.Icon;
  return <Icon size={18} weight="fill" style={{ color: m.color }} />;
}

function Tally({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: "pass" | "warn" | "crit";
}) {
  const color =
    status === "pass"
      ? "var(--color-pass)"
      : status === "warn"
        ? "var(--color-warn)"
        : "var(--color-crit)";
  return (
    <div>
      <div
        className="font-display font-extrabold text-[20px] leading-none tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
        {label}
      </div>
    </div>
  );
}
