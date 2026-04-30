# CrawlIQ

AI-powered website audit platform. Paste any URL, five AI auditors crawl in parallel, get a ranked action plan in under 10 seconds.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript strict, Tailwind CSS v4
- Groq SDK (`llama-3.3-70b-versatile`)
- cheerio (HTML parsing / signal extraction)
- Resend (pilot leads, audit-report email)
- framer-motion (scroll reveals + step transitions)
- @phosphor-icons/react (icons — no emoji)
- Fonts: Syne (display) + DM Sans (body)

## Brand tokens

- Surface: `#0a0a0a` warm near-black
- Single accent: chartreuse `#d4ff00`
- Severity: pass `#4ade80`, warn `#fbbf24`, critical `#f87171`
- No purple, no indigo, no gradient text, no glow orbs

## Run locally

```bash
cp .env.local.example .env.local
# fill in GROQ_API_KEY (required) and RESEND_API_KEY (optional)
pnpm install
pnpm dev
# open http://localhost:3000
```

## Routes

| Route          | What it does                                              |
| -------------- | --------------------------------------------------------- |
| `/`            | Landing page (10 sections)                                |
| `/audit`       | Live audit results page (consumes SSE stream)             |
| `/api/audit`   | POST: cheerio crawl + Groq stream of audit findings (SSE) |
| `/api/pilot`   | POST: Resend-backed pilot lead form                       |

## Deploy

```bash
vercel link
vercel env add GROQ_API_KEY
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add LEAD_NOTIFICATION_EMAIL
vercel --prod
```

Custom domain target: `crawliq.ai` (preferred) or `crawliq.io`.

## Backend handoff

Marketing leads onboarded manually into the existing AGENTS-HUB SaaS at <https://agents-hub-fawn.vercel.app>. CTAs on the marketing site are tagged with UTM params (`utm_source=marketing&utm_campaign={section}`).
