"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Sparkle,
  WarningCircle,
  XCircle,
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

export function AuditClient({ initialUrl }: { initialUrl: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [phase, setPhase] = useState<Phase>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [signals, setSignals] = useState<CrawlSignals | null>(null);
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<AuditPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (target: string) => {
      if (!target.trim()) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setSignals(null);
      setRaw("");
      setParsed(null);
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
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const block of events) {
            const trimmed = block.trim();
            if (!trimmed.startsWith("data:")) continue;
            const json = trimmed.slice(5).trim();
            try {
              const ev = JSON.parse(json);
              applyEvent(ev);
            } catch {
              /* ignore malformed event */
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
        setPhase("error");
      }
    },
    [],
  );

  const applyEvent = useCallback(
    (ev: {
      type: string;
      phase?: Phase;
      message?: string;
      signals?: CrawlSignals;
      chunk?: string;
      raw?: string;
    }) => {
      if (ev.type === "status" && ev.phase) {
        setPhase(ev.phase);
        if (ev.message) setStatusMessage(ev.message);
      } else if (ev.type === "signals" && ev.signals) {
        setSignals(ev.signals);
      } else if (ev.type === "delta" && ev.chunk) {
        setRaw((prev) => prev + ev.chunk);
      } else if (ev.type === "result" && ev.raw) {
        try {
          const obj = JSON.parse(ev.raw) as AuditPayload;
          setParsed(obj);
        } catch {
          /* leave raw on screen */
        }
      } else if (ev.type === "error" && ev.message) {
        setError(ev.message);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialUrl) {
      void start(initialUrl);
    }
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    router.replace(`/audit?url=${encodeURIComponent(url.trim())}`);
    void start(url.trim());
  };

  return (
    <div className="container-page">
      {/* URL input */}
      <form onSubmit={submit} className="max-w-[680px]">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted mb-3 flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
          Live audit
        </div>
        <h1 className="font-display font-extrabold text-[clamp(36px,5vw,60px)] leading-[0.95] tracking-tight text-balance">
          {phase === "done" ? (
            <>
              Audit complete.{" "}
              <span className="text-fg-muted italic font-normal">
                Read the findings.
              </span>
            </>
          ) : phase === "error" ? (
            <>
              Couldn&rsquo;t reach that URL.{" "}
              <span className="text-fg-muted italic font-normal">
                Try another.
              </span>
            </>
          ) : (
            <>
              Auditing{" "}
              <span className="text-fg-muted italic font-normal">
                in real time…
              </span>
            </>
          )}
        </h1>

        <div className="mt-8 flex items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] focus-within:border-[color:var(--color-accent)] transition-colors">
          <span className="pl-4 pr-2 text-fg-faint font-mono text-sm">
            https://
          </span>
          <input
            type="text"
            inputMode="url"
            placeholder="yourwebsite.com"
            value={url.replace(/^https?:\/\//, "")}
            onChange={(e) =>
              setUrl(e.target.value.replace(/^https?:\/\//, ""))
            }
            className="flex-1 bg-transparent py-4 pr-3 text-[15px] outline-none placeholder:text-fg-faint"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={phase === "crawling" || phase === "analyzing"}
            className="btn-tactile m-1.5 inline-flex items-center gap-2 rounded-[6px] bg-[color:var(--color-accent)] px-5 py-3 font-display text-[13px] font-bold uppercase tracking-wide text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)] focus-ring disabled:opacity-60"
          >
            <Sparkle size={14} weight="fill" />
            Re-run
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>

        <StatusBar phase={phase} message={statusMessage} error={error} />
      </form>

      {/* signals panel */}
      {signals && (
        <SignalsPanel signals={signals} />
      )}

      {/* analysis */}
      {(raw || parsed) && (
        <AnalysisPanel parsed={parsed} raw={raw} />
      )}

      {/* error */}
      {phase === "error" && error && (
        <div className="mt-12 rounded-lg border border-[color:var(--color-crit)]/40 bg-[color:var(--color-crit-bg)] p-6 max-w-2xl">
          <div className="flex items-start gap-3">
            <XCircle
              size={22}
              weight="fill"
              style={{ color: "var(--color-crit)" }}
            />
            <div>
              <div className="font-medium mb-1.5">Audit failed</div>
              <p className="text-[14px] text-fg-muted leading-[1.6]">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBar({
  phase,
  message,
  error,
}: {
  phase: Phase;
  message: string;
  error: string | null;
}) {
  if (phase === "idle") return null;
  const labels: Record<Phase, string> = {
    idle: "",
    crawling: "01 · Crawling site",
    analyzing: "02 · Analyzing with AI",
    done: "✓ Complete",
    error: "✗ Failed",
  };
  return (
    <div className="mt-5 flex items-center gap-3 font-mono text-[12px] tracking-[0.12em] uppercase">
      {phase === "crawling" || phase === "analyzing" ? (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
      ) : phase === "done" ? (
        <CheckCircle
          size={14}
          weight="fill"
          style={{ color: "var(--color-pass)" }}
        />
      ) : (
        <XCircle
          size={14}
          weight="fill"
          style={{ color: "var(--color-crit)" }}
        />
      )}
      <span
        className={cn(
          phase === "done"
            ? "text-[color:var(--color-pass)]"
            : phase === "error"
              ? "text-[color:var(--color-crit)]"
              : "text-[color:var(--color-accent)]",
        )}
      >
        {labels[phase]}
      </span>
      <span className="text-fg-faint normal-case tracking-normal">
        {error ?? message}
      </span>
    </div>
  );
}

function SignalsPanel({ signals }: { signals: CrawlSignals }) {
  const items: { label: string; value: string; status?: "pass" | "warn" | "crit" }[] = useMemo(
    () => [
      {
        label: "HTTP status",
        value: String(signals.status),
        status: signals.status >= 200 && signals.status < 300 ? "pass" : "crit",
      },
      {
        label: "HTTPS",
        value: signals.hasHttps ? "yes" : "no",
        status: signals.hasHttps ? "pass" : "crit",
      },
      {
        label: "Load time",
        value: `${signals.loadTimeMs} ms`,
        status:
          signals.loadTimeMs < 1500
            ? "pass"
            : signals.loadTimeMs < 3000
              ? "warn"
              : "crit",
      },
      {
        label: "HTML size",
        value: `${(signals.byteSize / 1024).toFixed(1)} KB`,
      },
      {
        label: "Title length",
        value: signals.title ? `${signals.titleLength} chars` : "missing",
        status: !signals.title
          ? "crit"
          : signals.titleLength > 60 || signals.titleLength < 20
            ? "warn"
            : "pass",
      },
      {
        label: "Meta description",
        value: signals.metaDescription
          ? `${signals.metaDescriptionLength} chars`
          : "missing",
        status: !signals.metaDescription
          ? "crit"
          : signals.metaDescriptionLength > 160 ||
              signals.metaDescriptionLength < 50
            ? "warn"
            : "pass",
      },
      {
        label: "H1 count",
        value: String(signals.h1.length),
        status: signals.h1.length === 0 ? "crit" : signals.h1.length === 1 ? "pass" : "warn",
      },
      { label: "Total headings", value: String(signals.totalHeadings) },
      {
        label: "Images / missing alt",
        value: `${signals.imageCount} / ${signals.imagesMissingAlt}`,
        status:
          signals.imagesMissingAlt === 0
            ? "pass"
            : signals.imagesMissingAlt < 5
              ? "warn"
              : "crit",
      },
      {
        label: "Internal / external links",
        value: `${signals.internalLinks} / ${signals.externalLinks}`,
      },
      {
        label: "Open Graph",
        value: signals.hasOpenGraph ? "present" : "missing",
        status: signals.hasOpenGraph ? "pass" : "warn",
      },
      {
        label: "JSON-LD",
        value: signals.hasJsonLd
          ? signals.jsonLdTypes.slice(0, 3).join(", ")
          : "missing",
        status: signals.hasJsonLd ? "pass" : "warn",
      },
      {
        label: "Canonical",
        value: signals.canonical ? "set" : "missing",
        status: signals.canonical ? "pass" : "warn",
      },
      {
        label: "Word count",
        value: String(signals.wordCount),
        status:
          signals.wordCount > 600
            ? "pass"
            : signals.wordCount > 200
              ? "warn"
              : "crit",
      },
    ],
    [signals],
  );

  return (
    <section className="mt-16">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted mb-5 flex items-center gap-2">
        <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
        Crawl signals
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-lg overflow-hidden border border-[color:var(--color-border)]">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-[color:var(--color-bg)] p-5"
          >
            <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
              {item.label}
            </div>
            <div
              className={cn(
                "mt-2 font-display font-bold text-[18px]",
                item.status === "pass" && "text-[color:var(--color-pass)]",
                item.status === "warn" && "text-[color:var(--color-warn)]",
                item.status === "crit" && "text-[color:var(--color-crit)]",
              )}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AnalysisPanel({
  parsed,
  raw,
}: {
  parsed: AuditPayload | null;
  raw: string;
}) {
  return (
    <section className="mt-16">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted mb-5 flex items-center gap-2">
        <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
        AI auditor analysis
      </div>

      {parsed ? (
        <ParsedAnalysis parsed={parsed} />
      ) : (
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-6">
          <div className="font-mono text-[12px] text-fg-muted mb-2">
            Streaming raw output…
          </div>
          <pre className="font-mono text-[12.5px] leading-[1.6] text-fg whitespace-pre-wrap break-all opacity-80">
            {raw || "…"}
          </pre>
        </div>
      )}
    </section>
  );
}

function ParsedAnalysis({ parsed }: { parsed: AuditPayload }) {
  const counts = {
    crit: parsed.findings.filter((f) => f.severity === "critical").length,
    warn: parsed.findings.filter((f) => f.severity === "warning").length,
    pass: parsed.findings.filter((f) => f.severity === "pass").length,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      <aside className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-7">
        <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-faint">
          Overall score
        </div>
        <div className="mt-3 font-display font-extrabold text-[64px] leading-none">
          {parsed.score}
          <span className="text-fg-faint text-[24px] font-normal">/100</span>
        </div>
        <div className="mt-1 font-mono text-[12px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
          Grade {parsed.grade}
        </div>

        <p className="mt-6 text-[14px] leading-[1.6] text-fg-muted">
          {parsed.summary}
        </p>

        <div className="mt-7 pt-6 border-t border-[color:var(--color-border)] flex items-center justify-between gap-3">
          <Tally label="Critical" value={counts.crit} status="crit" />
          <Tally label="Warning" value={counts.warn} status="warn" />
          <Tally label="Passing" value={counts.pass} status="pass" />
        </div>

        {parsed.quickWins?.length > 0 && (
          <div className="mt-7 pt-6 border-t border-[color:var(--color-border)]">
            <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-faint mb-3">
              Quick wins
            </div>
            <ul className="flex flex-col gap-2.5">
              {parsed.quickWins.map((qw, i) => (
                <li key={i} className="text-[13.5px] leading-[1.55] text-fg">
                  → {qw}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="flex flex-col gap-3">
        {parsed.findings.map((f, i) => (
          <FindingCard key={i} finding={f} />
        ))}
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const map = {
    critical: {
      Icon: XCircle,
      color: "var(--color-crit)",
      bg: "var(--color-crit-bg)",
      label: "Critical",
    },
    warning: {
      Icon: WarningCircle,
      color: "var(--color-warn)",
      bg: "var(--color-warn-bg)",
      label: "Warning",
    },
    pass: {
      Icon: CheckCircle,
      color: "var(--color-pass)",
      bg: "var(--color-pass-bg)",
      label: "Passing",
    },
  } as const;
  const m = map[finding.severity] ?? map.warning;
  const Icon = m.Icon;
  return (
    <article
      className="rounded-lg border p-6 flex gap-4 items-start"
      style={{
        backgroundColor: m.bg,
        borderColor: "var(--color-border)",
      }}
    >
      <Icon size={22} weight="fill" style={{ color: m.color }} />
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span
            className="font-mono text-[10px] tracking-[0.18em] uppercase font-bold"
            style={{ color: m.color }}
          >
            {m.label}
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
            {finding.category}
          </span>
        </div>
        <h3 className="font-display font-bold text-[16px] mb-2">
          {finding.title}
        </h3>
        <p className="text-[14px] leading-[1.65] text-fg-muted">
          {finding.detail}
        </p>
      </div>
    </article>
  );
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
        className="font-display font-extrabold text-[22px] leading-none"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
        {label}
      </div>
    </div>
  );
}
