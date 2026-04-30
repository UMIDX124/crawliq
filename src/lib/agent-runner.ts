import type { AgentType, Severity } from "@prisma/client";
import { getGroq, GROQ_MODEL } from "@/lib/groq";
import { crawlSite, buildAuditPrompt, type CrawlSignals } from "@/lib/audit";
import { AGENTS } from "@/lib/agents";

/**
 * Deterministic 32-bit hash from a string.
 * Used to derive a stable Groq seed per (URL, agent) so the same audit
 * inputs produce the same outputs across runs.
 */
function stableSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Groq accepts unsigned 32-bit
  return h >>> 0;
}

export type AgentJsonFinding = {
  title: string;
  severity: "critical" | "warning" | "pass";
  detail: string;
  category: string;
};

export type AgentJsonResult = {
  score: number;
  grade: string;
  summary: string;
  findings: AgentJsonFinding[];
  quickWins: string[];
};

export function severityToEnum(s: AgentJsonFinding["severity"]): Severity {
  if (s === "critical") return "CRITICAL";
  if (s === "warning") return "WARNING";
  return "PASS";
}

/**
 * Runs a single AI auditor in streaming mode.
 * Yields raw text chunks as they arrive so the API route can forward via SSE.
 * Returns the final parsed AgentJsonResult plus the raw response.
 */
export async function* runAgentStream(opts: {
  agent: AgentType;
  signals: CrawlSignals;
}): AsyncGenerator<
  { type: "delta"; chunk: string },
  { result: AgentJsonResult | null; raw: string },
  void
> {
  const def = AGENTS[opts.agent];
  const groq = getGroq();
  const seed = stableSeed(`${opts.signals.finalUrl}::${opts.agent}`);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0,
    top_p: 1,
    max_tokens: 2200,
    response_format: { type: "json_object" },
    seed,
    stream: true,
    messages: [
      { role: "system", content: def.systemPrompt },
      { role: "user", content: buildAuditPrompt(opts.signals) },
    ],
  });

  let raw = "";
  for await (const part of completion) {
    const delta = part.choices?.[0]?.delta?.content ?? "";
    if (delta) {
      raw += delta;
      yield { type: "delta", chunk: delta };
    }
  }

  let result: AgentJsonResult | null = null;
  try {
    const parsed = JSON.parse(raw) as AgentJsonResult;
    result = sanitizeResult(parsed);
  } catch {
    /* fall back to null — caller decides */
  }

  return { result, raw };
}

function sanitizeResult(r: AgentJsonResult): AgentJsonResult {
  const score = Number.isFinite(r.score) ? Math.max(0, Math.min(100, Math.round(r.score))) : 0;
  return {
    score,
    grade: typeof r.grade === "string" ? r.grade : computeGrade(score),
    summary: typeof r.summary === "string" ? r.summary : "",
    findings: Array.isArray(r.findings)
      ? r.findings
          .filter((f): f is AgentJsonFinding => !!f && typeof f === "object")
          .map((f) => ({
            title: String(f.title ?? ""),
            severity:
              f.severity === "critical" || f.severity === "warning" || f.severity === "pass"
                ? f.severity
                : "warning",
            detail: String(f.detail ?? ""),
            category: String(f.category ?? "on-page"),
          }))
      : [],
    quickWins: Array.isArray(r.quickWins)
      ? r.quickWins.filter((q): q is string => typeof q === "string")
      : [],
  };
}

function computeGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 88) return "A";
  if (score >= 78) return "B";
  if (score >= 68) return "C";
  if (score >= 55) return "D";
  return "F";
}

export { crawlSite };
