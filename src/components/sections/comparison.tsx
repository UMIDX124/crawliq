import { Reveal } from "@/components/reveal";
import { Check, Minus, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { ComparisonRow } from "@/components/sections/comparison-row";

type Cell = boolean | "partial";

const rows: { label: string; crawliq: Cell; lighthouse: Cell; ahrefs: Cell; manual: Cell }[] = [
  { label: "On-page audit", crawliq: true, lighthouse: true, ahrefs: true, manual: true },
  { label: "Technical crawl", crawliq: true, lighthouse: true, ahrefs: true, manual: "partial" },
  { label: "AI-written explanations (why + how)", crawliq: true, lighthouse: false, ahrefs: false, manual: true },
  { label: "Content depth + topic gap", crawliq: true, lighthouse: false, ahrefs: "partial", manual: "partial" },
  { label: "Competitor gap analysis", crawliq: true, lighthouse: false, ahrefs: true, manual: "partial" },
  { label: "Streaming results in <10s", crawliq: true, lighthouse: "partial", ahrefs: false, manual: false },
  { label: "Prioritized fix list", crawliq: true, lighthouse: false, ahrefs: false, manual: "partial" },
  { label: "PDF / white-label export", crawliq: true, lighthouse: false, ahrefs: true, manual: true },
  { label: "Cost per audit", crawliq: true, lighthouse: true, ahrefs: false, manual: false },
];

const competitors = [
  { key: "lighthouse", label: "Lighthouse" },
  { key: "ahrefs", label: "Ahrefs" },
  { key: "manual", label: "Manual audit" },
] as const;

export function Comparison() {
  return (
    <section
      id="comparison"
      className="relative py-20 sm:py-24 md:py-32 lg:py-36"
    >
      <div className="container-page">
        <Reveal y={36} className="max-w-3xl">
          <h2 className="font-display font-extrabold text-balance text-[clamp(28px,5.5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            One tool that{" "}
            <span className="italic font-light text-fg-muted">
              replaces five.
            </span>
          </h2>
          <p className="mt-5 sm:mt-6 max-w-2xl text-fg-muted text-[15px] sm:text-[16px] md:text-[17px] leading-[1.65]">
            Lighthouse only checks performance. Ahrefs only does backlinks.
            Manual audits take three weeks and cost five figures. CrawlIQ does
            all of it, in eight seconds, for the price of a coffee.
          </p>
        </Reveal>

        {/* DESKTOP TABLE — md and up */}
        <Reveal delay={0.15} className="hidden md:block">
          <div className="mt-12 md:mt-14 rounded-xl audit-clip border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
              <div className="px-5 md:px-7 py-5 font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted">
                Capability
              </div>
              <ColHeader label="CrawlIQ" featured />
              <ColHeader label="Lighthouse" />
              <ColHeader label="Ahrefs" />
              <ColHeader label="Manual" />
            </div>

            {rows.map((r, i) => (
              <ComparisonRow
                key={r.label}
                index={i}
                className={cn(
                  "grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center",
                  i % 2 === 0 ? "bg-[color:var(--color-surface)]" : "bg-[color:var(--color-bg)]",
                  "border-b border-[color:var(--color-border)] last:border-b-0",
                )}
              >
                <div className="px-5 md:px-7 py-4 text-[14px] text-fg">
                  {r.label}
                </div>
                <CellMark v={r.crawliq} featured />
                <CellMark v={r.lighthouse} />
                <CellMark v={r.ahrefs} />
                <CellMark v={r.manual} />
              </ComparisonRow>
            ))}
          </div>
        </Reveal>

        {/* MOBILE CARD STACK — under md */}
        <div className="md:hidden mt-12 space-y-3">
          {rows.map((r, i) => (
            <Reveal key={r.label} delay={i * 0.03}>
              <article className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
                <div className="font-display font-medium text-[15px] mb-4 text-balance">
                  {r.label}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  <MobileRow label="CrawlIQ" v={r.crawliq} featured />
                  {competitors.map((c) => (
                    <MobileRow
                      key={c.key}
                      label={c.label}
                      v={r[c.key]}
                    />
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ColHeader({ label, featured = false }: { label: string; featured?: boolean }) {
  return (
    <div
      className={cn(
        "px-3 md:px-5 py-5 text-center border-l border-[color:var(--color-border)]",
        featured && "bg-[color:var(--color-accent-soft)]",
      )}
    >
      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
        {featured && (
          <Sparkle size={12} weight="fill" className="text-[color:var(--color-accent)] shrink-0" />
        )}
        <span
          className={cn(
            "font-display font-bold text-[13px] md:text-[14px] tracking-tight",
            featured && "text-[color:var(--color-accent)]",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function CellMark({ v, featured = false }: { v: Cell; featured?: boolean }) {
  return (
    <div
      className={cn(
        "py-4 text-center border-l border-[color:var(--color-border)] flex items-center justify-center",
        featured && "bg-[color:var(--color-accent-soft)]",
      )}
    >
      {v === true ? (
        <Check
          size={18}
          weight="bold"
          className={cn(
            featured ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-pass)]",
          )}
        />
      ) : v === "partial" ? (
        <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted">
          partial
        </span>
      ) : (
        <Minus size={16} weight="bold" className="text-fg-faint" />
      )}
    </div>
  );
}

function MobileRow({
  label,
  v,
  featured = false,
}: {
  label: string;
  v: Cell;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2",
        featured && "bg-[color:var(--color-accent-soft)]",
      )}
    >
      <span
        className={cn(
          "font-mono text-[10.5px] tracking-[0.14em] uppercase",
          featured ? "text-[color:var(--color-accent)] font-bold" : "text-fg-muted",
        )}
      >
        {label}
      </span>
      {v === true ? (
        <Check
          size={14}
          weight="bold"
          className={cn(
            featured ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-pass)]",
          )}
        />
      ) : v === "partial" ? (
        <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-fg-faint">
          part
        </span>
      ) : (
        <Minus size={12} weight="bold" className="text-fg-faint" />
      )}
    </div>
  );
}
