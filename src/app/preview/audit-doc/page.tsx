"use client";

/**
 * /preview/audit-doc — page-as-deliverable.
 *
 * Center column of audit-report sections. Sticky right margin shows
 * findings that swap based on which section is currently in view
 * (IntersectionObserver-driven). The page IS its own audit deliverable.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  {
    id: "exec-summary",
    chapter: "01",
    title: "Executive summary",
    body: [
      "Site audited: crawliq.io · 2026-05-01 · revision a7c1f9d",
      "Overall score: 68 / 100 · 15 critical findings · 22 warnings · 18 passes",
      "First three actions, in priority order, with estimated lift in parentheses.",
    ],
    findings: [
      { sev: "crit", text: "Canonical missing on /blog/* (3 routes)", source: "cheerio-crawl" },
      { sev: "warn", text: "LCP 2.4s exceeds 2.0s budget", source: "lighthouse" },
      { sev: "pass", text: "Schema.org Organization detected", source: "schema-org" },
    ],
  },
  {
    id: "method",
    chapter: "02",
    title: "Method",
    body: [
      "Five specialist agents run in parallel against eight named data sources: Lighthouse, Chrome UX Report, Search Console (yours via OAuth), Wayback Machine, OpenPageRank, security headers, JSON-LD validation, and a multi-page cheerio crawl up to 25 pages.",
      "The LLM is an explainer only — it writes prose around measured signals. It never invents findings. Every finding cites its raw signal and named source.",
    ],
    findings: [
      { sev: "pass", text: "All 8 data sources reachable", source: "infra-check" },
      { sev: "pass", text: "Multi-page crawl: 12 pages indexed", source: "multi-page-crawl" },
    ],
  },
  {
    id: "performance",
    chapter: "03",
    title: "Performance",
    body: [
      "Core Web Vitals collected from real Chrome users (CrUX) and synthetic Lighthouse runs.",
      "LCP exceeds the 2-second budget on three viewport conditions. INP is borderline at 195ms (target <200ms).",
      "Recommended: lazy-load the hero illustration; preload the primary font; add fetchpriority='high' to the LCP image.",
    ],
    findings: [
      { sev: "warn", text: "LCP 2.4s · synthetic", source: "lighthouse" },
      { sev: "warn", text: "INP 195ms · 75th percentile", source: "crux" },
      { sev: "pass", text: "CLS 0.018 · stable", source: "crux" },
      { sev: "pass", text: "TTFB 178ms", source: "lighthouse" },
    ],
  },
  {
    id: "seo-onpage",
    chapter: "04",
    title: "On-page SEO",
    body: [
      "Title length, meta-description length, heading hierarchy, alt-text coverage across crawled pages.",
      "Title at 78 chars exceeds the 60-char SERP truncation threshold. Eight images on /products/* lack alt text. h1 missing from /pricing.",
    ],
    findings: [
      { sev: "warn", text: "Title 78c (over 60c)", source: "cheerio-crawl" },
      { sev: "crit", text: "h1 missing on /pricing", source: "multi-page-crawl" },
      { sev: "warn", text: "8 images missing alt-text", source: "multi-page-crawl" },
      { sev: "pass", text: "Meta-desc 154c (in range)", source: "cheerio-crawl" },
    ],
  },
  {
    id: "appendix",
    chapter: "05",
    title: "Methodology appendix",
    body: [
      "Severity bands: critical = ranking-blocking issue with measurable impact; warning = best-practice violation; pass = check satisfied.",
      "Score = weighted composite of pillar scores, normalized 0–100. Weights: On-Page 28%, Technical 26%, Content 18%, Off-Site 16%, Competitor 12%.",
      "All measurements time-stamped at audit start. Re-audit to track delta.",
    ],
    findings: [
      { sev: "pass", text: "Methodology disclosed in full", source: "self" },
      { sev: "pass", text: "Severity thresholds documented", source: "self" },
    ],
  },
];

type SectionId = (typeof SECTIONS)[number]["id"];

export default function AuditDocPreview() {
  const [activeId, setActiveId] = useState<SectionId>(SECTIONS[0].id);
  const refs = useRef<Map<SectionId, HTMLElement>>(new Map());

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        // Pick whichever crossing entry is most prominent
        let bestId: SectionId | null = null;
        let bestRatio = 0;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            bestId = (e.target as HTMLElement).dataset.sid as SectionId;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.05, 0.25, 0.5, 0.75] },
    );
    for (const el of refs.current.values()) io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = SECTIONS.find((s) => s.id === activeId)!;

  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted/70 hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border)] rounded backdrop-blur"
      >
        ← preview index
      </Link>

      {/* Report top bar */}
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]/85 backdrop-blur">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] uppercase text-fg-muted">
          <span>◇ Audit report · subject: crawliq.io</span>
          <span className="hidden md:flex items-center gap-3">
            <span>Section {active.chapter} of {SECTIONS.length.toString().padStart(2, "0")}</span>
            <span className="text-fg-faint">·</span>
            <span className="text-[color:var(--color-accent)]">{active.title}</span>
          </span>
        </div>
      </header>

      {/* Intro */}
      <section className="pt-20 pb-10 px-6 md:px-10 text-center">
        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-5">
          ◇ Phase 10 · the page IS the deliverable
        </div>
        <h1 className="font-display font-black text-[clamp(36px,6vw,80px)] leading-[0.95] tracking-[-0.03em] mb-5">
          Scroll the report.
        </h1>
        <p className="text-fg-muted text-[16px] leading-[1.6] max-w-[640px] mx-auto">
          Right margin updates live with that section&rsquo;s findings, sourced and severity-tagged.
        </p>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-16 pb-32">
        {/* Center column — report content */}
        <div className="space-y-32">
          {SECTIONS.map((s) => (
            <section
              key={s.id}
              data-sid={s.id}
              ref={(el) => {
                if (el) refs.current.set(s.id, el);
              }}
              className="scroll-mt-24"
            >
              <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-muted mb-3">
                ◇ Chapter {s.chapter} / {SECTIONS.length.toString().padStart(2, "0")}
              </div>
              <h2 className="font-display font-black text-[clamp(28px,4vw,48px)] leading-[1.05] tracking-[-0.025em] mb-7">
                {s.title}
              </h2>
              <div className="space-y-5 text-[16px] leading-[1.7] text-fg-muted max-w-[64ch]">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-8 font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-faint">
                Page {s.chapter} · CrawlIQ Audit · Confidential
              </div>
            </section>
          ))}
        </div>

        {/* Right margin — sticky, swaps based on active section */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-faint mb-3">
              ◇ findings · this section
            </div>
            <div className="rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/85 backdrop-blur overflow-hidden">
              <div className="px-3 py-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[color:var(--color-accent)]">
                  § {active.chapter} · {active.title}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
              </div>
              <ul className="px-3 py-3 space-y-2.5 font-mono text-[10.5px] leading-snug">
                {active.findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Dot sev={f.sev} />
                    <div className="flex-1 min-w-0">
                      <div className="text-fg">{f.text}</div>
                      <div className="text-fg-faint text-[9.5px] tracking-[0.14em] uppercase mt-0.5">
                        via {f.source}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-3 py-2 border-t border-[color:var(--color-border)] flex items-center justify-between text-[9.5px] tracking-[0.16em] uppercase text-fg-faint">
                <span>{active.findings.length} entries</span>
                <span>live · in view</span>
              </div>
            </div>

            {/* Section nav */}
            <div className="mt-6 flex flex-col gap-1.5">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`font-mono text-[10.5px] tracking-[0.16em] uppercase py-1.5 transition-colors ${s.id === active.id ? "text-[color:var(--color-accent)]" : "text-fg-faint hover:text-fg"}`}
                >
                  {s.chapter} · {s.title}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Dot({ sev }: { sev: string }) {
  const c =
    sev === "crit" ? "var(--color-crit)" : sev === "warn" ? "var(--color-warn)" : "var(--color-pass)";
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
      style={{ background: c }}
      aria-hidden
    />
  );
}
