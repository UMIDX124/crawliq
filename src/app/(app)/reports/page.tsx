import Link from "next/link";
import { AppTopbar } from "@/components/app/topbar";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const user = await requireUser();
  const audits = await db.audit.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { project: true },
  });

  return (
    <>
      <AppTopbar title="Reports" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div>
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              Workspace
            </span>
            <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
              Reports.
            </h2>
            <p className="mt-3 text-fg-muted text-[15px] leading-[1.65] max-w-xl">
              Every completed audit, ready to view or export as a white-label
              PDF.
            </p>
          </div>

          {audits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden">
              {audits.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/audit/${a.id}`}
                  className={`flex items-center justify-between gap-4 px-6 py-5 hover:bg-[color:var(--color-bg-2)] transition-colors ${
                    i > 0 ? "border-t border-[color:var(--color-border)]" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium truncate">
                      {a.url}
                    </div>
                    <div className="mt-1 flex items-center gap-3 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                      <span>{a.agent}</span>
                      <span>·</span>
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      {a.project && (
                        <>
                          <span>·</span>
                          <span>{a.project.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-extrabold text-[22px] leading-none tabular-nums">
                      {a.score ?? "—"}
                    </div>
                    <div className="mt-1 font-mono text-[10px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
                      {a.grade ?? "—"}
                    </div>
                  </div>
                </Link>
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
      <FileText size={32} weight="duotone" className="text-fg-faint mb-5" />
      <h3 className="font-display font-bold text-[17px]">No reports yet</h3>
      <p className="mt-2 text-fg-muted text-[14px] leading-[1.6] max-w-sm">
        Run an audit and the completed report will appear here.
      </p>
    </div>
  );
}
