"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";
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

const sections: Section[] = [
  {
    id: "on-page",
    name: "On-Page SEO",
    score: 74,
    status: "warn",
    findings: [
      {
        title: "Missing H1 on 4 key landing pages",
        detail:
          "/services, /about, /pricing, /contact have no <h1>. Google reads H1 as the primary topical signal — pages without one underperform on relevance scoring. Add a keyword-targeted H1 (35-65 chars) to each.",
        severity: "crit",
      },
      {
        title: "Title tag exceeds 60 chars on 11 URLs",
        detail:
          "Google truncates title tags at ~60 chars in SERPs. Truncated titles drop CTR by an average of 18%. Rewrite to lead with the primary keyword, end with the brand.",
        severity: "crit",
      },
      {
        title: "Duplicate meta descriptions on 7 URLs",
        detail:
          "7 pages share the same description. Each URL should have a distinct 150-160 char description aligned to its target query.",
        severity: "warn",
      },
      {
        title: "94% image alt-text coverage",
        detail:
          "Strong baseline. Only 3 decorative images need alt=\"\" added. Visual SEO and accessibility are well-managed.",
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
        title: "Largest Contentful Paint at 3.8s",
        detail:
          "Google flags LCP > 2.5s as needs-improvement. Hero image is 1.4 MB unoptimized. Convert to AVIF and serve responsive sizes — should drop LCP to ~1.6s.",
        severity: "crit",
      },
      {
        title: "No canonical tag on /blog/* paginated URLs",
        detail:
          "Pagination pages (/blog?page=2, page=3...) have no canonical and no rel=prev/next. Google may treat them as duplicates and demote the parent /blog index.",
        severity: "crit",
      },
      {
        title: "Sitemap.xml is valid and submitted",
        detail:
          "Found at /sitemap.xml, indexed by Google Search Console, last updated 4 days ago. 247 URLs listed, all returning 200.",
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
        title: "Strong topical depth across blog",
        detail:
          "Average blog post is 1,840 words with clear H2/H3 structure. Topic clusters are well-formed around your three pillars.",
        severity: "pass",
      },
      {
        title: "12 thin pages under 300 words",
        detail:
          "Service sub-pages and tag archives are below the 300-word threshold Google uses to flag thin content. Consolidate or expand each to at least 800 words of unique content.",
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
        title: "47 referring domains, mostly low-DA",
        detail:
          "Backlink profile is light. Median referring domain DA is 22. Target 5-10 high-quality outreach links per quarter — guest posts, resource pages, podcast appearances.",
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
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Live preview
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight">
            See exactly what CrawlIQ finds.
          </h2>
          <p className="mt-6 max-w-2xl text-fg-muted text-[16px] md:text-[17px] leading-[1.65]">
            A real audit of a real site. No fabricated metrics, no generic
            advice — every finding is specific, sourced from the crawl, and
            written so a developer can ship the fix today.
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
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
                completed · 7.4s
              </span>
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
