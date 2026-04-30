import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  XCircle,
  Download,
} from "@phosphor-icons/react/dist/ssr";
import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { AGENTS } from "@/lib/agents";
import type { CrawlSignals } from "@/lib/audit";
import type { Severity, AgentType } from "@prisma/client";

export const metadata = { title: "Audit detail" };

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const audit = await db.audit.findFirst({
    where: { id, userId: user.id },
    include: {
      project: true,
      findings: { orderBy: { severity: "asc" } },
    },
  });
  if (!audit) notFound();

  const def = AGENTS[audit.agent as AgentType];
  const signals = (audit.signals as unknown as CrawlSignals | null) ?? null;
  const data = audit.data as {
    score?: number;
    grade?: string;
    summary?: string;
    quickWins?: string[];
  } | null;

  const counts = {
    crit: audit.findings.filter((f) => f.severity === "CRITICAL").length,
    warn: audit.findings.filter((f) => f.severity === "WARNING").length,
    pass: audit.findings.filter((f) => f.severity === "PASS").length,
  };

  return (
    <>
      <AppTopbar title="Audit detail" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
          >
            <ArrowLeft size={12} weight="bold" />
            All reports
          </Link>

          {/* header */}
          <div className="mt-7 flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0 flex-1">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                {def?.shortName ?? audit.agent} audit
                {audit.project && (
                  <span className="ml-2 text-fg-faint">· {audit.project.name}</span>
                )}
              </span>
              <h1 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em] break-all">
                {audit.url}
              </h1>
              <div className="mt-2 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
                {(audit.endedAt ?? audit.createdAt).toLocaleString()}
                {audit.status !== "COMPLETED" && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        audit.status === "FAILED"
                          ? "var(--color-crit-bg)"
                          : "var(--color-accent-soft)",
                      color:
                        audit.status === "FAILED"
                          ? "var(--color-crit)"
                          : "var(--color-accent)",
                    }}
                  >
                    {audit.status}
                  </span>
                )}
              </div>
            </div>

            {audit.status === "COMPLETED" && (
              <a
                href={`/api/audit/${audit.id}/pdf`}
                className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                <Download size={13} weight="bold" />
                Export PDF
              </a>
            )}
          </div>

          {audit.status === "FAILED" && (
            <div className="mt-8 rounded-xl border border-[color:var(--color-crit)]/30 bg-[color:var(--color-crit-bg)] p-6">
              <div className="flex items-start gap-3">
                <XCircle
                  size={20}
                  weight="fill"
                  style={{ color: "var(--color-crit)" }}
                />
                <div>
                  <div className="font-display font-bold text-[15px] mb-1">
                    Audit failed
                  </div>
                  <p className="text-[14px] text-fg-muted leading-[1.6]">
                    {audit.errorMsg ?? "Unknown error."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {audit.status === "COMPLETED" && (
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
              {/* left — score panel */}
              <aside className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7 h-fit">
                <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
                  Score
                </div>
                <div className="mt-3 font-display font-extrabold text-[64px] leading-none tabular-nums">
                  {audit.score ?? "—"}
                  <span className="text-fg-faint text-[24px] font-normal">/100</span>
                </div>
                <div className="mt-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
                  Grade {audit.grade ?? "—"}
                </div>

                {audit.summary && (
                  <p className="mt-7 text-[13.5px] leading-[1.65] text-fg-muted">
                    {audit.summary}
                  </p>
                )}

                <div className="mt-7 pt-6 border-t border-[color:var(--color-border)] grid grid-cols-3 gap-4">
                  <Tally label="Critical" value={counts.crit} status="crit" />
                  <Tally label="Warning" value={counts.warn} status="warn" />
                  <Tally label="Passing" value={counts.pass} status="pass" />
                </div>

                {data?.quickWins && data.quickWins.length > 0 && (
                  <div className="mt-7 pt-6 border-t border-[color:var(--color-border)]">
                    <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-faint mb-3">
                      Quick wins
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {data.quickWins.map((qw, i) => (
                        <li
                          key={i}
                          className="text-[13px] leading-[1.55] text-fg"
                        >
                          → {qw}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {signals && (
                  <div className="mt-7 pt-6 border-t border-[color:var(--color-border)]">
                    <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-faint mb-3">
                      Crawl meta
                    </div>
                    <ul className="font-mono text-[11.5px] text-fg-muted space-y-1.5">
                      <li>
                        Status <span className="text-fg">{signals.status}</span>
                      </li>
                      <li>
                        Load{" "}
                        <span className="text-fg">{signals.loadTimeMs}ms</span>
                      </li>
                      <li>
                        HTML{" "}
                        <span className="text-fg">
                          {(signals.byteSize / 1024).toFixed(1)} KB
                        </span>
                      </li>
                      <li>
                        Words <span className="text-fg">{signals.wordCount}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </aside>

              {/* right — findings */}
              <div className="flex flex-col gap-3">
                {audit.findings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-10 text-center">
                    <p className="text-fg-muted text-[14px]">
                      No findings recorded.
                    </p>
                  </div>
                ) : (
                  audit.findings.map((f) => (
                    <FindingCard
                      key={f.id}
                      title={f.title}
                      detail={f.detail}
                      category={f.category}
                      severity={f.severity}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function FindingCard({
  title,
  detail,
  category,
  severity,
}: {
  title: string;
  detail: string;
  category: string;
  severity: Severity;
}) {
  const map = {
    CRITICAL: { Icon: XCircle, color: "var(--color-crit)", bg: "var(--color-crit-bg)", label: "Critical" },
    WARNING: { Icon: WarningCircle, color: "var(--color-warn)", bg: "var(--color-warn-bg)", label: "Warning" },
    PASS: { Icon: CheckCircle, color: "var(--color-pass)", bg: "var(--color-pass-bg)", label: "Passing" },
  } as const;
  const m = map[severity];
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
            {category}
          </span>
        </div>
        <h3 className="font-display font-bold text-[16px] mb-2">{title}</h3>
        <p className="text-[14px] leading-[1.65] text-fg-muted">{detail}</p>
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
        className="font-display font-extrabold text-[24px] leading-none tabular-nums"
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
