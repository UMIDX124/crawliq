import { notFound } from "next/navigation";
import Link from "next/link";
import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

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
    include: { project: true, findings: true },
  });
  if (!audit) notFound();

  return (
    <>
      <AppTopbar title="Audit detail" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
          >
            <ArrowLeft size={12} weight="bold" />
            All reports
          </Link>

          <div className="mt-7">
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              {audit.agent}
            </span>
            <h1 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em] break-all">
              {audit.url}
            </h1>
            <div className="mt-3 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
              Audited{" "}
              {audit.endedAt
                ? new Date(audit.endedAt).toLocaleString()
                : new Date(audit.createdAt).toLocaleString()}
              {audit.project ? ` · ${audit.project.name}` : ""}
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
            <p className="text-fg-muted text-[14.5px] leading-[1.6]">
              Full audit detail view (signals grid, findings list, PDF export)
              ships in Phase 3. The audit data is already stored — score{" "}
              <span className="font-display font-bold text-fg">
                {audit.score ?? "—"}
              </span>{" "}
              · {audit.findings.length} findings.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
