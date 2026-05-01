"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkle,
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { AgentType } from "@prisma/client";

type AgentMeta = {
  type: AgentType;
  name: string;
  shortName: string;
  description: string;
};

type ProjectOption = { id: string; name: string; url: string };

type Limit =
  | { remaining: number | null; plan: string; exceeded?: undefined; limit?: undefined }
  | { exceeded: true; plan: string; limit: number; remaining?: undefined };

type Phase = "idle" | "crawling" | "analyzing" | "saving" | "done" | "error";

export function NewAuditClient({
  agents,
  projects = [],
  initialProjectId = null,
  initialUrl = "",
  limit,
}: {
  agents: AgentMeta[];
  projects?: ProjectOption[];
  initialProjectId?: string | null;
  initialUrl?: string;
  limit: Limit;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl.replace(/^https?:\/\//, ""));
  const [agent, setAgent] = useState<AgentType>("ONPAGE");
  const [scope, setScope] = useState<"single" | "multi">("single");
  const [projectId, setProjectId] = useState<string | "">(
    initialProjectId ?? "",
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [auditId, setAuditId] = useState<string | null>(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const exceeded = "exceeded" in limit && limit.exceeded === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || phase === "crawling" || phase === "analyzing") return;
    if (exceeded) return;

    let v = url.trim();
    if (!v.startsWith("http://") && !v.startsWith("https://")) {
      v = "https://" + v;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPhase("crawling");
    setStatusMessage(`Fetching ${v}`);
    setRaw("");
    setError(null);
    setAuditId(null);

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: v,
          agent,
          scope,
          ...(projectId ? { projectId } : {}),
        }),
        signal: ctrl.signal,
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
        for (const block of blocks) {
          const t = block.trim();
          if (!t.startsWith("data:")) continue;
          try {
            const ev = JSON.parse(t.slice(5).trim());
            applyEvent(ev);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setPhase("error");
    }
  };

  function applyEvent(ev: {
    type: string;
    phase?: Phase;
    message?: string;
    auditId?: string;
    chunk?: string;
  }) {
    if (ev.type === "audit" && ev.auditId) {
      setAuditId(ev.auditId);
    } else if (ev.type === "status" && ev.phase) {
      setPhase(ev.phase);
      if (ev.message) setStatusMessage(ev.message);
      if (ev.phase === "done" && auditId) {
        // navigate to detail page after a beat so user sees "complete"
        setTimeout(() => router.push(`/audit/${auditId}`), 700);
      }
    } else if (ev.type === "delta" && ev.chunk) {
      setRaw((p) => p + ev.chunk);
    } else if (ev.type === "error" && ev.message) {
      setError(ev.message);
    }
  }

  // Side effect: when phase becomes "done", route once auditId is set
  useEffect(() => {
    if (phase === "done" && auditId) {
      const t = setTimeout(() => router.push(`/audit/${auditId}`), 700);
      return () => clearTimeout(t);
    }
  }, [phase, auditId, router]);

  return (
    <div>
      {/* heading */}
      <div>
        <span className="eyebrow">
          <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
          New audit
        </span>
        <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
          Run an audit.
        </h2>
        <p className="mt-3 text-fg-muted text-[15px] leading-[1.65] max-w-xl">
          Pick an auditor and paste any URL. Findings stream live, then save
          to your reports for export.
        </p>
      </div>

      {/* limit banner */}
      <div className="mt-7">
        {exceeded ? (
          <div className="rounded-lg border border-[color:var(--color-warn)]/30 bg-[color:var(--color-warn-bg)] p-5">
            <div className="flex items-start gap-3">
              <WarningCircle
                size={20}
                weight="fill"
                style={{ color: "var(--color-warn)" }}
              />
              <div>
                <div className="font-display font-bold text-[14.5px] mb-1">
                  Free plan limit reached
                </div>
                <p className="text-[13.5px] text-fg-muted leading-[1.6]">
                  You&rsquo;ve used all {limit.limit} audits this month. Upgrade
                  to Pro for unlimited.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
            Plan · {limit.plan}
            {"remaining" in limit && limit.remaining !== null && limit.remaining !== undefined && (
              <span className="ml-3">
                · {limit.remaining} audits left this month
              </span>
            )}
          </div>
        )}
      </div>

      {/* form */}
      <form onSubmit={handleSubmit} className="mt-8">
        {/* URL */}
        <label className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted block mb-2.5">
          URL
        </label>
        <div className="flex items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] focus-within:border-[color:var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)] transition-all">
          <span className="pl-4 pr-2 text-fg-faint font-mono text-sm shrink-0">
            https://
          </span>
          <input
            type="text"
            inputMode="url"
            placeholder="yourwebsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//, ""))}
            disabled={phase === "crawling" || phase === "analyzing" || exceeded}
            className="flex-1 min-w-0 bg-transparent py-3.5 pr-3 text-[15px] outline-none placeholder:text-fg-faint disabled:opacity-60"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Project picker (optional) */}
        {projects.length > 0 && (
          <div className="mt-7">
            <label className="block font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted mb-2.5">
              Project (optional)
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={phase === "crawling" || phase === "analyzing"}
                className="appearance-none w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3.5 py-3 text-[14px] outline-none focus:border-[color:var(--color-accent)] focus:shadow-[0_0_0_4px_var(--color-accent-soft)] transition-all disabled:opacity-60 pr-10"
              >
                <option value="">Standalone audit (not linked)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.url.replace(/^https?:\/\//, "")}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[12px] text-fg-faint">
                ▼
              </span>
            </div>
          </div>
        )}

        {/* Scope toggle */}
        <div className="mt-7">
          <label className="block font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted mb-2.5">
            Scope
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["single", "multi"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                disabled={phase === "crawling" || phase === "analyzing"}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors disabled:opacity-50",
                  scope === s
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-accent)]",
                )}
              >
                <div
                  className={cn(
                    "font-display font-bold text-[14px] mb-1.5",
                    scope === s && "text-[color:var(--color-accent)]",
                  )}
                >
                  {s === "single" ? "Single page" : "Site-wide"}
                </div>
                <div className="text-[12.5px] leading-[1.55] text-fg-muted">
                  {s === "single"
                    ? "Just this URL. ~10s. Best for landing pages."
                    : "Crawl up to 12 pages. ~45s. Aggregate site-wide patterns."}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent picker */}
        <label className="mt-7 block font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted mb-3">
          Auditor
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((a) => (
            <button
              key={a.type}
              type="button"
              onClick={() => setAgent(a.type)}
              className={cn(
                "text-left rounded-lg border p-5 transition-colors",
                agent === a.type
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-accent)]",
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "font-display font-bold text-[14px]",
                    agent === a.type && "text-[color:var(--color-accent)]",
                  )}
                >
                  {a.shortName}
                </span>
                {agent === a.type && (
                  <CheckCircle
                    size={14}
                    weight="fill"
                    className="text-[color:var(--color-accent)]"
                  />
                )}
              </div>
              <p className="text-[12.5px] leading-[1.55] text-fg-muted">
                {a.description}
              </p>
            </button>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={phase === "crawling" || phase === "analyzing" || exceeded || !url.trim()}
            className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] disabled:opacity-50 shadow-[0_4px_14px_-4px_rgb(31_109_240/_0.4)]"
          >
            <Sparkle size={14} weight="fill" />
            {phase === "crawling" || phase === "analyzing"
              ? "Running..."
              : phase === "done"
                ? "Done — opening report"
                : "Run audit"}
            <ArrowRight size={14} weight="bold" />
          </button>

          {phase !== "idle" && (
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-fg-muted">
              {error ?? statusMessage}
            </span>
          )}
        </div>
      </form>

      {/* live stream preview */}
      {(phase === "analyzing" || phase === "saving") && raw && (
        <div className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-[11px] text-fg-muted">
              streaming · {agent.toLowerCase()}.agent
            </span>
            <span className="ml-auto inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
          </div>
          <pre className="font-mono text-[12px] leading-[1.7] text-fg p-5 max-h-[320px] overflow-auto whitespace-pre-wrap break-words opacity-90">
            {raw}
          </pre>
        </div>
      )}

      {phase === "error" && error && (
        <div className="mt-10 rounded-lg border border-[color:var(--color-crit)]/30 bg-[color:var(--color-crit-bg)] p-5 max-w-2xl">
          <div className="flex items-start gap-3">
            <XCircle
              size={20}
              weight="fill"
              style={{ color: "var(--color-crit)" }}
            />
            <div>
              <div className="font-display font-bold text-[14.5px] mb-1">
                Audit failed
              </div>
              <p className="text-[13.5px] text-fg-muted leading-[1.6]">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
