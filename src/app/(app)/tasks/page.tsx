import { AppTopbar } from "@/components/app/topbar";
import { ListChecks } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { TasksBoard } from "./tasks-board";

export const metadata = { title: "Tasks" };

export default async function TasksPage() {
  const user = await requireUser();
  const tasks = await db.task.findMany({
    where: {
      OR: [{ creatorId: user.id }, { assigneeId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: { project: true, audit: { select: { id: true, url: true } } },
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
              <p className="mt-3 text-fg-muted text-[15px] leading-[1.65] max-w-xl">
                Move tasks between columns. Tasks are auto-created from audit
                findings, or you can add them by hand.
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <TasksBoard
              tasks={tasks.map((t) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                projectName: t.project?.name ?? null,
                auditUrl: t.audit?.url ?? null,
              }))}
            />
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
        Open an audit and click &ldquo;Track this&rdquo; on any finding to
        create a task. Or finish a critical finding to mark it done.
      </p>
    </div>
  );
}
