"use client";

import Link from "next/link";
import { AuditCursorRegion } from "@/components/audit-cursor";

export default function CursorPreview() {
  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted/70 hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border)] rounded backdrop-blur"
      >
        ← preview index
      </Link>

      <section className="pt-32 pb-12 px-6 md:px-10 text-center">
        <div className="max-w-[820px] mx-auto">
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-5">
            ◇ Phase 6 · region-scoped custom cursor
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,80px)] leading-[0.95] tracking-[-0.03em] mb-6">
            Hover the box.
          </h1>
          <p className="text-fg-muted text-[16px] leading-[1.6]">
            Native cursor inside the demo region only. Outside, normal cursor returns. Reticle expands over interactive elements.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-10 pb-32">
        <AuditCursorRegion className="max-w-[1100px] mx-auto rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-12 md:p-20 min-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "On-Page", body: "Title, meta, h1, alt-text, OG tags." },
              { title: "Technical", body: "TLS, redirects, sitemap, canonicals." },
              { title: "Content", body: "Readability, depth, freshness, gaps." },
              { title: "Off-Site", body: "Backlinks, anchors, toxic links." },
              { title: "Competitor", body: "SERP rivals, content + backlink gaps." },
              { title: "Score", body: "Weighted composite per pillar." },
            ].map((c) => (
              <button
                key={c.title}
                type="button"
                className="text-left rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-6 hover:border-[color:var(--color-accent)] transition-colors"
              >
                <div className="font-display font-bold text-[18px] mb-2">{c.title}</div>
                <div className="text-fg-muted text-[13.5px] leading-[1.6]">{c.body}</div>
              </button>
            ))}
          </div>
          <div className="mt-12 text-center font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-muted">
            ◇ move cursor anywhere · hover cards to see expand
          </div>
        </AuditCursorRegion>
      </section>
    </main>
  );
}
