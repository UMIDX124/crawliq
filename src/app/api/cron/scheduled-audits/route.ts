/**
 * Scheduled audits cron: runs hourly.
 * Finds projects with `cadence != 'off'` and `nextRunAt <= now`, runs an
 * audit for each, then advances `nextRunAt` based on cadence.
 *
 * Auth: same Vercel-Cron Authorization Bearer pattern as digest.
 */

import { db } from "@/lib/db";
import { runAllChecks } from "@/lib/checks";
import { runAgentStream, severityToEnum } from "@/lib/agent-runner";
import { getResend } from "@/lib/resend";
import { env } from "@/lib/env";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function nextRunAtFor(cadence: string, from: Date): Date | null {
  const next = new Date(from);
  if (cadence === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }
  if (cadence === "monthly") {
    next.setMonth(next.getMonth() + 1);
    return next;
  }
  return null;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = new Date();

  const projects = await db.project.findMany({
    where: {
      cadence: { in: ["weekly", "monthly"] },
      nextRunAt: { lte: now },
    },
    take: 50, // safety cap per run
  });

  let ran = 0;
  let failed = 0;

  for (const project of projects) {
    try {
      const audit = await db.audit.create({
        data: {
          url: project.url,
          agent: "TECHNICAL",
          status: "RUNNING",
          startedAt: new Date(),
          userId: project.ownerId,
          projectId: project.id,
        },
      });

      const checks = await runAllChecks(project.url);
      await db.audit.update({
        where: { id: audit.id },
        data: {
          signals: {
            crawl: checks.crawl,
            lighthouse: checks.lighthouse,
            security: checks.security,
            schema: checks.schema,
            crux: checks.crux,
            wayback: checks.wayback,
            openPageRank: checks.openPageRank,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      const gen = runAgentStream({
        agent: "TECHNICAL",
        url: project.url,
      });
      let finalResult = null;
      while (true) {
        const next = await gen.next();
        if (next.done) {
          finalResult = next.value.result;
          break;
        }
      }

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

        // Score-drop alert: compare to previous completed audit on this project
        const previous = await db.audit.findFirst({
          where: {
            projectId: project.id,
            status: "COMPLETED",
            id: { not: audit.id },
            score: { not: null },
          },
          orderBy: { createdAt: "desc" },
          select: { score: true },
        });
        if (
          env.RESEND_API_KEY &&
          previous?.score != null &&
          finalResult.score < previous.score - 10
        ) {
          const owner = await db.user.findUnique({
            where: { id: project.ownerId },
            select: { email: true, name: true },
          });
          if (owner?.email) {
            try {
              const resend = getResend();
              await resend.emails.send({
                from: env.RESEND_FROM_EMAIL,
                to: [owner.email],
                subject: `Score dropped: ${project.name} now ${finalResult.score}/100 (was ${previous.score})`,
                text: `Hey ${owner.name.split(" ")[0]},\n\nScheduled audit on ${project.name} just dropped from ${previous.score} to ${finalResult.score} — a ${previous.score - finalResult.score}-point decline.\n\nOpen the report:\n${env.NEXT_PUBLIC_SITE_URL}/audit/${audit.id}\n\n— CrawlIQ`,
              });
            } catch (err) {
              console.error("[scheduled-audits] alert email failed:", err);
            }
          }
        }
      } else {
        await db.audit.update({
          where: { id: audit.id },
          data: { status: "FAILED", endedAt: new Date(), errorMsg: "no result" },
        });
      }

      // advance schedule
      await db.project.update({
        where: { id: project.id },
        data: {
          nextRunAt: nextRunAtFor(project.cadence, now),
        },
      });
      ran++;
    } catch (err) {
      console.error("[scheduled-audits] failed for", project.id, err);
      failed++;
    }
  }

  return Response.json({ ran, failed, eligible: projects.length });
}
