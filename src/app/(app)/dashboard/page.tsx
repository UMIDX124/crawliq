import Link from "next/link";
import { redirect } from "next/navigation";
import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import {
  ChartLineUp,
  FolderOpen,
  ListChecks,
  Sparkle,
  CheckCircle,
  XCircle,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { AuditTrendChart } from "@/components/app/audit-trend-chart";
import { SeverityBreakdown } from "@/components/app/severity-breakdown";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user.onboardedAt) {
    redirect("/onboarding");
  }

  const [
    auditCount,
    projectCount,
    openTaskCount,
    recentCompleted,
    severity,
    recentAudits,
  ] = await Promise.all([
    db.audit.count({ where: { userId: user.id } }),
    db.project.count({ where: { ownerId: user.id } }),
    db.task.count({
      where: {
        OR: [{ creatorId: user.id }, { assigneeId: user.id }],
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
    }),
    db.audit.findMany({
      where: { userId: user.id, status: "COMPLETED", score: { not: null } },
      orderBy: { createdAt: "asc" },
      select: { id: true, score: true, createdAt: true },
      take: 30,
    }),
    db.finding.groupBy({
      by: ["severity"],
      where: { audit: { userId: user.id } },
      _count: { _all: true },
    }),
    db.audit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { project: true },
    }),
  ]);

  const trendPoints = recentCompleted.map((a) => ({
    date: a.createdAt,
    score: a.score!,
  }));

  const sevCounts = {
    critical: severity.find((s) => s.severity === "CRITICAL")?._count._all ?? 0,
    warning: severity.find((s) => s.severity === "WARNING")?._count._all ?? 0,
    pass: severity.find((s) => s.severity === "PASS")?._count._all ?? 0,
  };

  const avgScore =
    recentCompleted.length > 0
      ? Math.round(
          recentCompleted.reduce((s, a) => s + (a.score ?? 0), 0) /
            recentCompleted.length,
        )
      : null;

  return (
    <>
      <AppTopbar title="Dashboard" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {/* heading */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Welcome back, {user.name.split(" ")[0]}
              </span>
              <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
                Your workspace.
              </h2>
            </div>
            <Link
              href="/audit/new"
              className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] shadow-[0_4px_14px_-4px_rgb(255_94_26/_0.4)]"
            >
              <Sparkle size={14} weight="fill" />
              New audit
            </Link>
          </div>

          {/* stat band */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]">
            <StatCell
              icon={<ChartLineUp size={18} weight="duotone" />}
              label="Total audits"
              value={auditCount}
              href="/reports"
            />
            <StatCell
              icon={<Sparkle size={18} weight="duotone" />}
              label="Avg score"
              value={avgScore ?? "—"}
              accent
            />
            <StatCell
              icon={<FolderOpen size={18} weight="duotone" />}
              label="Projects"
              value={projectCount}
              href="/projects"
            />
            <StatCell
              icon={<ListChecks size={18} weight="duotone" />}
              label="Open tasks"
              value={openTaskCount}
              href="/tasks"
            />
          </div>

          {/* charts row */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
            {/* trend chart */}
            <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">
                  <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                  Score trend
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                  last {recentCompleted.length} audits
                </span>
              </div>
              <h3 className="font-display font-bold text-[16px] mb-5">
                {avgScore !== null
                  ? `Average ${avgScore}/100 across recent audits.`
                  : "Run your first audit to start tracking."}
              </h3>
              <AuditTrendChart points={trendPoints} />
            </div>

            {/* severity breakdown */}
            <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Findings by severity
              </span>
              <h3 className="font-display font-bold text-[16px] mt-2 mb-5">
                What&rsquo;s most urgent?
              </h3>
              <SeverityBreakdown
                critical={sevCounts.critical}
                warning={sevCounts.warning}
                pass={sevCounts.pass}
              />
            </div>
          </div>

          {/* recent audits */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Recent audits
              </span>
              {recentAudits.length > 0 && (
                <Link
                  href="/reports"
                  className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
                >
                  View all →
                </Link>
              )}
            </div>

            {recentAudits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-10 text-center">
                <p className="text-fg-muted text-[14px] mb-5">
                  No audits run yet. Get started in under 10 seconds.
                </p>
                <Link
                  href="/audit/new"
                  className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
                >
                  <Sparkle size={14} weight="fill" />
                  Run first audit
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden">
                {recentAudits.map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/audit/${a.id}`}
                    className={`flex items-center justify-between gap-4 px-5 md:px-6 py-4 hover:bg-[color:var(--color-bg-2)] transition-colors ${
                      i > 0 ? "border-t border-[color:var(--color-border)]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <StatusDot status={a.status} />
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium truncate">
                          {a.url}
                        </div>
                        <div className="mt-1 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                          {a.agent} ·{" "}
                          {new Date(a.createdAt).toLocaleDateString()}
                          {a.project ? ` · ${a.project.name}` : ""}
                        </div>
                      </div>
                    </div>
                    {a.status === "COMPLETED" ? (
                      <div className="text-right shrink-0">
                        <div className="font-display font-extrabold text-[22px] leading-none tabular-nums">
                          {a.score ?? "—"}
                        </div>
                        <div className="mt-1 font-mono text-[10px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
                          {a.grade ?? "—"}
                        </div>
                      </div>
                    ) : (
                      <span
                        className="font-mono text-[10px] tracking-[0.14em] uppercase shrink-0"
                        style={{
                          color:
                            a.status === "FAILED"
                              ? "var(--color-crit)"
                              : "var(--color-fg-muted)",
                        }}
                      >
                        {a.status}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function StatCell({
  icon,
  label,
  value,
  href,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <div className="bg-[color:var(--color-surface)] hover:bg-[color:var(--color-bg-2)] transition-colors p-5 sm:p-6 group h-full">
      <div className="text-[color:var(--color-accent)] mb-4">{icon}</div>
      <div
        className="font-display font-extrabold text-[28px] sm:text-[34px] leading-none tabular-nums"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-fg)" }}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted group-hover:text-[color:var(--color-accent)] transition-colors">
        {label}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function StatusDot({ status }: { status: string }) {
  const Icon =
    status === "COMPLETED"
      ? CheckCircle
      : status === "FAILED"
        ? XCircle
        : WarningCircle;
  const color =
    status === "COMPLETED"
      ? "var(--color-pass)"
      : status === "FAILED"
        ? "var(--color-crit)"
        : status === "RUNNING"
          ? "var(--color-accent)"
          : "var(--color-fg-faint)";
  return <Icon size={16} weight="fill" style={{ color, flexShrink: 0 }} />;
}
