import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { ReportEyebrow } from "@/components/glyph";

/**
 * Replaces the placeholder testimonials with an honest "early access"
 * positioning: the product is new, the testimonials are real audits
 * from real users, run yours and become part of the proof.
 *
 * No fake quotes. No fake "+47.2% organic" metrics until they exist.
 */
export function EarlyAccess() {
  return (
    <section className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-14 lg:gap-20 items-center">
          <Reveal>
            <ReportEyebrow num="09">Honest note</ReportEyebrow>
            <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(28px,4.5vw,52px)] leading-[1.05] tracking-[-0.025em]">
              We&rsquo;re new.{" "}
              <span className="italic font-light text-fg-muted">
                Your audit becomes the proof.
              </span>
            </h2>
            <p className="mt-6 text-fg-muted text-[16px] leading-[1.7] max-w-xl">
              Most audit tools paper over their early days with stock-photo
              testimonials. We&rsquo;re not going to. The product runs real
              checks against real data sources — Lighthouse, Chrome UX
              Report, Google Search Console (yours), Wayback Machine,
              OpenPageRank, security headers, JSON-LD validation. The audit
              speaks for itself.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Free tier: 3 audits/month, no credit card",
                "8 trusted data sources, no LLM-invented metrics",
                "First 50 paying users get a permanent founder discount",
                "If your audit is interesting, ask us to feature it",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-[14.5px] text-fg-muted leading-[1.55]"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)] flex-shrink-0 mt-2" />
                  {line}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="btn-tactile mt-10 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] shadow-[0_4px_14px_-4px_rgb(200_71_45/_0.4)]"
            >
              <Sparkle size={13} weight="fill" />
              Run your first audit
              <ArrowRight size={13} weight="bold" />
            </Link>
          </Reveal>

          {/* honest data-source list — replaces fake logo strip */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7 md:p-9">
              <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted mb-5">
                Data sources, fully wired
              </div>
              <div className="grid grid-cols-2 gap-5">
                {[
                  {
                    name: "Lighthouse",
                    desc: "Performance, A11y, SEO, Best Practices",
                    via: "PageSpeed Insights API",
                  },
                  {
                    name: "Chrome UX Report",
                    desc: "Real-user CWV from millions of Chrome users",
                    via: "CrUX API",
                  },
                  {
                    name: "Search Console",
                    desc: "Your real Google ranking data — clicks, impressions, queries",
                    via: "OAuth, read-only",
                  },
                  {
                    name: "Wayback Machine",
                    desc: "Domain age + archive history",
                    via: "CDX API",
                  },
                  {
                    name: "OpenPageRank",
                    desc: "Domain authority score (0-10)",
                    via: "DomCop API",
                  },
                  {
                    name: "Security Headers",
                    desc: "HSTS, CSP, X-Frame, MIME, Referrer",
                    via: "Direct HTTP",
                  },
                  {
                    name: "JSON-LD Validation",
                    desc: "Schema.org structural correctness",
                    via: "Native parse",
                  },
                  {
                    name: "Cheerio crawl",
                    desc: "HTML structure, headings, alts, OG, meta",
                    via: "Native parse",
                  },
                ].map((s) => (
                  <div key={s.name} className="min-w-0">
                    <div className="font-display font-bold text-[14px] mb-1">
                      {s.name}
                    </div>
                    <div className="text-[12.5px] text-fg-muted leading-[1.5]">
                      {s.desc}
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                      via {s.via}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
