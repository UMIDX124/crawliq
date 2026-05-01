"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "@phosphor-icons/react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";

const items = [
  {
    q: "What does CrawlIQ actually check?",
    a: "Five AI auditors run in parallel: On-Page (titles, meta, headings, internal linking, image alts), Technical (HTTPS, redirects, sitemap, canonicals, schema), Content (depth, topic clusters, freshness, thin pages), Off-Site (backlink profile, anchor text, toxic links), and Competitor (top 3 SERP rivals, content + backlink gaps). Together they evaluate 240+ signals.",
  },
  {
    q: "How is this different from Lighthouse, Ahrefs, or Screaming Frog?",
    a: "Lighthouse checks performance only. Ahrefs is backlinks-first and locks features behind enterprise plans. Screaming Frog is a desktop crawler that gives you raw data, not analysis. CrawlIQ unifies the technical crawl with AI-written explanations of why each issue matters and how to fix it — in under 10 seconds.",
  },
  {
    q: "Are the AI findings reliable, or hallucinated?",
    a: "On-Page and Technical findings are grounded in the actual crawl data we pull from your URL — every metric is sourced from the HTML or HTTP response. For Content, Off-Site, and Competitor pillars, the LLM does inference based on the same crawl plus its training. We flag inferred findings clearly. The Pro plan adds API integrations for verified backlink and competitor data.",
  },
  {
    q: "Will running CrawlIQ get me penalized by Google?",
    a: "No. Our crawler respects robots.txt, identifies itself as CrawlIQ in the User-Agent, and makes a single request per audit. It behaves identically to Googlebot from a load standpoint.",
  },
  {
    q: "Can I audit sites I don't own?",
    a: "Yes — CrawlIQ only fetches publicly-accessible HTML. Many of our users are agencies running pre-pitch audits on prospect sites. We do not bypass paywalls, login screens, or robots.txt disallows.",
  },
  {
    q: "What does the PDF report look like?",
    a: "12-page white-label report: executive summary, score breakdown per pillar, ranked findings list, quick wins, methodology appendix. You drop your own logo and brand color in the settings, then export. Pro and Agency plans only.",
  },
  {
    q: "Do you store our audit data?",
    a: "Pro and Agency plans store your audit history so you can track progress over time. Free plan audits are not retained beyond the session. We never sell, share, or use your audit data to train models. Full details in our Privacy Policy.",
  },
  {
    q: "How accurate are the score numbers?",
    a: "Scores are weighted composites of 240+ signal checks, normalized 0-100. They're not directly comparable to Lighthouse scores (different methodology). What matters is the trend — re-audit after fixes and watch the number rise. Most users see 15-30 point lifts within 8 weeks of acting on the findings.",
  },
  {
    q: "What's the cancellation policy?",
    a: "Cancel anytime from your account dashboard. Monthly plans stop billing immediately at the next cycle. Annual plans get a pro-rated refund within the first 30 days. No questions, no retention calls.",
  },
  {
    q: "Do you have an API?",
    a: "Yes — Agency plan includes API access with webhooks. Trigger audits programmatically, receive findings JSON, integrate with your CMS or project management tool. Documentation at /api-docs.",
  },
  {
    q: "Can I white-label CrawlIQ for my agency clients?",
    a: "Yes. Agency plan gives you a client portal with your branding, custom domain support (audit.youragency.com), and the white-label PDF export. Resell audits at your own price.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your audit history and reports remain available for 30 days after cancellation in case you reactivate. After that, the data is permanently deleted. You can export everything as JSON / CSV / PDF before then via Settings → Export.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <Reveal y={32} className="max-w-3xl">
          <h2 className="font-display font-extrabold text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Questions worth{" "}
            <span className="italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]">
              asking.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 max-w-3xl">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <FaqRow q={item.q} a={item.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[color:var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-6 py-6 md:py-7 text-left group"
      >
        <span
          className={cn(
            "font-display font-medium text-[17px] md:text-[19px] tracking-[-0.01em] transition-colors",
            open ? "text-fg" : "text-fg group-hover:text-[color:var(--color-accent)]",
          )}
        >
          {q}
        </span>
        <span
          className={cn(
            "shrink-0 w-9 h-9 rounded-full grid place-items-center border transition-colors",
            open
              ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
              : "border-[color:var(--color-border-strong)] text-fg group-hover:border-[color:var(--color-accent)] group-hover:text-[color:var(--color-accent)]",
          )}
        >
          {open ? <Minus size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-7 max-w-2xl text-[15px] leading-[1.65] text-fg-muted">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
