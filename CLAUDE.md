# CrawlIQ — Claude session context

> Keep this updated. Future Claude sessions read this FIRST to bootstrap.

---

## What CrawlIQ is

**AI-powered website audit SaaS.** Paste any URL → 8 trusted data sources stream into one report → AI writes the explanation prose. Built to compete with Lighthouse + Sitebulb + Detailed.com at $0–$149/mo.

- **Live**: <https://crawliq-sage.vercel.app>
- **Repo**: <https://github.com/UMIDX124/crawliq>
- **Owner**: Umer (umidx124, backupsolutions1122@gmail.com)
- **Status**: Production live, schema synced, retention loop wired. NOT yet on custom domain. Stripe code shipped but disabled (graceful "coming soon" UI).

## Brand & visual rules — LOCKED

| Token | Value | Notes |
|---|---|---|
| `--color-bg` | `#f5f5f7` | cool slate gray (NOT pure white, NOT cream) |
| `--color-fg` | `#1d1d1f` | warm near-black ink |
| `--color-accent` | `#0066ff` | electric cobalt — single accent, no gradients |
| Display font | **Geist** | NEVER Syne — user rejected as "too stretchy" |
| Body font | **Geist** | same family as display |
| Mono font | **Geist Mono** | for numbers, scores, mono captions |
| Severity colors | pass `#0a7c3a`, warn `#b45309`, crit `#b91c1c` | semantic only, never decorative |

**Hard rules** (user has rejected violations multiple times):
- ❌ NO purple, indigo, violet anywhere
- ❌ NO gradient text on H1
- ❌ NO floating glow orbs
- ❌ NO Inter font
- ❌ NO emoji in markup (Phosphor icons only)
- ❌ NO fake testimonials, fake logos, fake "+47%" metrics — early-access framing instead
- ❌ NO Syne font (rejected as too stretchy)
- ❌ NO cream/white-as-bg (user said "yukh")
- ❌ NO mascot face / cartoon logos (rejected as "too basic / non professional")
- ✅ Current logo: minimalist animated reticle (`<LogoMark />` in `src/components/logo-mark.tsx`)
- ✅ Single accent under 80% saturation
- ✅ Asymmetric grids, mono captions on data, tactile button hover
- ✅ All interactive elements need `:hover` + `:active` states
- ✅ `min-h-[100dvh]` (NOT `h-screen`)

## Tech stack — LOCKED

```
Next.js 16 (App Router, Turbopack)  + Proxy.ts (NOT middleware.ts — Next 16 rename)
TypeScript strict
Tailwind v4
Prisma 6.19 + Postgres (Neon via Vercel Marketplace — DATABASE_URL auto-provisioned)
Clerk v7 (auth)
Groq SDK (llama-3.3-70b-versatile, temperature=0, seeded)
Resend (email)
Stripe (subscription billing — code shipped, env vars deferred)
Framer Motion + Lenis (smooth scroll) + GSAP + Three.js + R3F (lazy-loaded)
@phosphor-icons/react
@react-pdf/renderer (white-label PDF export)
google-auth-library (GSC OAuth)
cheerio (HTML parsing)
react-pdf
zod (validation at API boundaries)
```

**pnpm only.** Never npm. `db:push` / `db:studio` / `db:migrate` use `dotenv-cli -e .env.local`.

## 8 data sources (the moat)

All deterministic, none LLM-invented:

1. **cheerio** — HTML structure, headings, alts, OG, meta
2. **PageSpeed Insights / Lighthouse** — Performance, A11y, BP, SEO scores + CWV
3. **Chrome UX Report (CrUX)** — real-user CWV from millions of Chrome users
4. **Security headers** — HSTS, CSP, X-Frame, MIME, Referrer, Permissions-Policy
5. **Schema.org JSON-LD validator** — required-field validation per type
6. **Google Search Console** (OAuth) — real Google ranking data per user
7. **Wayback Machine** — domain age + history
8. **Open PageRank** — DA-proxy 0-10 score
9. **Multi-page crawler** — BFS up to 25 pages, aggregate site-wide patterns

Engine pattern: `runAllChecks(url, {scope})` → `buildFindings(agent, checks)` (deterministic) → LLM ONLY writes summary + per-finding explanation prose. LLM cannot change titles/severities/scores.

## Routes

| Path | What | Auth |
|---|---|---|
| `/` | Marketing landing | public |
| `/audit` | Free public demo | public |
| `/r/[token]` | Public shareable audit report | public (token-gated) |
| `/sign-in`, `/sign-up` | Clerk hosted | public |
| `/onboarding` | First-run wizard (4 steps) | authed |
| `/dashboard` | Stats + charts + recent audits | authed |
| `/audit/new` | Run audit (scope toggle: single / multi) | authed |
| `/audit/[id]` | Stored audit detail + Share + PDF + Track findings | authed |
| `/projects`, `/projects/[id]` | Project CRUD + cadence + brand editor | authed |
| `/tasks` | Kanban board | authed |
| `/reports` | Completed audit list | authed |
| `/search-console` | GSC OAuth + 28-day analytics | authed |
| `/settings`, `/settings/billing` | User + Stripe portal | authed |
| `/api/audit` | Public SSE audit stream | public, IP-rate-limited |
| `/api/agents/run` | Authed audit + persist + multi-scope | authed |
| `/api/audit/[id]/pdf` | White-label PDF download | authed |
| `/api/audit/[id]/share` | Generate/revoke share token | authed |
| `/api/projects/*` | Project CRUD + cadence + brand patch | authed |
| `/api/tasks/*` | Tasks + status updates | authed |
| `/api/search-console/*` | GSC OAuth flow + sites + data | authed |
| `/api/stripe/*` | Checkout + portal + webhook | mixed (webhook signature-auth) |
| `/api/cron/digest` | Weekly digest email (Mon 9am UTC) | Bearer CRON_SECRET |
| `/api/cron/scheduled-audits` | Daily 6am UTC, also sends score-drop alerts | Bearer CRON_SECRET |
| `/api/onboarding/complete` | Mark User.onboardedAt | authed |

**Total: 42 routes** as of Phase 8.

## Schema (Prisma 6) — high-level

- `User` — clerkUserId, email, name, role, **onboardedAt**, **digestOptIn**
- `Subscription` (1:1 User) — stripeCustomerId/SubscriptionId/PriceId, plan, billingCycle, status
- `Project` — name, url, **cadence** (off/weekly/monthly), **nextRunAt**, **brandName/brandColor/brandLogoUrl**
- `Audit` — url, agent, status, **scope** (single/multi), **pageCount**, **shareToken** (unique), score, grade, signals (JSON), data (JSON)
- `Finding` — auditId, title, detail, category, severity (PASS/WARNING/CRITICAL)
- `Task` — title, status, priority, project + audit + creator + assignee links
- `SearchConsoleConnection` (1:1 User) — accessToken, refreshToken, expiresAt
- `Pin`, `ProjectMember`, `PilotLead`

## Env vars (all on Vercel + .env.local)

Required:
- `DATABASE_URL` (Neon)
- `GROQ_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`

Optional but recommended:
- `GOOGLE_PAGESPEED_API_KEY` — unlocks PageSpeed + CrUX 25k/day
- `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` — GSC connection
- `OPENPAGERANK_API_KEY` — DA proxy (1000/day free)
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — pilot leads + digests + score-drop alerts
- `LEAD_NOTIFICATION_EMAIL` — where pilot leads go
- `CRON_SECRET` — Vercel Cron Bearer token

Stripe (deferred per user):
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, 4 price IDs

## User's priority order (LOCKED)

User explicitly said:
- LAST: Custom domain (`crawliq.ai` / `crawliq.io`)
- SECOND-LAST: Customer testimonials (replace early-access framing once real ones exist)
- THIRD-LAST: Stripe enable (env vars + price IDs in dashboard)
- BUILD EVERYTHING ELSE FIRST.

## Phases shipped

1. **Phase 1** — Auth + DB foundation (Clerk + Prisma + Neon + (app) layout)
2. **Phase 2** — 5-agent engine + authed audit run + Prisma persistence + PDF export
3. **Phase 3** — Project CRUD + dashboard charts + interactive tasks
4. **Phase 4** — Stripe billing code (gated by env vars; "coming soon" UI when missing)
5. **Phase 5** — Real-data engine (PageSpeed + Security + Schema, LLM-explainer-only refactor)
6. **Phase 6** — Free moat: GSC OAuth + CrUX + Wayback + OpenPageRank
7. **Phase 7** — Onboarding wizard + real social proof (EarlyAccess section) + cron digest + scheduled re-audits + score-drop alerts
8. **Phase 8** — Multi-page crawler + public shareable reports `/r/[token]` + white-label PDF + brand editor

## Polish cycles (in progress)

User wants 4 sequential polish cycles. Currently on **Cycle 1**.

**Cycle 1 (in progress):**
- ✅ Scroll-progress bar at top
- ✅ Skip-to-content a11y link
- ✅ Replaced cartoon mascot logo with minimalist animated reticle (`logo-mark.tsx`)
- ✅ Updated favicon to match
- ✅ DataSourcesStrip section below hero
- ✅ Animated SectionBridge replacing static hairlines
- ✅ Problems section: count-up metrics + tighter cards
- ⏳ Pricing cards: cursor-tracked ambient glow
- ⏳ Comparison table: animated check fade-in on scroll
- ⏳ Magnetic CTA pattern site-wide
- ⏳ Reduced-motion guards everywhere

**Cycle 2 (planned):**
- Hero kinetic upgrades (variable-weight, scroll-driven)
- Watch-it-think enhancement (faster cycle, severity badge highlights)
- Features bento polish (animated reveals on scroll)
- Footer enrichment (live status, build hash)

**Cycle 3 (planned):**
- Micro-interactions: card tilt, hover glow, loading skeletons matching layout
- Better empty states (compose, don't just say "No data")
- Form validation polish

**Cycle 4 (planned):**
- Final brutal polish: typography refinement, color calibration, copy sharpening
- Mobile UX deep-dive
- Edge cases (failed states, slow connections, etc.)

## Build / deploy

```bash
pnpm dev            # local
pnpm build          # prisma generate && next build
pnpm db:push        # sync schema to Neon (uses dotenv-cli -e .env.local)
vercel env pull .env.local --yes
vercel --prod --yes
```

## Outstanding before the user's "last 3"

These should land before Stripe → testimonials → domain:
- [ ] Pricing cursor glow + magnetic CTAs everywhere (Cycle 1 continued)
- [ ] Reduced-motion guards across all animations
- [ ] Hero kinetic upgrades (Cycle 2)
- [ ] Watch-it-think + features bento polish (Cycle 2)
- [ ] Micro-interactions everywhere (Cycle 3)
- [ ] Mobile UX deep-dive (Cycle 4)

## Things that have been REJECTED, do not reintroduce

- Purple/indigo gradient color schemes
- Cyan/purple AI-slop hero
- Cream / paper-tan light theme
- Chartreuse + warm-black dark theme
- Syne display font
- Animated mascot face logo (eyes + mouth + scan-line)
- Fake testimonials (Ahmad Raza / Sara Khan / Marcus Johnson — all placeholder)
- Fake "+47% organic" case study
- Fake logo strip (GROWTHLAB / NORTHWOOD / etc.)

## Communication style with this user

- Casual Hinglish/Urdu mixed with English when user uses it
- Lead with problems, then solutions
- Token-efficient — no fluff
- Brutally honest ratings, never sugar-coat
- Do not ask user to do things they've delegated — make logos / copy / fixes in code

## Useful one-liners

```bash
# create new admin migration
pnpm db:push

# generate cron secret
openssl rand -hex 32

# test public audit pipeline end-to-end
curl -sS -N -X POST https://crawliq-sage.vercel.app/api/audit \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'

# rotate compromised secret in Vercel
vercel env rm STRIPE_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY production
```

---

**Last updated**: Phase 8 complete + Cycle 1 polish in progress (commit `17c5b00`+).
