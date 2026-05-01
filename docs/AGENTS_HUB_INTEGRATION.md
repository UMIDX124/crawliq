# AGENTS-HUB ← CrawlIQ integration spec

CrawlIQ is moving to call AGENTS-HUB as its audit backend (Option C in the architecture decision). This doc is the contract AGENTS-HUB must implement so the wiring on the CrawlIQ side just works.

CrawlIQ-side scaffolding is already shipped: see [`src/lib/agents-hub-client.ts`](../src/lib/agents-hub-client.ts) and the proxy branch in [`src/app/api/audit/route.ts`](../src/app/api/audit/route.ts). Until the AGENTS-HUB side ships, CrawlIQ falls back to its local cheerio + Groq pipeline.

---

## Endpoints AGENTS-HUB must expose

### `POST /api/v1/audit`

One-shot audit. Used for non-streaming callers (cron jobs, background tasks).

**Headers**
- `content-type: application/json`
- `x-api-key: <AGENTS_HUB_PUBLIC_KEY>` — required, rate-limited per key
- `x-internal-key: <AGENTS_HUB_INTERNAL_KEY>` — optional, bypasses public rate limits when set; only ever attached server-to-server

**Body**
```json
{
  "url": "https://example.com",
  "depth": "teaser" | "full",
  "email": "optional@example.com",
  "idempotencyKey": "optional-string"
}
```

**Response (200)**
```json
{
  "url": "https://example.com",
  "finalUrl": "https://example.com/",
  "fetchedAt": "2026-05-01T12:34:56.789Z",
  "overall": 87,
  "scores": [
    { "pillar": "on-page", "value": 92 },
    { "pillar": "technical", "value": 81 },
    { "pillar": "content", "value": 94 },
    { "pillar": "off-site", "value": 88 },
    { "pillar": "competitor", "value": 86 }
  ],
  "findings": [
    {
      "pillar": "technical",
      "severity": "critical",
      "title": "Missing canonical on /blog/* routes",
      "body": "...prose explaining why + how to fix...",
      "signal": "canonical: missing on 3 routes"
    }
  ],
  "source": "agents-hub"
}
```

**Errors**
- `400` invalid url / body → `{ error, issues }`
- `401` bad/missing api key → `{ error: "unauthorized" }`
- `429` rate-limited → `{ error, resetAt }`
- `5xx` upstream failure → `{ error }`

### `POST /api/v1/audit/stream`

Same body + headers as above, but emits a streaming `text/event-stream` response. Each chunk is a `data:` line containing one JSON event from the union below.

**Event types** (mirror [`agents-hub-client.ts`](../src/lib/agents-hub-client.ts) `AuditStreamEvent`)
- `{ "type": "agent.start", "pillar": "on-page" }` — one fired per pillar at the moment the agent starts running
- `{ "type": "agent.line", "pillar": "on-page", "text": "title: 47c ✓" }` — emitted as the agent processes signals; one per line of "thinking"
- `{ "type": "agent.score", "pillar": "on-page", "value": 92 }` — emitted when the agent settles on a score
- `{ "type": "finding", "finding": { ... } }` — each finding as it gets generated
- `{ "type": "complete", "result": { ... full AuditResult ... } }` — terminal success event
- `{ "type": "error", "message": "..." }` — terminal error event

**Headers on response**
- `content-type: text/event-stream; charset=utf-8`
- `cache-control: no-cache, no-transform`
- `connection: keep-alive`

---

## Auth model

Two keys, two purposes.

**Public key (`AGENTS_HUB_PUBLIC_KEY`)**
- Issued per CrawlIQ instance (one for prod, one for preview, one per dev)
- Rate-limited at AGENTS-HUB: e.g. 60 audits/hour per key for `teaser`, 10/hour for `full`
- Sent in every request from CrawlIQ
- Safe-ish: even if leaked, AGENTS-HUB throttles it

**Internal key (`AGENTS_HUB_INTERNAL_KEY`)**
- Issued once, only known to CrawlIQ's server
- Bypasses public rate limits (CrawlIQ trusts AGENTS-HUB; AGENTS-HUB trusts CrawlIQ's server origin)
- Only ever attached on server-side calls (never exposed in the browser)
- Use case: CrawlIQ's `/api/audit` proxy attaches both keys; the server-to-server flow bypasses per-IP throttling

---

## Schema alignment

CrawlIQ already mirrors the 5-pillar shape. AGENTS-HUB's existing audit logic uses the same pillars (per the original Path B plan). The only required change is adding `pillar` as an explicit field on each finding (currently inferred from agent ID).

CrawlIQ's pillar enum (the contract):
```ts
type Pillar = "on-page" | "technical" | "content" | "off-site" | "competitor";
```

AGENTS-HUB's existing agent IDs (`on-page`, `technical`, `content`, `off-site`, `competitor` per [`src/lib/agents.ts`](https://github.com/UMIDX124/AGENTS-HUB/blob/main/src/lib/agents.ts) — verified at session start) already match. No rename needed; just add the field on the response.

---

## Tasks for AGENTS-HUB-side implementation

1. **Add `src/app/api/v1/audit/route.ts`** — POST handler matching the contract above. Wraps existing audit logic, returns one-shot result.
2. **Add `src/app/api/v1/audit/stream/route.ts`** — SSE handler. Reuses the same audit pipeline but emits per-line events.
3. **Add API key model** — Prisma table `ApiKey { id, key (hashed), label, scope ("public" | "internal"), rateLimit, createdAt, lastUsedAt }` + middleware `requireApiKey()` for the `/api/v1/*` routes.
4. **Add CORS** — allow CrawlIQ's deployed origin (`crawliq-sage.vercel.app` + custom domain when set) on the v1 endpoints. Use Next.js middleware or per-route headers.
5. **Add per-key rate limit** — Upstash Redis or in-memory map keyed by API key, configurable per key.
6. **Generate two keys for CrawlIQ** — one public, one internal. Hand to CrawlIQ via env vars.

Estimated effort: 1-2 days on AGENTS-HUB.

---

## Testing the flip

1. Set `AGENTS_HUB_URL`, `AGENTS_HUB_PUBLIC_KEY`, `AGENTS_HUB_INTERNAL_KEY` in CrawlIQ env.
2. Hit `POST /api/audit` with a real URL.
3. Verify response stream contains "via AGENTS-HUB" in the first status message.
4. Unset the env vars → verify fallback to local cheerio + Groq still works.
5. Cause AGENTS-HUB to error (wrong key) → verify CrawlIQ surfaces a clean error event, doesn't silently retry the local fallback.

---

## Why this is worth it

- One audit engine maintained, not two
- CrawlIQ marketing site demoes the SAME engine paying customers use → "we use what we sell"
- Bug fixes in AGENTS-HUB ship to CrawlIQ instantly
- Future-proof: any new pillar / signal goes in AGENTS-HUB once, both surface it

---

## Out of scope (don't ship in this phase)

- Real-time webhook delivery from AGENTS-HUB to CrawlIQ (only request/response for now)
- AGENTS-HUB-hosted PDF generation served back to CrawlIQ — keep PDFs in CrawlIQ for now
- Cross-product user identity (Clerk on CrawlIQ stays separate from AGENTS-HUB auth)
