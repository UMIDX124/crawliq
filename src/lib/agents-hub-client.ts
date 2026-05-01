/**
 * AGENTS-HUB client — typed wrapper around the public audit API.
 *
 * CrawlIQ is becoming a frontend over the AGENTS-HUB audit engine. This
 * client speaks to a public-facing v1 audit endpoint that AGENTS-HUB needs
 * to expose. Until that endpoint exists, calls fall back to the local
 * cheerio-based teaser audit so demos keep working.
 *
 * Contract is defined here — AGENTS-HUB must conform to it.
 *
 * Required env vars:
 *   AGENTS_HUB_URL          — e.g. "https://agents-hub-fawn.vercel.app"
 *   AGENTS_HUB_PUBLIC_KEY   — public client key (rate-limited, demo-grade)
 *   AGENTS_HUB_INTERNAL_KEY — secret server-to-server key (only set on server)
 */

export type Severity = "critical" | "warn" | "win";
export type Pillar = "on-page" | "technical" | "content" | "off-site" | "competitor";

export type AuditFinding = {
  pillar: Pillar;
  severity: Severity;
  title: string;
  body: string;        // why it matters + how to fix, written as prose
  signal?: string;     // raw measurement (e.g. "title: 78c", "LCP: 3.2s")
};

export type AuditScore = {
  pillar: Pillar;
  value: number;       // 0..100
};

export type AuditResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;   // ISO
  overall: number;     // 0..100, weighted composite
  scores: AuditScore[];
  findings: AuditFinding[];
  source: "agents-hub" | "fallback-cheerio";
};

export type AuditStreamEvent =
  | { type: "agent.start"; pillar: Pillar }
  | { type: "agent.line"; pillar: Pillar; text: string }
  | { type: "agent.score"; pillar: Pillar; value: number }
  | { type: "finding"; finding: AuditFinding }
  | { type: "complete"; result: AuditResult }
  | { type: "error"; message: string };

export type AuditOptions = {
  /** Audit depth — "teaser" returns 3 findings (free), "full" returns everything (paid). */
  depth?: "teaser" | "full";
  /** Optional email to deliver the full PDF to. */
  email?: string;
  /** Idempotency key — same URL + email + day => same result. */
  idempotencyKey?: string;
};

const TIMEOUT_MS = 30_000;

function getBase(): string | null {
  return process.env.AGENTS_HUB_URL?.replace(/\/$/, "") ?? null;
}

function getPublicKey(): string | null {
  return process.env.AGENTS_HUB_PUBLIC_KEY ?? null;
}

function getInternalKey(): string | null {
  return process.env.AGENTS_HUB_INTERNAL_KEY ?? null;
}

export function isAgentsHubConfigured(): boolean {
  return !!(getBase() && getPublicKey());
}

/**
 * One-shot audit. Returns full result; no streaming.
 * Use `streamAudit` for the live demo experience.
 */
export async function runAudit(
  url: string,
  options: AuditOptions = {},
): Promise<AuditResult> {
  const base = getBase();
  const publicKey = getPublicKey();
  if (!base || !publicKey) {
    throw new Error("AGENTS-HUB not configured — set AGENTS_HUB_URL + AGENTS_HUB_PUBLIC_KEY");
  }

  const internalKey = getInternalKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/api/v1/audit`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": publicKey,
        ...(internalKey ? { "x-internal-key": internalKey } : {}),
      },
      body: JSON.stringify({
        url,
        depth: options.depth ?? "teaser",
        email: options.email,
        idempotencyKey: options.idempotencyKey,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`agents-hub audit failed: ${res.status}`);
    }
    return (await res.json()) as AuditResult;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Streaming audit via Server-Sent Events. The endpoint must emit
 * `text/event-stream` chunks where each `data:` line is a JSON
 * AuditStreamEvent (one per line).
 */
export async function* streamAudit(
  url: string,
  options: AuditOptions = {},
): AsyncGenerator<AuditStreamEvent> {
  const base = getBase();
  const publicKey = getPublicKey();
  if (!base || !publicKey) {
    throw new Error("AGENTS-HUB not configured");
  }
  const internalKey = getInternalKey();

  const res = await fetch(`${base}/api/v1/audit/stream`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "text/event-stream",
      "x-api-key": publicKey,
      ...(internalKey ? { "x-internal-key": internalKey } : {}),
    },
    body: JSON.stringify({
      url,
      depth: options.depth ?? "teaser",
      email: options.email,
    }),
  });
  if (!res.body) {
    throw new Error("agents-hub stream had no body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 2);
      if (!chunk.startsWith("data:")) continue;
      const json = chunk.slice(5).trim();
      if (!json) continue;
      try {
        yield JSON.parse(json) as AuditStreamEvent;
      } catch {
        // ignore malformed
      }
    }
  }
}
