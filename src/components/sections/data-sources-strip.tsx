"use client";

import { motion } from "framer-motion";
import {
  Gauge,
  GoogleLogo,
  ShieldCheck,
  Code,
  Lightning,
  Globe,
  ChartLine,
  FileMagnifyingGlass,
} from "@phosphor-icons/react";

/**
 * Inline strip below the hero showing the 8 real data sources.
 * Replaces the empty space — turns the data moat into immediate visible proof.
 * Each source has an icon, name, and one-line tagline.
 */

const SOURCES = [
  { icon: Gauge, name: "Lighthouse", tag: "Performance, A11y, SEO scoring" },
  { icon: Lightning, name: "Chrome UX Report", tag: "Real-user CWV from millions of Chrome users" },
  { icon: GoogleLogo, name: "Search Console", tag: "Your real Google ranking data" },
  { icon: ShieldCheck, name: "Security headers", tag: "HSTS, CSP, X-Frame, MIME, Referrer" },
  { icon: Code, name: "Schema.org", tag: "JSON-LD structural validity" },
  { icon: Globe, name: "Wayback Machine", tag: "Domain age + change history" },
  { icon: ChartLine, name: "Open PageRank", tag: "Domain authority score 0-10" },
  { icon: FileMagnifyingGlass, name: "Cheerio crawl", tag: "Multi-page HTML structure" },
];

export function DataSourcesStrip() {
  return (
    <section
      aria-label="Real data sources"
      className="relative py-14 md:py-20 border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]"
    >
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            8 trusted sources · zero LLM-invented metrics
          </span>
          <h2 className="font-display font-extrabold mt-4 text-[clamp(22px,3.2vw,36px)] leading-[1.1] tracking-[-0.025em] max-w-2xl mx-auto text-balance">
            Built from real data,{" "}
            <span className="italic font-light text-fg-muted">
              not AI guesswork.
            </span>
          </h2>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]"
        >
          {SOURCES.map((s) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.name}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="bg-[color:var(--color-surface)] p-5 hover:bg-[color:var(--color-bg-3)] transition-colors"
              >
                <Icon
                  size={20}
                  weight="duotone"
                  className="text-[color:var(--color-accent)] mb-3"
                />
                <div className="font-display font-bold text-[14px] mb-1">
                  {s.name}
                </div>
                <div className="text-[11.5px] text-fg-muted leading-[1.5]">
                  {s.tag}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
