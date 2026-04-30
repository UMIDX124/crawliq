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
# fill in: GROQ_API_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
# DATABASE_URL — see setup below
pnpm install
pnpm db:push        # push Prisma schema to your Neon/Postgres DB
pnpm dev
# open http://localhost:3000
```

## Required services

Three services need accounts before the merged app fully runs:

### 1. Clerk (auth)
- Sign up: https://dashboard.clerk.com → create application
- API Keys → copy `Publishable key` + `Secret key`
- Paste into `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### 2. Postgres (Neon recommended via Vercel Marketplace)
- In Vercel dashboard → Storage → Create Neon database → auto-provisions `DATABASE_URL`
- Or use https://neon.tech directly, copy connection string into `.env.local`
- Then: `pnpm db:push` to sync the Prisma schema

### 3. Groq (AI inference)
- https://console.groq.com/keys → create key → paste into `.env.local`

## Routes

| Route                   | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `/`                     | Marketing landing page (13 sections)                      |
| `/audit?url=<URL>`      | Public live audit (no auth, IP-rate-limited)              |
| `/sign-in`, `/sign-up`  | Clerk hosted auth                                         |
| `/dashboard` _(authed)_ | User home — stats, recent audits, primary CTA             |
| `/projects` _(authed)_  | Project list                                              |
| `/audit/[id]` _(authed)_| Stored audit detail view                                  |
| `/reports` _(authed)_   | Completed audit list                                      |
| `/tasks` _(authed)_     | Task board (todo / in-progress / done)                    |
| `/settings` _(authed)_  | Profile / billing / team / API keys                       |
| `/api/audit`            | POST: cheerio crawl + Groq stream of audit findings (SSE) |
| `/api/pilot`            | POST: Resend-backed pilot lead form                       |

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
