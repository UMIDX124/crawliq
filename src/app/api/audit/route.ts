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
