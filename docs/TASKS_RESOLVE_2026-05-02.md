# CrawlIQ — Resolution Task List (next-agent execution file)

> Read `HANDOFF_2026-05-02.md` first for context, then work through this file top-to-bottom.
> Each task has: **Why** (user-facing reason) · **Where** (file + line hint) · **How** (concrete change) · **Verify** (what success looks like).
> Auto mode: execute without asking. Mark each task `[x]` as you ship it. Commit after each cluster, not each task.

---

## Cluster A — Verify what already shipped is actually visible

### A1. [ ] Verify hero floating-cards render on latest preview
- **Why:** Last commit `8c2e19c` fixed z-index from `-z-[5]` → `z-0` and repositioned. User saw the OLD deploy without cards. Need to confirm fix landed.
- **Where:** Open https://crawliq-dpkj22xj7-umidx124s-projects.vercel.app (or `vercel ls | head -3` for current latest)
- **How:** Open in browser, scroll just the hero. You should see 8 small chips drifting (score `87`, status `200`, finding `H1 missing`, metric `LCP 1.42s`, signal `canonical · set`, etc.). They sit BEHIND the H1 text.
- **Verify:** All 8 cards visible at md+ breakpoint. None overlap the 3D scene density on right.
- **If still invisible:** check parent stacking — `<section>` may need `isolation: isolate` removed, or content `<div>` may have an opaque bg pushing cards behind. As a fallback, raise to `z-[1]` and add `relative` to the container.

### A2. [ ] Verify nav header is cream (not dark navy) on scroll
- **Why:** User flagged the dark slab as unprofessional. Commit `a72fc6b` swapped to cream translucent.
- **Where:** Same preview URL, scroll past 24px
- **Verify:** Header bg becomes `rgb(239 229 208 / 0.88)` cream-translucent with backdrop-blur, soft border, drop-shadow. No dark navy.

### A3. [ ] Verify pricing "Most popular" badge fully visible
- **Where:** Scroll to `#pricing` section on the preview
- **Verify:** Badge sits half-above the featured card with no top-half clip. `ring-4 ring-bg` creates a clean break.

---

## Cluster B — Real-data corrections (no fake findings)

### B1. [ ] Live-finding ticker hardcoded — replace with real findings or label it
- **Why:** `<HeroLiveFinding>` cycles 6 fake-ish findings (`23 images missing alt-text`, `4 broken internal links`, etc.) regardless of real audit data. After a real audit shows `IMGS: 0/0`, the ticker still says "23 missing" → visible inconsistency. Violates user's locked rule "no fake audit results, ever" (see auto-memory `feedback_no_fake_audit_results.md`).
- **Where:** `src/components/hero-floating-cards.tsx` lines ~240-260 (the `LIVE_TICKS` array)
- **How (pick one):**
  1. **Best:** drive from a static set of CrawlIQ's OWN self-audit (since the page audits itself via `live-audit-margin`). Pull metrics from `web-vitals` + DOM-derived signals already collected in `live-audit-margin.tsx` and convert into ticker entries.
  2. **Acceptable:** rename the ticker label from "live · finding 01/06" to "example finding 01/06" so the demo nature is explicit; add a small "(example)" suffix; keep the cycling.
  3. **Fallback:** when a real audit is submitted (`submittedUrl` truthy in `hero.tsx`), unmount the ticker entirely.
- **Verify:** Either ticker shows real metrics OR clearly labeled as example. No fake-looking inconsistency.

### B2. [ ] Audit on Vercel-protected URL returns HTTP 401 → guardrail
- **Why:** When user pastes a Vercel preview URL into the audit, the audit captures Vercel's deployment-protection HTML and reports HTTP 401. Real signal but produces a misleading "Score 20 GRADE F" on what's actually a working site.
- **Where:** `src/app/api/audit/route.ts` (the POST handler) — find where the URL is validated/normalized
- **How:**
  ```ts
  const u = new URL(submittedUrl);
  if (u.hostname.endsWith(".vercel.app") && u.hostname !== "crawliq.ai") {
    return Response.json(
      {
        error: "vercel_protected",
        message: "Vercel preview URLs require deployment-protection bypass. Paste a public production URL instead (e.g. https://example.com).",
      },
      { status: 400 }
    );
  }
  ```
- Also surface this hint in the hero form UI (in `src/components/sections/hero.tsx` near the URL validation `try/catch`):
  ```ts
  if (u.hostname.endsWith(".vercel.app")) {
    setError("Vercel preview URLs are auth-protected. Use a public production URL.");
    return;
  }
  ```
- **Verify:** Pasting a `*.vercel.app` URL surfaces an inline warning instantly; the audit doesn't even fire.

---

## Cluster C — Apply the new design utilities (already created in globals.css, now USE them)

These utility classes were added in commit `cdb041f` but most sections still use bespoke inline styles. Replacing them gives consistent rhythm + lighter DOM.

### C1. [ ] Apply `.display-3xl/2xl/xl/lg` ladder across section H2s
- **Why:** Right now most section headings use `clamp(...)` inline strings — inconsistent letter-spacing, leading, weight. The display ladder unifies rhythm.
- **Where:** `src/components/sections/{problems,features,comparison,case-study,pricing,faq,early-access}.tsx` — every `<h2>`
- **How:** Replace `font-display font-extrabold text-balance text-[clamp(...)] leading-... tracking-...` with single class `display-2xl` (or `display-xl` on smaller sections).
- **Verify:** All H2s have visually consistent vertical rhythm.

### C2. [ ] Apply `.shadow-layered` family to cards
- **Where:** `pricing.tsx` (PriceCard inline shadow strings), `features.tsx` bento cards, `case-study.tsx` cards, `pdf-preview.tsx` mockup
- **How:** Replace inline `shadow-[0_8px_28px_-16px_rgb(...)]` with `shadow-layered` (default), `shadow-layered-lg` for elevated, `shadow-accent` for featured. Pair with `shadow-layered-hover` for interactive cards.
- **Verify:** Cards have multi-stop ambient + contact + inner highlight. Hover lifts smoothly.

### C3. [ ] Apply `.motion-nano-drift` to small static visuals
- **Where:** `audit-stamp.tsx` (already done in hero — now propagate elsewhere), `live-ticker.tsx`, the data-mesh badges in `data-sources-strip.tsx`
- **How:** Add `motion-nano-drift-slow` class to subtle background ornaments. Don't add to text/CTAs.
- **Verify:** Static elements gain subtle 6px breathing on 14-22s loops without being distracting.

### C4. [ ] Apply `.motion-micro-rise` + `.motion-micro-glow` to all interactive cards/buttons
- **Where:** All `<a>`, `<button>`, card hover targets across sections
- **How:** Many already use `btn-tactile`. Audit and add `motion-micro-rise` for transform-only lift, `motion-micro-glow` for accent halo on focus/hover.
- **Verify:** Every interactive element has visible hover+active feedback.

### C5. [ ] Apply `.drop-cap` on one editorial section opener (case study or methodology)
- **Where:** `src/components/sections/case-study.tsx` first paragraph, OR a new "From the founder" pull-quote
- **How:** Wrap target paragraph in `<p className="drop-cap text-[17px] leading-[1.7] max-w-[60ch]">...</p>`
- **Verify:** First letter renders large Instrument Serif italic in tangerine, float-left, body wraps around. One per page max.

---

## Cluster D — User said "many other issues came on site" — DISCOVERY pass

User did not enumerate. Until they do, run a self-audit and surface candidates.

### D1. [ ] Walk every public route in dev mode and screenshot
```bash
cd /Users/laptopchoice/Projects/crawliq && pnpm dev
# In another terminal, hit each route in a real browser:
# /  /preview  /preview/scroll-hero  /preview/watch-think
# /preview/features-h  /preview/comparison-scroll  /preview/pricing-3d
# /preview/cursor  /preview/section-fx  /preview/page-load
# /preview/audio-hero  /preview/audit-doc  /brand
# /privacy  /terms  /sign-in  /sign-up
```
- **Verify:** Document any visual breakage, layout overflow, color regression, font swap, missing image, console errors. Build a punch list to ask user about.

### D2. [ ] Run Lighthouse on the preview URL
- Performance budget: ≥ 80
- Accessibility: ≥ 95
- SEO: ≥ 95
- Best practices: ≥ 90
- **Where:** Chrome DevTools Lighthouse panel, mobile emulation
- **Verify:** Note any failing audit. Top suspects given motion/3D heavy hero: LCP > 2.5s, TBT > 200ms.

### D3. [ ] Check mobile (sm < 768px) layout
- Floating cards are `hidden md:block` so absent on mobile (intentional).
- 3D scene is `hidden lg:flex` so absent on mobile (intentional).
- Verify: hero text, form, stats stack cleanly. No horizontal scroll. CTAs reachable. Nav drawer opens/closes cleanly.

---

## Cluster E — Pending integration work

### E1. [ ] AGENTS-HUB Path C — receive 3 keys from user, paste into Vercel env
- **Why:** Connects CrawlIQ marketing site's audit endpoint to the AGENTS-HUB product backend so demos use the real product engine. Marketing site is currently using local cheerio+Groq fallback.
- **How:**
  1. Ask user to paste: `AGENTS_HUB_URL`, `AGENTS_HUB_PUBLIC_KEY`, `AGENTS_HUB_INTERNAL_KEY`
  2. Add to Vercel via CLI:
     ```bash
     cd /Users/laptopchoice/Projects/crawliq
     vercel env add AGENTS_HUB_URL production
     vercel env add AGENTS_HUB_PUBLIC_KEY production
     vercel env add AGENTS_HUB_INTERNAL_KEY production
     # Repeat for preview environment
     ```
  3. Trigger redeploy: `vercel deploy --prod`
- **Verify:** Audit endpoint hits AGENTS-HUB; logs show `proxy → agents-hub` not `local fallback`. See `docs/AGENTS_HUB_INTEGRATION.md`.

### E2. [ ] Production promotion
- **Where:** `cd /Users/laptopchoice/Projects/crawliq && vercel deploy --prod`
- **Pre-check:** A1, A2, A3 all green; B1, B2 shipped; D2 Lighthouse ≥ targets.
- **Verify:** `vercel ls --prod | head -3` shows the latest commit on the production env.

---

## Cluster F — Polish backlog (do after user signs off on A/B/C/D)

### F1. [ ] Replace remaining bespoke shadow strings repo-wide
- **Where:** `grep -rn "shadow-\[" src/` — every match should become a `.shadow-layered*` utility unless deliberately bespoke
- **Verify:** Only intentional one-offs remain in `grep`.

### F2. [ ] Type ladder audit
- **Where:** `grep -rn "text-\[clamp" src/` — every match should become a `.display-*` utility
- **Verify:** Only intentional one-offs remain.

### F3. [ ] Restrained-accent audit
- **Where:** `grep -rn "color-accent" src/` — count occurrences per file
- **Rule:** No section should have orange accent on > 4 elements (CTA + 1 accent word + 1 dot + 1 chip). If a section does, prune.

### F4. [ ] Editorial elevation pass on `/preview/*` routes
- Re-check the 10 preview routes from `project_crawliq_pending_work.md`. Each should:
  - Use cream theme tokens (no carry-over from earlier blueprint/bloomberg/magazine themes)
  - Use the new `.display-*` ladder for headings
  - Use `.shadow-layered*` for cards
  - Use `.motion-nano-drift*` for ambient elements

### F5. [ ] Add a "How to demo" footer note on hero
- Tiny line under the URL form: `tip: try a public site like vercel.com or stripe.com`
- Why: prevents the 401 issue from B2 happening in the first place

---

## Definition of done

A task is done only when:
1. The change is in a commit (not just edited file)
2. `pnpm exec tsc --noEmit` exits 0
3. The deployed preview URL shows the change (verify in browser, not just trust the diff)
4. If user-visible, you posted the new preview URL with a 1-line summary

A cluster is done only when all its tasks are done AND committed AND deployed.

---

## Order of execution

1. **A** (verify what shipped) — 10 min, no code changes
2. **B** (real-data corrections) — 30 min, ships meaningful UX fix
3. **D1-D3** (discovery pass) — 30 min, generates the user-issues list
4. **C** (apply utilities) — 1-2 hours, big visual consistency win
5. **E** (integration + prod) — only after user pastes keys
6. **F** (polish) — last, after user signs off on the above

If user shows up mid-execution with new issues, INSERT them at the front of the queue and demote the current cluster.
