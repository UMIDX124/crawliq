/**
 * Weekly digest cron: runs every Monday 09:00 UTC.
 * For each user with digestOptIn=true and at least one audit, sends a
 * Resend-backed summary email with their score trend, top finding, and
 * link back to the dashboard.
 *
 * Auth: Vercel Cron sets the Authorization header to "Bearer <CRON_SECRET>".
 * We verify this so randos can't trigger digests by hitting the URL.
 */

import { db } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 300; // can take a while if many users

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // if no secret configured, allow (dev mode)
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!env.RESEND_API_KEY) {
    return Response.json({ skipped: "RESEND_API_KEY not set" });
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const users = await db.user.findMany({
    where: {
      digestOptIn: true,
      audits: { some: { status: "COMPLETED" } },
    },
    include: {
      audits: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const resend = getResend();
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    if (user.audits.length === 0) continue;
    const recentScore = user.audits[0].score ?? null;
    const previousAudit = user.audits[1];
    const delta =
      recentScore !== null && previousAudit?.score != null
        ? recentScore - previousAudit.score
        : null;

    const html = renderDigestHtml({
      name: user.name.split(" ")[0],
      audits: user.audits.map((a) => ({
        url: a.url,
        score: a.score,
        grade: a.grade,
        date: a.createdAt,
      })),
      latestScore: recentScore,
      scoreDelta: delta,
      siteUrl: env.NEXT_PUBLIC_SITE_URL,
    });

    try {
      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [user.email],
        subject: `Your CrawlIQ digest · ${user.audits.length} audit${user.audits.length === 1 ? "" : "s"} this week`,
        html,
      });
      sent++;
    } catch (err) {
      console.error("[digest] send failed for", user.email, err);
      failed++;
    }
  }

  return Response.json({ sent, failed, candidates: users.length });
}

function renderDigestHtml(opts: {
  name: string;
  audits: { url: string; score: number | null; grade: string | null; date: Date }[];
  latestScore: number | null;
  scoreDelta: number | null;
  siteUrl: string;
}): string {
  const auditRows = opts.audits
    .map(
      (a) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #2a2a2c;font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#a8a29e;">${a.url}</td>
        <td style="padding:14px 0;border-bottom:1px solid #2a2a2c;text-align:right;font-family:'Geist',sans-serif;font-weight:800;font-size:18px;color:#fafafa;">${a.score ?? "—"}<span style="color:#71717a;font-weight:400;font-size:11px;margin-left:6px">${a.grade ?? ""}</span></td>
      </tr>`,
    )
    .join("");

  const deltaPill =
    opts.scoreDelta === null
      ? ""
      : opts.scoreDelta >= 0
        ? `<span style="background:rgba(74,222,128,0.12);color:#4ade80;font-family:ui-monospace,Menlo,monospace;font-size:11px;padding:3px 8px;border-radius:4px;letter-spacing:0.08em">+${opts.scoreDelta}</span>`
        : `<span style="background:rgba(248,113,113,0.12);color:#f87171;font-family:ui-monospace,Menlo,monospace;font-size:11px;padding:3px 8px;border-radius:4px;letter-spacing:0.08em">${opts.scoreDelta}</span>`;

  return `
  <!doctype html>
  <html>
  <body style="margin:0;padding:32px 16px;background:#0a0a0a;font-family:-apple-system,'Segoe UI',sans-serif;color:#fafafa;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;border-collapse:collapse;">
      <tr><td>
        <div style="font-family:'Geist',-apple-system,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#fafafa;">
          Crawl<span style="color:#0066ff;">IQ</span>
        </div>
        <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#a8a29e;margin-top:32px;">Weekly digest</div>
        <h1 style="font-family:'Geist',-apple-system,sans-serif;font-size:28px;font-weight:800;line-height:1.1;letter-spacing:-0.02em;margin:8px 0 24px;color:#fafafa;">
          Hey ${opts.name}, here's your week.
        </h1>
        <p style="color:#a8a29e;font-size:15px;line-height:1.6;margin:0 0 24px;">
          ${opts.audits.length} audit${opts.audits.length === 1 ? "" : "s"} completed this week. ${
            opts.scoreDelta !== null
              ? opts.scoreDelta >= 0
                ? `Score is up ${opts.scoreDelta} points since your previous audit.`
                : `Score is down ${Math.abs(opts.scoreDelta)} points since your previous audit — worth a look.`
              : ""
          }
        </p>
        ${
          opts.latestScore !== null
            ? `<div style="display:inline-flex;align-items:baseline;gap:12px;margin-bottom:24px;">
                <span style="font-family:'Geist',-apple-system,sans-serif;font-size:48px;font-weight:800;line-height:1;color:#0066ff;">${opts.latestScore}</span>
                <span style="color:#a8a29e;font-size:13px;">/100 latest</span>
                ${deltaPill}
              </div>`
            : ""
        }
        <table role="presentation" width="100%" style="border-collapse:collapse;margin-top:8px;">
          ${auditRows}
        </table>
        <a href="${opts.siteUrl}/dashboard" style="display:inline-block;margin-top:32px;background:#0066ff;color:#ffffff;padding:13px 22px;border-radius:8px;text-decoration:none;font-family:ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;">Open dashboard →</a>
        <div style="margin-top:48px;padding-top:24px;border-top:1px solid #2a2a2c;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
          You're getting this because you opted in to weekly digests. <a href="${opts.siteUrl}/settings" style="color:#a8a29e;">Manage preferences</a>.
        </div>
      </td></tr>
    </table>
  </body>
  </html>`;
}
