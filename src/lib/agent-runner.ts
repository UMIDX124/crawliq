import type { AgentType, Severity as PrismaSeverity } from "@prisma/client";
import { getGroq, GROQ_MODEL } from "@/lib/groq";
import { runAllChecks } from "@/lib/checks";
import {
  buildFindings,
  scoreFindings,
  gradeFromScore,
  type StructuredFinding,
} from "@/lib/checks/findings";
import { AGENTS } from "@/lib/agents";
import type { CrawlSignals } from "@/lib/audit";

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

export function severityToEnum(s: AgentJsonFinding["severity"]): PrismaSeverity {
  if (s === "critical") return "CRITICAL";
  if (s === "warning") return "WARNING";
  return "PASS";
}

/**
 * Deterministic 32-bit hash from a string.
 */
function stableSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * NEW ENGINE
 *
 * 1. Run real deterministic checks (PageSpeed, security headers, schema, crawl)
 * 2. Build structured findings from check data — title + severity + evidence
 *    are computed from real numbers, never invented
 * 3. LLM is called ONCE per audit to produce two things:
 *    - A 2-3 sentence overall `summary`
 *    - A short `detail` paragraph for each finding (explanation + how-to-fix)
 *    - 3-5 `quickWins`
 * 4. Score is computed deterministically from finding severities
 *
 * The LLM cannot change the score, the severity, or invent findings.
 */
export async function* runAgentStream(opts: {
  agent: AgentType;
  signals?: CrawlSignals; // back-compat: ignored — we now run our own checks
  url?: string;
}): AsyncGenerator<
  { type: "delta"; chunk: string; phase?: "checks" | "explain" }
  | { type: "phase"; phase: "checks" | "explain"; message?: string },
  { result: AgentJsonResult | null; raw: string },
  void
> {
  const url = opts.url ?? opts.signals?.finalUrl;
  if (!url) {
    return { result: null, raw: "" };
  }

  // === PHASE 1: deterministic checks ===
  yield { type: "phase", phase: "checks", message: "Running real-data checks…" };

  const checks = await runAllChecks(url);
  const findings = buildFindings(opts.agent, checks);

  if (findings.length === 0) {
    return { result: null, raw: "" };
  }

  const score = scoreFindings(findings);
  const grade = gradeFromScore(score);

  // === PHASE 2: LLM writes prose for each real finding ===
  yield {
    type: "phase",
    phase: "explain",
    message: "AI auditor writing explanations…",
  };

  const def = AGENTS[opts.agent];
  const groq = getGroq();
  const seed = stableSeed(`${url}::${opts.agent}`);

  const userMessage = buildExplanationPrompt(findings);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0,
    top_p: 1,
    max_tokens: 2400,
    response_format: { type: "json_object" },
    seed,
    stream: true,
    messages: [
      {
        role: "system",
        content: `${def.systemPrompt}\n\n${EXPLAINER_SYSTEM_PROMPT}`,
      },
      { role: "user", content: userMessage },
    ],
  });

  let raw = "";
  for await (const part of completion) {
    const delta = part.choices?.[0]?.delta?.content ?? "";
    if (delta) {
      raw += delta;
      yield { type: "delta", chunk: delta, phase: "explain" };
    }
  }

  // === Merge LLM prose with real findings ===
  type LlmResponse = {
    summary?: string;
    explanations?: Record<string, string>;
    quickWins?: string[];
  };

  let llm: LlmResponse = {};
  try {
    llm = JSON.parse(raw) as LlmResponse;
  } catch {
    /* if LLM fails we still ship findings with placeholder details */
  }

  const summary =
    typeof llm.summary === "string" && llm.summary.trim()
      ? llm.summary
      : defaultSummary(findings, score);

  const explanations = llm.explanations ?? {};
  const merged: AgentJsonFinding[] = findings.map((f) => ({
    title: f.title,
    severity: f.severity,
    category: f.category,
    detail: explanations[f.id] ?? defaultDetail(f),
  }));

  const result: AgentJsonResult = {
    score,
    grade,
    summary,
    findings: merged,
    quickWins: Array.isArray(llm.quickWins)
      ? llm.quickWins.filter((q): q is string => typeof q === "string").slice(0, 5)
      : defaultQuickWins(findings),
  };

  return { result, raw };
}

/* ========================================================================== */
/* prompts + defaults                                                         */
/* ========================================================================== */

const EXPLAINER_SYSTEM_PROMPT = `You write the explanation prose for an AI website audit. The findings, severities, and categories have ALREADY been computed deterministically from real data — you do NOT invent them, change severities, or add new findings.

Your job: for each finding ID provided, write a one-paragraph explanation (3-5 sentences) covering:
1. WHY this finding matters for SEO / performance / accessibility / business outcomes
2. WHAT specifically to fix (concrete action grounded in the evidence)
3. Optionally HOW (a one-line implementation hint)

Hard rules:
- Output ONLY valid JSON.
- Do NOT modify finding titles, severities, or categories.
- Do NOT invent metrics, scores, percentages, or numbers not present in the evidence.
- For findings whose ID indicates "lh-*" (Lighthouse audits), you may quote the displayValue or msSavings from evidence verbatim.
- Be specific. Avoid generic SEO advice.
- For OFFSITE/COMPETITOR findings flagged as "inference" — be honest that real data requires API integration; do not pretend otherwise.

Output schema (exactly this shape):
{
  "summary": "<2-3 sentence overall verdict for this audit>",
  "explanations": {
    "<finding_id>": "<one paragraph explanation>",
    ...
  },
  "quickWins": [
    "<short imperative action a developer can do today>"
  ]
}

You will receive a JSON list of findings. Reply with explanations keyed by their IDs.`;

function buildExplanationPrompt(findings: StructuredFinding[]): string {
  const slim = findings.map((f) => ({
    id: f.id,
    category: f.category,
    severity: f.severity,
    title: f.title,
    evidence: f.evidence,
  }));
  return `Findings (${findings.length}):\n\n${JSON.stringify(slim, null, 2)}\n\nWrite explanations for each finding ID above.`;
}

function defaultSummary(findings: StructuredFinding[], score: number): string {
  const crit = findings.filter((f) => f.severity === "critical").length;
  const warn = findings.filter((f) => f.severity === "warning").length;
  const pass = findings.filter((f) => f.severity === "pass").length;
  return `Audited with ${findings.length} structured checks. Score ${score}/100 — ${crit} critical, ${warn} warning, ${pass} passing.`;
}

function defaultDetail(f: StructuredFinding): string {
  const ev = Object.entries(f.evidence)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${String(v).slice(0, 120)}`)
    .join(" · ");
  return ev || "Sourced from real check data.";
}

function defaultQuickWins(findings: StructuredFinding[]): string[] {
  return findings
    .filter((f) => f.severity === "critical")
    .slice(0, 4)
    .map((f) => `Fix: ${f.title}`);
}

/* re-export for back-compat with existing API route imports */
export { runAllChecks as crawlSite };
