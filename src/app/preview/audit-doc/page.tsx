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
    <main className="relative min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] overflow-hidden">
      {/* Paper-grain watermark behind the doc */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(26 22 18 / 0.05) 1px, transparent 0), repeating-linear-gradient(135deg, transparent 0 8px, rgb(26 22 18 / 0.012) 8px 9px)",
          backgroundSize: "22px 22px, auto",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none"
      >
        <div className="font-display font-black text-[clamp(120px,22vw,320px)] tracking-[-0.05em] text-[color:var(--color-fg)]/[0.025] -rotate-12 whitespace-nowrap">
          CONFIDENTIAL
        </div>
      </div>

      <Link
        href="/preview"
        className="btn-tactile fixed top-4 left-4 z-50 px-3.5 py-2 backdrop-blur-md font-mono text-[10px] tracking-[0.22em] uppercase border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/70 rounded-full text-fg-muted hover:text-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]"
      >
        ← preview index
      </Link>

      {/* Report top bar */}
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]/85 backdrop-blur">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)]">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot" />
            Audit report · subject: crawliq.io
          </span>
          <span className="hidden md:flex items-center gap-3">
            <span className="tabular-nums">Section {active.chapter} of {SECTIONS.length.toString().padStart(2, "0")}</span>
            <span className="text-[color:var(--color-fg-faint)]">·</span>
            <span className="text-[color:var(--color-accent)]">{active.title}</span>
          </span>
        </div>
      </header>

      {/* Intro */}
      <section className="relative z-10 pt-24 pb-12 px-6 md:px-10 text-center">
        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] mb-4">
          &lt; 10 / 12 · DELIVERABLE PREVIEW &gt;
        </div>
        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-6">
          ◇ Phase 10 · the page IS the deliverable
        </div>
        <h1 className="font-display font-black text-balance text-[clamp(36px,6vw,80px)] leading-[0.92] tracking-[-0.035em] mb-5">
          Scroll the report.
        </h1>
        <p className="text-balance text-[color:var(--color-fg-muted)] text-[16px] leading-[1.6] max-w-[640px] mx-auto">
          Right margin updates live with that section&rsquo;s findings, sourced and severity-tagged.
        </p>
      </section>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-16 pb-40">
        {/* Center column — report content */}
        <div className="space-y-40">
          {SECTIONS.map((s, idx) => (
            <section
              key={s.id}
              data-sid={s.id}
              ref={(el) => {
                if (el) refs.current.set(s.id, el);
              }}
              className="scroll-mt-24"
            >
              <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] mb-4">
                &lt; {s.chapter} / {SECTIONS.length.toString().padStart(2, "0")} · CHAPTER {s.title.toUpperCase()} &gt;
              </div>
              <h2 className="font-display font-black text-balance text-[clamp(28px,4vw,48px)] leading-[1.02] tracking-[-0.035em] mb-8">
                {s.title}
              </h2>
              <div className="space-y-5 text-[16px] leading-[1.75] text-[color:var(--color-fg-muted)] max-w-[64ch] text-pretty">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-10 pt-4 border-t border-[color:var(--color-border)] flex items-center justify-between font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-faint)]">
                <span>CrawlIQ Audit · Confidential</span>
                <span className="tabular-nums text-[color:var(--color-fg-muted)]">
                  page <span className="text-[color:var(--color-fg)]">{s.chapter}</span> / {SECTIONS.length.toString().padStart(2, "0")}
                </span>
              </div>
              {idx === SECTIONS.length - 1 && (
                <div className="mt-12 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-6 max-w-[64ch]">
                  <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] mb-4">
                    ◇ signed
                  </div>
                  <div className="flex items-end justify-between gap-6 flex-wrap">
                    <div>
                      <div
                        className="font-display text-[28px] tracking-[-0.025em] text-[color:var(--color-fg)]"
                        style={{ fontFamily: "var(--font-display), cursive", fontStyle: "italic", fontWeight: 600 }}
                      >
                        CrawlIQ Audit Engine
                      </div>
                      <div className="mt-1 font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-faint)]">
                        autonomous · llm-explained · source-cited
                      </div>
                    </div>
                    <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] tabular-nums">
                      rev a7c1f9d · 2026-05-01
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Footer chapter tag */}
          <div className="pt-8 text-center">
            <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-faint)]">
              &lt; 10 / 12 · END OF PHASE &gt;
            </p>
          </div>
        </div>

        {/* Right margin — sticky, swaps based on active section */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-fg-faint)] mb-3">
              ◇ findings · this section
            </div>
            <div className="rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/85 backdrop-blur overflow-hidden">
              <div className="px-3 py-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] truncate">
                  § {active.chapter} · {active.title}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] pulse-dot shrink-0" />
              </div>
              <ul className="divide-y divide-[color:var(--color-border)] font-mono text-[10.5px] leading-snug">
                {active.findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 px-3 py-2.5">
                    <Dot sev={f.sev} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[color:var(--color-fg)]">{f.text}</div>
                      <div className="text-[color:var(--color-fg-faint)] text-[9.5px] tracking-[0.22em] uppercase mt-0.5">
                        via {f.source}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-3 py-2 border-t border-[color:var(--color-border)] flex items-center justify-between font-mono text-[9.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-faint)]">
                <span className="tabular-nums">{active.findings.length} entries</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-pass)] pulse-dot" />
                  live · in view
                </span>
              </div>
            </div>

            {/* Section nav */}
            <div className="mt-6 flex flex-col divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`font-mono text-[10.5px] tracking-[0.22em] uppercase py-2.5 transition-colors hover:text-[color:var(--color-accent)] ${s.id === active.id ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-fg-faint)]"}`}
                >
                  <span className="tabular-nums mr-2">{s.chapter}</span> · {s.title}
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
