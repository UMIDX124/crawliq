"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";
import { ReportEyebrow } from "@/components/glyph";
import {
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";

type Severity = "pass" | "warn" | "crit";

type Section = {
  id: string;
  name: string;
  score: number;
  status: Severity;
  findings: { title: string; detail: string; severity: Severity }[];
};

// Demo section content is INTENTIONALLY framed as "what your audit checks"
// rather than "audit findings on a fake site." Each entry describes a
// CHECK, not a finding. No specific URLs, percentages, or measurements that
// could be mistaken for a real audit. SAMPLE badge in chrome bar reinforces.
const sections: Section[] = [
  {
    id: "on-page",
    name: "On-Page SEO",
    score: 74,
    status: "warn",
    findings: [
      {
        title: "Missing H1 detection",
        detail:
          "Cheerio crawl flags any landing page missing an <h1>. Google reads H1 as the primary topical signal — pages without one underperform on relevance scoring. Your audit lists every offending route with a suggested keyword-targeted H1.",
        severity: "crit",
      },
      {
        title: "Title-tag length scoring",
        detail:
          "Google truncates title tags at ~60 characters in SERPs. We score every page's title length, flag truncation risk, and suggest a rewrite that leads with the primary keyword and ends with the brand.",
        severity: "crit",
      },
      {
        title: "Duplicate meta-description scan",
        detail:
          "Pages sharing the same meta description compete for the same SERP snippet. Your audit groups duplicates and recommends per-URL descriptions aligned to each page's target query.",
        severity: "warn",
      },
      {
        title: "Image alt-text coverage",
        detail:
          "We measure alt-text coverage across every image found in the crawl, separate decorative from informational images, and surface a per-page coverage score plus the exact images missing alt.",
        severity: "pass",
      },
    ],
  },
  {
    id: "technical",
    name: "Technical",
    score: 58,
    status: "crit",
    findings: [
      {
        title: "Core Web Vitals against thresholds",
        detail:
          "Lighthouse + CrUX feed real-user LCP, CLS, INP measurements. Your audit compares each page's metrics to Google's thresholds, identifies the offending asset for each failure, and lists the specific fix (AVIF conversion, font preload, image priority hint).",
        severity: "crit",
      },
      {
        title: "Canonical-tag presence + correctness",
        detail:
          "We check every crawled URL for a valid canonical, flag paginated routes missing rel=prev/next, and detect circular or self-referential canonicals that signal-confuse Google.",
        severity: "crit",
      },
      {
        title: "Sitemap + robots integrity",
        detail:
          "We fetch /sitemap.xml and /robots.txt, validate XML structure, confirm Search Console submission status, and check every listed URL for 2xx response + presence in the crawl graph.",
        severity: "pass",
      },
    ],
  },
  {
    id: "content",
    name: "Content",
    score: 91,
    status: "pass",
    findings: [
      {
        title: "Topical depth scoring",
        detail:
          "Per-page word count and heading hierarchy feed a topical-depth score. We map clusters across your blog, identify pillar/cluster gaps, and surface the next-best topic for ranking.",
        severity: "pass",
      },
      {
        title: "Thin-page detection",
        detail:
          "Pages under the 300-word threshold Google uses for thin-content classification get flagged with a recommended expansion target (typically 800+ unique words) or consolidation route.",
        severity: "warn",
      },
    ],
  },
  {
    id: "off-site",
    name: "Off-Site",
    score: 66,
    status: "warn",
    findings: [
      {
        title: "Referring-domain profile",
        detail:
          "Open PageRank + multi-page crawl identifies your unique referring domains, segments by authority, and flags toxic anchor patterns. Your audit ends with a quarter's worth of outreach targets ranked by predicted lift.",
        severity: "warn",
      },
    ],
  },
];

export function Demo() {
  const [activeId, setActiveId] = useState(sections[0].id);
  const active = sections.find((s) => s.id === activeId)!;

  return (
    <section
      id="demo"
      className="relative py-20 sm:py-24 md:py-32 lg:py-36 bg-[color:var(--color-bg-2)]"
    >
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <ReportEyebrow num="10">Sample report</ReportEyebrow>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight">
            What your CrawlIQ report{" "}
            <span className="italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]">
              looks like.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-fg-muted text-[16px] md:text-[17px] leading-[1.65]">
            Below is the report layout for a sample site. Findings shown are
            illustrative — your real audit replaces these with your site&rsquo;s
            actual data, sourced from Lighthouse, CrUX, and Search Console.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] overflow-hidden">
            {/* topbar */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[color:var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-[12px] text-fg-faint">
                  crawliq · audit/example.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase font-bold rounded-sm px-1.5 py-0.5 bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]">
                  Sample
                </span>
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
                  completed · 7.4s
                </span>
              </div>
            </div>

            {/* body */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] min-h-[480px]">
              {/* sidebar */}
              <div className="border-b md:border-b-0 md:border-r border-[color:var(--color-border)] p-4 sm:p-5">
                <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-faint mb-4 px-1">
                  Audit sections
                </div>
                <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveId(s.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                        activeId === s.id
                          ? "bg-[color:var(--color-accent-soft)]"
                          : "hover:bg-[color:var(--color-bg-3)]",
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            s.status === "pass"
                              ? "var(--color-pass)"
                              : s.status === "warn"
                                ? "var(--color-warn)"
                                : "var(--color-crit)",
                        }}
                      />
                      <span
                        className={cn(
                          "text-[13.5px] flex-1",
                          activeId === s.id ? "text-fg" : "text-fg-muted",
                        )}
                      >
                        {s.name}
                      </span>
                      <span
                        className="font-mono text-[12px] font-bold"
                        style={{
                          color:
                            s.status === "pass"
                              ? "var(--color-pass)"
                              : s.status === "warn"
                                ? "var(--color-warn)"
                                : "var(--color-crit)",
                        }}
                      >
                        {s.score}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* main */}
              <div className="p-7 md:p-8">
                <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h3 className="font-display font-bold text-[19px]">
                      {active.name}
                    </h3>
                    <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-fg-faint mt-1.5">
                      {active.findings.filter((f) => f.severity === "crit").length}{" "}
                      critical ·{" "}
                      {active.findings.filter((f) => f.severity === "warn").length}{" "}
                      warnings ·{" "}
                      {active.findings.filter((f) => f.severity === "pass").length}{" "}
                      passing
                    </div>
                  </div>
                  <div className="font-display font-extrabold text-[44px] leading-none">
                    {active.score}
                    <span className="text-fg-faint text-[20px] font-normal">
                      /100
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.ul
                    key={activeId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32 }}
                    className="flex flex-col gap-3"
                  >
                    {active.findings.map((f) => (
                      <li
                        key={f.title}
                        className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-3)] p-5 flex gap-4"
                      >
                        <SeverityIcon severity={f.severity} />
                        <div className="flex-1">
                          <div className="text-[14.5px] font-medium mb-1.5">
                            {f.title}
                          </div>
                          <p className="text-[13.5px] leading-[1.65] text-fg-muted">
                            {f.detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SeverityIcon({ severity }: { severity: Severity }) {
  const map = {
    crit: { Icon: XCircle, color: "var(--color-crit)", label: "Critical" },
    warn: { Icon: WarningCircle, color: "var(--color-warn)", label: "Warning" },
    pass: { Icon: CheckCircle, color: "var(--color-pass)", label: "Passing" },
  } as const;
  const { Icon, color, label } = map[severity];
  return (
    <span
      className="shrink-0 inline-flex items-center gap-2 self-start mt-0.5"
      title={label}
    >
      <Icon size={20} weight="fill" style={{ color }} />
    </span>
  );
}
