import { AppTopbar } from "@/components/app/topbar";
import { ListChecks, Plus } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata = { title: "Tasks" };

const COLUMNS = [
  { status: "TODO" as const, label: "To do" },
  { status: "IN_PROGRESS" as const, label: "In progress" },
  { status: "DONE" as const, label: "Done" },
];

export default async function TasksPage() {
  const user = await requireUser();
  const tasks = await db.task.findMany({
    where: {
      OR: [{ creatorId: user.id }, { assigneeId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: { project: true },
  });

  return (
    <>
      <AppTopbar title="Tasks" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Workspace
              </span>
              <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
                Tasks.
              </h2>
            </div>
            <button
              type="button"
              className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
            >
              <Plus size={14} weight="bold" />
              New task
            </button>
          </div>

          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.status);
                return (
                  <div
                    key={col.status}
                    className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted">
                        {col.label}
                      </span>
                      <span className="font-mono text-[10.5px] tracking-[0.14em] text-fg-faint">
                        {colTasks.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {colTasks.map((t) => (
                        <article
                          key={t.id}
                          className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3.5"
                        >
                          <div className="text-[13.5px] font-medium leading-snug">
                            {t.title}
                          </div>
                          {t.project && (
                            <div className="mt-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                              {t.project.name}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-12 grid place-items-center text-center">
      <ListChecks size={32} weight="duotone" className="text-fg-faint mb-5" />
      <h3 className="font-display font-bold text-[17px]">No tasks yet</h3>
      <p className="mt-2 text-fg-muted text-[14px] leading-[1.6] max-w-sm">
        Audits create tasks automatically for each finding. Or create one by
        hand.
      </p>
    </div>
  );
}
