import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Sparkle,
  CheckCircle,
  WarningCircle,
  XCircle,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { CadencePicker } from "@/components/app/cadence-picker";
import { BrandEditor } from "@/components/app/brand-editor";

export const metadata = { title: "Project detail" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const project = await db.project.findFirst({
    where: { id, ownerId: user.id },
    include: {
      audits: { orderBy: { createdAt: "desc" }, take: 25 },
      tasks: { orderBy: { createdAt: "desc" }, take: 25 },
      _count: { select: { audits: true, tasks: true } },
    },
  });
  if (!project) notFound();

  const completed = project.audits.filter((a) => a.status === "COMPLETED");
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length,
        )
      : null;
  const latest = completed[0];

  return (
    <>
      <AppTopbar title={project.name} />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
          >
            <ArrowLeft size={12} weight="bold" />
            All projects
          </Link>

          {/* header */}
          <div className="mt-7 flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0 flex-1">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Project
              </span>
              <h1 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
                {project.name}
              </h1>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block font-mono text-[12px] tracking-[0.08em] text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
              >
                {project.url} ↗
              </a>
              {project.description && (
                <p className="mt-5 text-fg-muted text-[15px] leading-[1.65] max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>

            <Link
              href={`/audit/new?projectId=${project.id}`}
              className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] shadow-[0_4px_14px_-4px_rgb(255_26_110/_0.4)]"
            >
              <Sparkle size={14} weight="fill" />
              Audit this project
            </Link>
          </div>

          {/* stat band */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]">
            <Stat label="Audits" value={project._count.audits} />
            <Stat label="Avg score" value={avgScore ?? "—"} accent />
            <Stat label="Latest grade" value={latest?.grade ?? "—"} />
            <Stat label="Open tasks" value={project.tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length} />
          </div>

          {/* cadence picker */}
          <div className="mt-10">
            <CadencePicker
              projectId={project.id}
              initialCadence={project.cadence}
              initialNextRunAt={
                project.nextRunAt
                  ? project.nextRunAt.toISOString()
                  : null
              }
            />
          </div>

          {/* brand editor */}
          <div className="mt-6">
            <BrandEditor
              projectId={project.id}
              initial={{
                brandName: project.brandName,
                brandColor: project.brandColor,
                brandLogoUrl: project.brandLogoUrl,
              }}
            />
          </div>

          {/* audits table */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Audit history
              </span>
            </div>

            {project.audits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-10 text-center">
                <p className="text-fg-muted text-[14px] mb-5">
                  No audits run for this project yet.
                </p>
                <Link
                  href={`/audit/new?projectId=${project.id}`}
                  className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
                >
                  <Plus size={14} weight="bold" />
                  Run first audit
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden">
                {project.audits.map((a, i) => (
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
                          {a.agent} · {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {a.status === "COMPLETED" ? (
                      <div className="text-right shrink-0">
                        <div className="font-display font-extrabold text-[20px] leading-none tabular-nums">
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

          {/* tasks */}
          {project.tasks.length > 0 && (
            <div className="mt-14">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Tasks
              </span>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["TODO", "IN_PROGRESS", "DONE"] as const).map((col) => {
                  const tasks = project.tasks.filter((t) => t.status === col);
                  return (
                    <div
                      key={col}
                      className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4"
                    >
                      <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted mb-3 px-1">
                        {col === "TODO"
                          ? "To do"
                          : col === "IN_PROGRESS"
                            ? "In progress"
                            : "Done"}
                        <span className="ml-2 text-fg-faint">{tasks.length}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {tasks.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3"
                          >
                            <div className="text-[13px] font-medium leading-snug">
                              {t.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[color:var(--color-surface)] p-5 sm:p-6">
      <div
        className="font-display font-extrabold text-[28px] sm:text-[32px] leading-none tabular-nums"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-fg)" }}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
        {label}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "COMPLETED"
      ? "var(--color-pass)"
      : status === "FAILED"
        ? "var(--color-crit)"
        : status === "RUNNING"
          ? "var(--color-accent)"
          : "var(--color-fg-faint)";
  const Icon =
    status === "COMPLETED"
      ? CheckCircle
      : status === "FAILED"
        ? XCircle
        : WarningCircle;
  return (
    <Icon
      size={16}
      weight="fill"
      style={{ color, flexShrink: 0 }}
    />
  );
}
