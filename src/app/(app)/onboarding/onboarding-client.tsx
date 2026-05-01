"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkle,
  GoogleLogo,
  SkipForward,
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

type Step = "intro" | "audit" | "auditing" | "results" | "gsc";

type Phase = "idle" | "checks" | "explain" | "saving" | "done" | "error";

type LiveFinding = {
  title: string;
  severity: "critical" | "warning" | "pass";
  category: string;
};

export function OnboardingClient({
  userName,
  gscEnabled,
}: {
  userName: string;
  gscEnabled: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [url, setUrl] = useState("");
  const [auditUrl, setAuditUrl] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [parsed, setParsed] = useState<{
    score: number;
    grade: string;
    summary: string;
    findings: LiveFinding[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const totalSteps = 4;
  const stepIndex = {
    intro: 1,
    audit: 1,
    auditing: 2,
    results: 3,
    gsc: 3,
  }[step];

  useEffect(() => {
    if (step === "audit") inputRef.current?.focus();
    return () => abortRef.current?.abort();
  }, [step]);

  const startAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let v = url.trim();
    if (!v.startsWith("http")) v = "https://" + v;
    setAuditUrl(v);
    setStep("auditing");
    setPhase("checks");
    setStatusMsg("Running real-data checks…");
    setError(null);
    setParsed(null);
    setAuditId(null);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: v, agent: "TECHNICAL" }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? `Request failed (${res.status})`);
        setPhase("error");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let raw = "";
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
            if (ev.type === "audit" && ev.auditId) setAuditId(ev.auditId);
            else if (ev.type === "status" && ev.phase) {
              setPhase(ev.phase);
              if (ev.message) setStatusMsg(ev.message);
            } else if (ev.type === "delta" && ev.chunk) {
              raw += ev.chunk;
            } else if (ev.type === "result" && ev.raw) {
              try {
                const obj = JSON.parse(ev.raw);
                setParsed(obj);
              } catch {
                /* ignore */
              }
            } else if (ev.type === "error" && ev.message) {
              setError(ev.message);
            }
          } catch {
            /* ignore malformed */
          }
        }
      }
      // try once more from accumulated raw if no result event landed
      if (!parsed && raw) {
        try {
          setParsed(JSON.parse(raw));
        } catch {
          /* leave null */
        }
      }
      setStep("results");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setPhase("error");
    }
  };

  const finishOnboarding = async (gotoDashboard = true) => {
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push(gotoDashboard ? "/dashboard" : "/audit/new");
  };

  return (
    <main className="min-h-[100dvh] grid grid-rows-[auto_1fr] bg-[color:var(--color-bg)]">
      <header className="px-6 md:px-10 h-16 flex items-center justify-between border-b border-[color:var(--color-border)]">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <ProgressDots active={stepIndex} total={totalSteps} />
          <button
            type="button"
            onClick={() => finishOnboarding()}
            className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-faint hover:text-fg transition-colors"
          >
            Skip →
          </button>
        </div>
      </header>

      <div className="px-6 md:px-10 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <Frame key="intro">
                <Eyebrow>Step 1 of 4 · Welcome</Eyebrow>
                <Heading>
                  Welcome, {userName.split(" ")[0]}.{" "}
                  <span className="italic font-light text-fg-muted">
                    Let&rsquo;s run your first audit.
                  </span>
                </Heading>
                <Body>
                  In ~30 seconds you&rsquo;ll see what real search engines see
                  when they crawl your site — Lighthouse scores, real-user
                  performance, security headers, schema validity, domain
                  authority. All from real data sources.
                </Body>
                <Actions>
                  <PrimaryButton onClick={() => setStep("audit")}>
                    <Sparkle size={14} weight="fill" />
                    Start
                    <ArrowRight size={14} weight="bold" />
                  </PrimaryButton>
                </Actions>
              </Frame>
            )}

            {step === "audit" && (
              <Frame key="audit">
                <Eyebrow>Step 1 of 4 · Pick a URL</Eyebrow>
                <Heading>What URL do you want to audit?</Heading>
                <Body>
                  Your own site is the best place to start — you&rsquo;ll
                  recognize the findings. Or audit a competitor to see how
                  they&rsquo;re positioned.
                </Body>
                <form onSubmit={startAudit} className="mt-8 max-w-[640px]">
                  <div className="flex items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] focus-within:border-[color:var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)] transition-all">
                    <span className="pl-4 pr-2 text-fg-faint font-mono text-sm">
                      https://
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="url"
                      placeholder="yourwebsite.com"
                      value={url}
                      onChange={(e) =>
                        setUrl(e.target.value.replace(/^https?:\/\//, ""))
                      }
                      className="flex-1 min-w-0 bg-transparent py-4 pr-3 text-[15px] outline-none placeholder:text-fg-faint"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="submit"
                      disabled={!url.trim()}
                      className="btn-tactile m-1.5 inline-flex items-center gap-2 rounded-[6px] bg-[color:var(--color-accent)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-accent-fg)] disabled:opacity-50"
                    >
                      <Sparkle size={13} weight="fill" />
                      Run audit
                      <ArrowRight size={13} weight="bold" />
                    </button>
                  </div>
                </form>
              </Frame>
            )}

            {step === "auditing" && auditUrl && (
              <Frame key="auditing">
                <Eyebrow>Step 2 of 4 · Streaming</Eyebrow>
                <Heading className="mb-3">
                  Reading{" "}
                  <span className="italic font-light text-fg-muted">
                    {auditUrl.replace(/^https?:\/\//, "")}
                  </span>
                </Heading>
                <Body>{statusMsg}</Body>
                <div className="mt-9">
                  <PhaseTracker phase={phase} />
                </div>
                {error && (
                  <div className="mt-7 rounded-lg border border-[color:var(--color-crit)]/30 bg-[color:var(--color-crit-bg)] p-5">
                    <p className="text-[13.5px] text-fg-muted leading-[1.55]">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep("audit")}
                      className="mt-3 font-mono text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-accent)] hover:underline"
                    >
                      Try another URL →
                    </button>
                  </div>
                )}
              </Frame>
            )}

            {step === "results" && (
              <Frame key="results">
                <Eyebrow>Step 3 of 4 · Done</Eyebrow>
                <Heading>
                  Audit complete.{" "}
                  <span className="italic font-light text-fg-muted">
                    Here&rsquo;s your score.
                  </span>
                </Heading>

                {parsed ? (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-7">
                    <aside className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
                      <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
                        Score
                      </div>
                      <div className="mt-2 font-display font-extrabold text-[60px] leading-none tabular-nums">
                        {parsed.score}
                        <span className="text-fg-faint text-[22px] font-normal">
                          /100
                        </span>
                      </div>
                      <div className="mt-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
                        Grade {parsed.grade}
                      </div>
                      <p className="mt-5 text-[13px] leading-[1.6] text-fg-muted">
                        {parsed.summary}
                      </p>
                    </aside>

                    <div className="space-y-2.5">
                      <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted mb-1">
                        Top {Math.min(5, parsed.findings.length)} findings
                      </div>
                      {parsed.findings.slice(0, 5).map((f, i) => (
                        <FindingPreview key={i} finding={f} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Body>Findings saved to your reports.</Body>
                )}

                <Actions>
                  <PrimaryButton
                    onClick={() => {
                      if (gscEnabled) setStep("gsc");
                      else void finishOnboarding();
                    }}
                  >
                    Continue
                    <ArrowRight size={13} weight="bold" />
                  </PrimaryButton>
                  {auditId && (
                    <a
                      href={`/audit/${auditId}`}
                      className="font-mono text-[11px] tracking-[0.14em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors px-4 py-3"
                    >
                      Open full report →
                    </a>
                  )}
                </Actions>
              </Frame>
            )}

            {step === "gsc" && (
              <Frame key="gsc">
                <Eyebrow>Step 4 of 4 · Optional</Eyebrow>
                <Heading>
                  Connect{" "}
                  <span className="italic font-light text-fg-muted">
                    real Google data?
                  </span>
                </Heading>
                <Body>
                  Once connected, every audit on your verified sites also
                  shows your <strong className="text-fg">actual</strong>{" "}
                  Google ranking data — impressions, clicks, top queries,
                  average position. Read-only. We never write anything.
                </Body>
                <div className="mt-8 rounded-xl border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)] p-7">
                  <div className="flex items-start gap-4">
                    <GoogleLogo
                      size={28}
                      weight="duotone"
                      className="text-[color:var(--color-accent)] shrink-0 mt-0.5"
                    />
                    <div>
                      <h3 className="font-display font-bold text-[16px] mb-1.5">
                        Google Search Console
                      </h3>
                      <p className="text-[13.5px] text-fg-muted leading-[1.6]">
                        Site owners only · read-only{" "}
                        <code className="font-mono text-[12px] text-fg">
                          webmasters.readonly
                        </code>{" "}
                        scope.
                      </p>
                    </div>
                  </div>
                </div>
                <Actions>
                  <PrimaryButton
                    onClick={async () => {
                      await fetch("/api/onboarding/complete", { method: "POST" });
                      window.location.href = "/api/search-console/connect";
                    }}
                  >
                    <GoogleLogo size={13} weight="bold" />
                    Connect now
                    <ArrowRight size={13} weight="bold" />
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => finishOnboarding()}
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-muted hover:text-fg transition-colors px-4 py-3"
                  >
                    <SkipForward size={12} weight="bold" />
                    Skip — connect later
                  </button>
                </Actions>
              </Frame>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

/* primitives ============================================================== */

function PhaseTracker({ phase }: { phase: Phase }) {
  const phases: { id: Phase; label: string }[] = [
    { id: "checks", label: "Real-data checks" },
    { id: "explain", label: "AI explanations" },
    { id: "saving", label: "Saving findings" },
    { id: "done", label: "Complete" },
  ];
  const idx = phases.findIndex((p) => p.id === phase);
  return (
    <ol className="flex flex-col gap-3 max-w-md">
      {phases.map((p, i) => {
        const state = phase === "error" ? "error" : i < idx ? "done" : i === idx ? "active" : "pending";
        return (
          <li
            key={p.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-md border transition-colors",
              state === "active" && "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]",
              state === "done" && "border-[color:var(--color-pass)]/30 bg-[color:var(--color-pass-bg)]",
              state === "pending" && "border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
              state === "error" && "border-[color:var(--color-crit)]/30 bg-[color:var(--color-crit-bg)]",
            )}
          >
            {state === "done" ? (
              <CheckCircle
                size={16}
                weight="fill"
                className="text-[color:var(--color-pass)] shrink-0"
              />
            ) : state === "active" ? (
              <span className="inline-block w-2 h-2 rounded-full bg-[color:var(--color-accent)] pulse-dot shrink-0" />
            ) : state === "error" ? (
              <XCircle
                size={16}
                weight="fill"
                className="text-[color:var(--color-crit)] shrink-0"
              />
            ) : (
              <span className="inline-block w-2 h-2 rounded-full bg-[color:var(--color-fg-faint)] shrink-0" />
            )}
            <span
              className={cn(
                "font-mono text-[12px] tracking-[0.12em] uppercase",
                state === "pending"
                  ? "text-fg-faint"
                  : state === "done"
                    ? "text-[color:var(--color-pass)]"
                    : state === "error"
                      ? "text-[color:var(--color-crit)]"
                      : "text-[color:var(--color-accent)]",
              )}
            >
              {p.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function FindingPreview({ finding }: { finding: LiveFinding }) {
  const map = {
    critical: { Icon: XCircle, color: "var(--color-crit)", bg: "var(--color-crit-bg)" },
    warning: { Icon: WarningCircle, color: "var(--color-warn)", bg: "var(--color-warn-bg)" },
    pass: { Icon: CheckCircle, color: "var(--color-pass)", bg: "var(--color-pass-bg)" },
  } as const;
  const m = map[finding.severity] ?? map.warning;
  const Icon = m.Icon;
  return (
    <div
      className="rounded-md border border-[color:var(--color-border)] p-3.5 flex items-center gap-3"
      style={{ backgroundColor: m.bg }}
    >
      <Icon size={16} weight="fill" style={{ color: m.color, flexShrink: 0 }} />
      <span className="text-[13.5px] flex-1 truncate">{finding.title}</span>
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint shrink-0">
        {finding.category}
      </span>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
      {children}
    </div>
  );
}

function Heading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "font-display font-extrabold mt-5 text-balance text-[clamp(34px,5.5vw,60px)] leading-[1.02] tracking-[-0.03em]",
        className,
      )}
    >
      {children}
    </h1>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-2xl text-fg-muted text-[16px] md:text-[17px] leading-[1.65]">
      {children}
    </p>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-10 flex items-center gap-3 flex-wrap">{children}</div>;
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] shadow-[0_4px_14px_-4px_rgb(255_94_26/_0.4)]"
    >
      {children}
    </button>
  );
}

function ProgressDots({ active, total }: { active: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="block w-1.5 h-1.5 rounded-full transition-colors"
          style={{
            backgroundColor:
              i < active
                ? "var(--color-accent)"
                : "var(--color-border-strong)",
          }}
        />
      ))}
    </div>
  );
}
