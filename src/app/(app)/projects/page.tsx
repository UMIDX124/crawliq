import { AppTopbar } from "@/components/app/topbar";
import { Plus, FolderOpen } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await db.project.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { audits: true, tasks: true } } },
  });

  return (
    <>
      <AppTopbar title="Projects" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Workspace
              </span>
              <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
                Projects.
              </h2>
              <p className="mt-3 text-fg-muted text-[15px] leading-[1.65] max-w-xl">
                Group sites, schedule re-audits, share with team members.
              </p>
            </div>

            <button
              type="button"
              className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
            >
              <Plus size={14} weight="bold" />
              New project
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <article
                  key={p.id}
                  className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 hover:border-[color:var(--color-accent)] transition-colors"
                >
                  <h3 className="font-display font-bold text-[16px] mb-1.5">
                    {p.name}
                  </h3>
                  <div className="font-mono text-[11px] text-fg-muted truncate mb-5">
                    {p.url}
                  </div>
                  <div className="flex items-center gap-5 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
                    <span>{p._count.audits} audits</span>
                    <span>{p._count.tasks} tasks</span>
                  </div>
                </article>
              ))}
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
      <FolderOpen size={32} weight="duotone" className="text-fg-faint mb-5" />
      <h3 className="font-display font-bold text-[17px]">No projects yet</h3>
      <p className="mt-2 text-fg-muted text-[14px] leading-[1.6] max-w-sm">
        Create a project to organize your audits, schedule re-runs, and share
        with your team.
      </p>
    </div>
  );
}
