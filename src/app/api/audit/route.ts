import { NextRequest } from "next/server";
import { getGroq, GROQ_MODEL } from "@/lib/groq";
import {
  auditInputSchema,
  crawlSite,
  buildAuditPrompt,
  AUDIT_SYSTEM_PROMPT,
  type CrawlSignals,
} from "@/lib/audit";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isAgentsHubConfigured, streamAudit } from "@/lib/agents-hub-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SseEvent =
  | { type: "status"; phase: "crawling" | "analyzing" | "done" | "error"; message: string }
  | { type: "signals"; signals: CrawlSignals }
  | { type: "delta"; chunk: string }
  | { type: "result"; raw: string }
  | { type: "error"; message: string };

function sse(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit({
    key: `audit:${ip}`,
    windowSec: 60 * 60,
    max: 5,
  });

  if (!rl.ok) {
    return Response.json(
      {
        error: "Rate limit exceeded. Try again in an hour.",
        resetAt: rl.resetAt,
      },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = auditInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { url } = parsed.data;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (e: SseEvent) => controller.enqueue(enc.encode(sse(e)));

      // AGENTS-HUB proxy branch: when configured, the upstream emits the v1
      // contract events (agent.start / agent.line / agent.score / finding /
      // complete / error). We translate them into CrawlIQ's existing SSE
      // shape so InlineAudit keeps rendering unchanged AND the on-screen UX
      // matches the local-fallback path 1-for-1.
      if (isAgentsHubConfigured()) {
        const PILLAR_LABEL: Record<string, string> = {
          "on-page": "On-Page",
          technical: "Technical",
          content: "Content",
          "off-site": "Off-Site",
          competitor: "Competitor",
        };
        const grade = (n: number): "A+" | "A" | "B" | "C" | "D" | "F" =>
          n >= 95 ? "A+" : n >= 85 ? "A" : n >= 75 ? "B" : n >= 65 ? "C" : n >= 50 ? "D" : "F";
        const sevToLocal = (s: "critical" | "warn" | "win"): "critical" | "warning" | "pass" =>
          s === "critical" ? "critical" : s === "warn" ? "warning" : "pass";
        const pillarToCategory = (
          p: string,
        ): "on-page" | "technical" | "content" | "performance" | "accessibility" => {
          if (p === "on-page" || p === "technical" || p === "content") return p;
          // off-site + competitor map to "content" so the local UI's category
          // taxonomy keeps working (UI doesn't render off-site/competitor yet).
          return "content";
        };

        try {
          send({
            type: "status",
            phase: "crawling",
            message: `Fetching ${url} via AGENTS-HUB`,
          });

          for await (const ev of streamAudit(url, { depth: "teaser" })) {
            if (ev.type === "agent.start") {
              send({
                type: "status",
                phase: "analyzing",
                message: `Auditor: ${PILLAR_LABEL[ev.pillar] ?? ev.pillar}`,
              });
            } else if (ev.type === "agent.line") {
              // Real measured signal text — stream it as a delta so the
              // user sees the "thinking" output exactly like the local path.
              send({ type: "delta", chunk: `${ev.text}\n` });
            } else if (ev.type === "agent.score") {
              send({
                type: "status",
                phase: "analyzing",
                message: `${PILLAR_LABEL[ev.pillar] ?? ev.pillar}: ${ev.value}/100`,
              });
            } else if (ev.type === "finding") {
              // Stream each finding line so the streaming view shows progress.
              const f = ev.finding;
              send({
                type: "delta",
                chunk: `[${f.severity.toUpperCase()}] ${f.title} — signal: ${f.signal}\n`,
              });
            } else if (ev.type === "complete") {
              // Translate v1 AuditResult → local AuditPayload shape so the
              // UI's JSON.parse(raw) continues to render correctly.
              const r = ev.result;
              const localFindings = r.findings.map((f) => ({
                title: f.title,
                severity: sevToLocal(f.severity),
                detail: f.body,
                category: pillarToCategory(f.pillar),
                signal: f.signal,
                source: f.source,
              }));
              const wins = r.findings
                .filter((f) => f.severity === "win")
                .slice(0, 5)
                .map((f) => f.title);
              const summary =
                `Audit of ${r.finalUrl} — overall ${r.overall}/100 across ${r.scores.length} pillars. ` +
                `${r.findings.filter((f) => f.severity === "critical").length} critical, ` +
                `${r.findings.filter((f) => f.severity === "warn").length} warnings, ` +
                `${r.findings.filter((f) => f.severity === "win").length} wins.`;
              const payload = {
                score: r.overall,
                grade: grade(r.overall),
                summary,
                findings: localFindings,
                quickWins: wins,
                source: r.source, // surfaces "agents-hub" so the UI can show provenance later
              };
              send({ type: "result", raw: JSON.stringify(payload) });
              send({ type: "status", phase: "done", message: "Audit complete." });
            } else if (ev.type === "error") {
              send({ type: "error", message: ev.message });
              send({ type: "status", phase: "error", message: ev.message });
            }
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "AGENTS-HUB upstream failed.";
          send({ type: "error", message });
          send({ type: "status", phase: "error", message });
        }
        controller.close();
        return;
      }

      try {
        send({ type: "status", phase: "crawling", message: `Fetching ${url}` });

        let signals: CrawlSignals;
        try {
          signals = await crawlSite(url);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch the URL.";
          send({ type: "error", message });
          send({
            type: "status",
            phase: "error",
            message: "Could not reach the site. Check the URL and try again.",
          });
          controller.close();
          return;
        }

        send({ type: "signals", signals });
        send({
          type: "status",
          phase: "analyzing",
          message: "Five auditors analyzing crawl signals…",
        });

        const groq = getGroq();
        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          temperature: 0.2,
          max_tokens: 2200,
          response_format: { type: "json_object" },
          stream: true,
          messages: [
            { role: "system", content: AUDIT_SYSTEM_PROMPT },
            { role: "user", content: buildAuditPrompt(signals) },
          ],
        });

        let raw = "";
        for await (const part of completion) {
          const delta = part.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            raw += delta;
            send({ type: "delta", chunk: delta });
          }
        }

        send({ type: "result", raw });
        send({ type: "status", phase: "done", message: "Audit complete." });
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unexpected error.";
        send({ type: "error", message });
        send({ type: "status", phase: "error", message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
