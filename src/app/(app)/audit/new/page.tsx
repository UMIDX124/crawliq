import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { checkAuditLimit } from "@/lib/plan-limits";
import { AGENTS, ALL_AGENT_TYPES } from "@/lib/agents";
import { db } from "@/lib/db";
import { NewAuditClient } from "./new-audit-client";

export const metadata = { title: "Run audit" };

export default async function NewAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await searchParams;
  const [limit, projects] = await Promise.all([
    checkAuditLimit(user),
    db.project.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, url: true },
    }),
  ]);

  // pre-fill URL if a valid projectId is passed
  let prefillUrl = "";
  if (projectId) {
    const found = projects.find((p) => p.id === projectId);
    if (found) prefillUrl = found.url;
  }

  return (
    <>
      <AppTopbar title="Run audit" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <NewAuditClient
            agents={ALL_AGENT_TYPES.map((t) => ({
              type: t,
              name: AGENTS[t].name,
              shortName: AGENTS[t].shortName,
              description: AGENTS[t].description,
            }))}
            projects={projects}
            initialProjectId={projectId ?? null}
            initialUrl={prefillUrl}
            limit={
              limit.ok
                ? { remaining: limit.remaining, plan: limit.plan }
                : { exceeded: true, plan: limit.plan, limit: limit.limit }
            }
          />
        </div>
      </main>
    </>
  );
}
