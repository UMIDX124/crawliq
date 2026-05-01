import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { runAgentStream, severityToEnum } from "@/lib/agent-runner";
import { runAllChecks } from "@/lib/checks";
import { checkAuditLimit } from "@/lib/plan-limits";
import { normalizeUrl, type CrawlSignals } from "@/lib/audit";
import type { AgentType, Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const inputSchema = z.object({
  url: z.string().trim().min(1, "URL is required"),
  agent: z.enum(["ONPAGE", "TECHNICAL", "CONTENT", "OFFSITE", "COMPETITOR"]),
  projectId: z.string().optional(),
  scope: z.enum(["single", "multi"]).optional().default("single"),
  maxPages: z.number().int().min(2).max(25).optional(),
});

type SseEvent =
  | { type: "status"; phase: "checks" | "explain" | "saving" | "done" | "error"; message: string }
  | { type: "audit"; auditId: string }
  | { type: "signals"; signals: CrawlSignals }
  | { type: "lighthouse"; scores: Record<string, number | null> }
  | { type: "delta"; chunk: string }
  | { type: "result"; raw: string }
  | { type: "limit"; remaining: number | null; plan: string }
  | { type: "error"; message: string };

function sse(e: SseEvent) {
  return `data: ${JSON.stringify(e)}\n\n`;
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkAuditLimit(user);
  if (!limit.ok) {
    return Response.json(
      {
        error: `You've used all ${limit.limit} audits on the Free plan this month.`,
        plan: limit.plan,
        resetAt: limit.resetAt.toISOString(),
      },
      { status: 402 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const url = normalizeUrl(parsed.data.url);
  const { agent, projectId, scope, maxPages } = parsed.data;

  const audit = await db.audit.create({
    data: {
      url,
      agent,
      scope,
      status: "PENDING",
      userId: user.id,
      projectId: projectId ?? null,
    },
  });

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (e: SseEvent) => controller.enqueue(enc.encode(sse(e)));

      try {
        send({ type: "audit", auditId: audit.id });
        send({
          type: "limit",
          remaining: limit.remaining,
          plan: limit.plan,
        });

        await db.audit.update({
          where: { id: audit.id },
          data: { status: "RUNNING", startedAt: new Date() },
        });

        // === Phase 1: real checks (crawl + PageSpeed + security + schema) ===
        send({
          type: "status",
          phase: "checks",
          message: `Running real-data checks on ${url}…`,
        });

        const checks = await runAllChecks(url, { scope, maxPages }).catch(
          (err) => {
            throw new Error(
              err instanceof Error ? err.message : "Failed during checks phase",
            );
          },
        );

        send({ type: "signals", signals: checks.crawl });
        if (checks.lighthouse) {
          send({
            type: "lighthouse",
            scores: checks.lighthouse.scores,
          });
        }

        await db.audit.update({
          where: { id: audit.id },
          data: {
            pageCount: checks.multiPage?.pagesSucceeded ?? 1,
            signals: {
              crawl: checks.crawl,
              lighthouse: checks.lighthouse,
              security: checks.security,
              schema: checks.schema,
              crux: checks.crux,
              wayback: checks.wayback,
              openPageRank: checks.openPageRank,
              multiPage: checks.multiPage,
            } as unknown as Prisma.InputJsonValue,
          },
        });

        // === Phase 2: LLM explainer ===
        send({
          type: "status",
          phase: "explain",
          message: `${agent} auditor writing explanations for verified findings…`,
        });

        const gen = runAgentStream({
          agent: agent as AgentType,
          url,
          scope,
          maxPages,
        });
        let raw = "";
        let finalResult = null;
        while (true) {
          const next = await gen.next();
          if (next.done) {
            finalResult = next.value.result;
            raw = next.value.raw;
            break;
          }
          const v = next.value;
          if (v.type === "delta") {
            send({ type: "delta", chunk: v.chunk });
          }
          // (we already sent our own status events)
        }

        send({ type: "result", raw });
        send({ type: "status", phase: "saving", message: "Saving findings…" });

        if (finalResult) {
          await db.audit.update({
            where: { id: audit.id },
            data: {
              status: "COMPLETED",
              score: finalResult.score,
              grade: finalResult.grade,
              summary: finalResult.summary,
              data: finalResult as unknown as Prisma.InputJsonValue,
              endedAt: new Date(),
            },
          });
          if (finalResult.findings.length > 0) {
            await db.finding.createMany({
              data: finalResult.findings.map((f) => ({
                auditId: audit.id,
                title: f.title,
                detail: f.detail,
                category: f.category,
                severity: severityToEnum(f.severity),
              })),
            });
          }
        } else {
          await db.audit.update({
            where: { id: audit.id },
            data: {
              status: "FAILED",
              errorMsg: "Audit produced no findings",
              endedAt: new Date(),
            },
          });
        }

        send({ type: "status", phase: "done", message: "Audit complete." });
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unexpected error.";
        await db.audit
          .update({
            where: { id: audit.id },
            data: { status: "FAILED", errorMsg: msg, endedAt: new Date() },
          })
          .catch(() => {});
        send({ type: "error", message: msg });
        send({ type: "status", phase: "error", message: msg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const audits = await db.audit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { project: true },
  });
  return Response.json({ audits });
}
