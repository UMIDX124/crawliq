"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";

const steps = [
  {
    n: "01",
    title: "Paste your URL",
    body: "Drop any URL. No setup, no plugin, no code, no signup. CrawlIQ fetches the page, parses the HTML, and reads the structured signals on first request.",
    code: `POST /api/audit
{
  "url": "yourwebsite.com"
}`,
  },
  {
    n: "02",
    title: "Five auditors run in parallel",
    body: "On-Page, Technical, Content, Off-Site, and Competitor agents analyze the crawl simultaneously through Groq AI. Each finds issues in their lane, ranked by impact.",
    code: `▷ on-page    ✓ analyzed in 1.2s
▷ technical  ✓ analyzed in 1.4s
▷ content    ⠿ analyzing...
▷ off-site   ⠿ analyzing...
▷ competitor ⠿ analyzing...`,
  },
  {
    n: "03",
    title: "Stream the action plan",
    body: "Findings stream live to your screen as they're produced. Each one explains what's wrong, why it matters, and exactly how to fix it. Export to PDF or share a link.",
    code: `findings: 8 critical · 14 warnings · 6 passing
quick wins:
  → Add H1 to /pricing
  → Compress 3.2 MB of PNG hero images
  → Set canonical on /blog/* paginated routes`,
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <section id="how" className="relative py-28 md:py-36 bg-[color:var(--color-bg-2)]">
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            How it works
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight">
            Three steps from URL{" "}
            <span className="text-fg-muted italic font-normal">
              to action plan.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 md:mt-20 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-20 items-start">
          {/* steps list */}
          <div className="flex flex-col">
            {steps.map((s, i) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "group text-left flex gap-5 py-7 border-b border-[color:var(--color-border)] last:border-b-0 cursor-pointer transition-colors",
                  i === active ? "" : "opacity-60 hover:opacity-100",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 w-10 h-10 rounded-full grid place-items-center font-mono text-[12px] font-bold tracking-wider transition-colors",
                    i === active
                      ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                      : "border border-[color:var(--color-border-strong)] text-fg-muted",
                  )}
                >
                  {s.n}
                </span>
                <div className="flex-1">
                  <div
                    className={cn(
                      "font-display font-bold text-[19px] mb-2 transition-colors",
                      i === active ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    {s.title}
                  </div>
                  <p className="text-[14.5px] leading-[1.65] text-fg-muted">
                    {s.body}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* code preview */}
          <Reveal delay={0.1}>
            <div className="relative rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-3)] overflow-hidden min-h-[420px]">
              {/* terminal bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[color:var(--color-border)]">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-[11.5px] text-fg-faint">
                  crawliq · audit/{current.n}
                </span>
                <span className="ml-auto pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)]" />
              </div>

              {/* content */}
              <div className="p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.n}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <pre className="font-mono text-[13px] leading-[1.7] text-fg whitespace-pre-wrap">
                      {current.code}
                    </pre>

                    {active === 1 && (
                      <div className="mt-6 space-y-2">
                        <div className="scan-line w-[92%]" />
                        <div
                          className="scan-line w-[78%]"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="scan-line w-[60%]"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    )}

                    {active === 2 && (
                      <div className="mt-7 grid grid-cols-3 gap-3">
                        <ScoreTile label="On-Page" value="74" status="warn" />
                        <ScoreTile label="Technical" value="58" status="crit" />
                        <ScoreTile label="Content" value="91" status="pass" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ScoreTile({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "pass" | "warn" | "crit";
}) {
  const color =
    status === "pass"
      ? "var(--color-pass)"
      : status === "warn"
        ? "var(--color-warn)"
        : "var(--color-crit)";
  const bg =
    status === "pass"
      ? "var(--color-pass-bg)"
      : status === "warn"
        ? "var(--color-warn-bg)"
        : "var(--color-crit-bg)";
  return (
    <div
      className="rounded-lg p-4 border border-[color:var(--color-border)]"
      style={{ backgroundColor: bg }}
    >
      <div
        className="font-display font-extrabold text-[24px] leading-none"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-muted">
        {label}
      </div>
    </div>
  );
}
