import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  ChartLineUp,
  FolderOpen,
  ListChecks,
  FileText,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  // Phase 1: just count what's there. Phase 3 will add chart + recent audits.
  const [auditCount, projectCount, taskCount] = await Promise.all([
    db.audit.count({ where: { userId: user.id } }),
    db.project.count({ where: { ownerId: user.id } }),
    db.task.count({
      where: {
        OR: [{ creatorId: user.id }, { assigneeId: user.id }],
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
    }),
  ]);

  return (
    <>
      <AppTopbar title="Dashboard" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div>
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              Welcome back, {user.name.split(" ")[0]}
            </span>
            <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
              Your workspace.
            </h2>
            <p className="mt-3 text-fg-muted text-[15px] leading-[1.65] max-w-xl">
              Run a fresh audit, jump back into a project, or review your
              outstanding tasks.
            </p>
          </div>

          {/* primary CTA */}
          <div className="mt-10 rounded-xl border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] p-7 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h3 className="font-display font-bold text-[18px] mb-1.5">
                Run a new audit
              </h3>
              <p className="text-fg-muted text-[14px] leading-[1.6]">
                Paste a URL and stream findings in under 10 seconds.
              </p>
            </div>
            <Link
              href="/audit"
              className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
            >
              <Sparkle size={14} weight="fill" />
              Start audit
            </Link>
          </div>

          {/* stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]">
            <StatCell
              icon={<ChartLineUp size={18} weight="duotone" />}
              label="Total audits"
              value={auditCount}
              href="/reports"
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
              value={taskCount}
              href="/tasks"
            />
          </div>

          {/* placeholder for Phase 3 */}
          <div className="mt-12 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="eyebrow">
                  <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                  Recent audits
                </span>
                <h3 className="font-display font-bold text-[17px] mt-2">
                  No audits yet
                </h3>
              </div>
              <FileText size={24} weight="duotone" className="text-fg-faint" />
            </div>
            <p className="text-fg-muted text-[14px] leading-[1.65] max-w-md">
              Run your first audit and it will land here. Audit history,
              re-run buttons, and trend charts are shipping soon.
            </p>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-[color:var(--color-surface)] hover:bg-[color:var(--color-bg-2)] transition-colors p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <span className="text-[color:var(--color-accent)]">{icon}</span>
      </div>
      <div className="font-display font-extrabold text-[40px] leading-none tabular-nums">
        {value}
      </div>
      <div className="mt-2 font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted group-hover:text-[color:var(--color-accent)] transition-colors">
        {label}
      </div>
    </Link>
  );
}
