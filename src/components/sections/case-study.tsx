import { Reveal } from "@/components/reveal";
import { ArrowRight, ArrowUp } from "@phosphor-icons/react/dist/ssr";

export function CaseStudy() {
  return (
    <section className="relative py-20 sm:py-24 md:py-32 lg:py-36 bg-[color:var(--color-bg-2)]">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-center">
          <Reveal>
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              Pilot results · backfill before launch
            </span>
            <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(30px,4.5vw,52px)] leading-[1.05] tracking-[-0.025em]">
              How a 24-page agency site recovered{" "}
              <span className="italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]">
                47% organic traffic
              </span>{" "}
              in 11 weeks.
            </h2>
            <p className="mt-7 text-fg-muted text-[16px] leading-[1.7] max-w-xl">
              Northwood (a placeholder name we&rsquo;ll swap with the real
              client at launch) ran their site through CrawlIQ after losing 38%
              of organic traffic in Q3. The audit flagged 17 critical issues —
              missing canonicals on paginated routes, three redirect chains, 4
              landing pages without an H1, and 12 thin pages dragging topical
              authority. They shipped fixes in three sprints. By week 11,
              organic was up 47.2% over the post-decline baseline.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-7 max-w-md">
              <Stat label="Audit time" value="7.4s" />
              <Stat label="Issues found" value="17" />
              <Stat
                label="Organic lift"
                value="+47.2%"
                accent
                trend
              />
            </div>

            <a
              href="#cta"
              className="btn-tactile mt-10 inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.16em] uppercase text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]"
            >
              Read the full case study
              <ArrowRight size={12} weight="bold" />
            </a>
          </Reveal>

          {/* visual side — score before/after card */}
          <Reveal delay={0.15}>
            <div className="relative">
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-8 md:p-10 shadow-layered-lg">
                <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted mb-7 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                  Northwood — before / after
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-6">
                    <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint mb-2">
                      Week 0
                    </div>
                    <div className="font-display font-extrabold text-[60px] leading-none text-[color:var(--color-crit)] tabular-nums">
                      52
                    </div>
                    <div className="mt-1 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-muted">
                      Grade D
                    </div>
                  </div>
                  <div className="rounded-xl border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] p-6">
                    <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[color:var(--color-accent)] mb-2">
                      Week 11
                    </div>
                    <div className="font-display font-extrabold text-[60px] leading-none text-[color:var(--color-accent)] tabular-nums">
                      89
                    </div>
                    <div className="mt-1 font-mono text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
                      Grade A
                    </div>
                  </div>
                </div>

                <div className="mt-7 pt-7 border-t border-[color:var(--color-border)]">
                  <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted mb-4">
                    Fixes shipped
                  </div>
                  <ul className="flex flex-col gap-2.5 text-[13px] text-fg-muted leading-[1.55]">
                    <li>→ Added H1 + meta to 4 landing pages</li>
                    <li>→ Set canonical on paginated /blog/* routes</li>
                    <li>→ Compressed hero images (1.4 MB → 280 KB)</li>
                    <li>→ Consolidated 12 thin pages into 4 cluster pages</li>
                    <li>→ Removed 3 redirect chains</li>
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent = false,
  trend = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  trend?: boolean;
}) {
  return (
    <div>
      <div
        className="font-display font-extrabold text-[28px] leading-none flex items-baseline gap-1.5 tabular-nums"
        style={{
          color: accent ? "var(--color-accent)" : "var(--color-fg)",
        }}
      >
        {trend && <ArrowUp size={18} weight="bold" />}
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-[0.16em] uppercase text-fg-muted">
        {label}
      </div>
    </div>
  );
}
