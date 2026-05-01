import { Reveal } from "@/components/reveal";
import {
  MagnifyingGlass,
  GearSix,
  PencilLine,
  LinkSimple,
  Target,
  FilePdf,
  ChartBar,
  Code,
  Calendar,
} from "@phosphor-icons/react/dist/ssr";
import { ScoreVisual } from "@/components/sections/score-visual";

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Five auditors · one report
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Every angle, every issue,{" "}
            <span className="italic font-light text-fg-muted">
              one merged report.
            </span>
          </h2>
        </Reveal>

        {/* asymmetric bento grid */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 auto-rows-[minmax(180px,auto)] gap-4">
          {/* Big featured cell — score visual */}
          <Reveal delay={0.05} className="md:col-span-2 lg:col-span-3 lg:row-span-2">
            <BentoCell big>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg grid place-items-center bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]">
                  <ChartBar size={20} weight="duotone" />
                </div>
                <div>
                  <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
                    Score · 0-100
                  </div>
                  <h3 className="font-display font-bold text-[19px] mt-1">
                    Weighted score per pillar.
                  </h3>
                </div>
              </div>
              <p className="text-[14px] text-fg-muted leading-[1.65] mb-8">
                Each pillar produces a 0-100 score from a weighted basket of
                240+ signal checks. Re-audit after fixes and watch the trend.
              </p>
              <ScoreVisual />
            </BentoCell>
          </Reveal>

          {/* On-Page */}
          <Reveal delay={0.1} className="md:col-span-1 lg:col-span-3">
            <BentoCell>
              <PillarTop Icon={MagnifyingGlass} title="On-Page" tag="240+ checks" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                Title, meta, heading hierarchy, alt-text coverage, internal
                linking depth, OG/Twitter tags. Every signal a search engine
                reads on the page.
              </p>
              <SamplePill text="Title is 78 chars · Google truncates at 60" status="warn" />
            </BentoCell>
          </Reveal>

          {/* Technical */}
          <Reveal delay={0.15} className="md:col-span-1 lg:col-span-2">
            <BentoCell>
              <PillarTop Icon={GearSix} title="Technical" tag="Real crawl" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                HTTPS, redirects, sitemap, canonicals, schema, page weight, Core
                Web Vitals signals.
              </p>
              <SamplePill text="3 redirects to reach final URL" status="crit" />
            </BentoCell>
          </Reveal>

          {/* Content */}
          <Reveal delay={0.2} className="md:col-span-1 lg:col-span-2">
            <BentoCell>
              <PillarTop Icon={PencilLine} title="Content" tag="AI-graded" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                Readability, depth vs competitors, freshness, topical
                authority, thin pages, keyword opportunities.
              </p>
              <SamplePill text="14 thin pages under 300 words" status="warn" />
            </BentoCell>
          </Reveal>

          {/* Off-Site */}
          <Reveal delay={0.25} className="md:col-span-1 lg:col-span-2">
            <BentoCell>
              <PillarTop Icon={LinkSimple} title="Off-Site" tag="Link intel" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                Domain authority, backlink profile, anchor distribution, toxic
                link flags, NAP consistency.
              </p>
              <SamplePill text="12 toxic referring domains flagged" status="crit" />
            </BentoCell>
          </Reveal>

          {/* Competitor */}
          <Reveal delay={0.3} className="md:col-span-1 lg:col-span-2">
            <BentoCell>
              <PillarTop Icon={Target} title="Competitor" tag="Gap finder" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                Top 3 SERP rivals identified. Content gaps, backlink gaps,
                keyword overlap, threat level.
              </p>
              <SamplePill text="8 keywords competitors rank for that you don't" status="warn" />
            </BentoCell>
          </Reveal>

          {/* PDF */}
          <Reveal delay={0.35} className="md:col-span-1 lg:col-span-2">
            <BentoCell>
              <PillarTop Icon={FilePdf} title="PDF Export" tag="White-label" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                12-page branded report. Drop your logo, your colors, ship to
                clients in minutes.
              </p>
              <PdfMini />
            </BentoCell>
          </Reveal>

          {/* API */}
          <Reveal delay={0.4} className="md:col-span-1 lg:col-span-3">
            <BentoCell>
              <PillarTop Icon={Code} title="API + Webhooks" tag="Agency plan" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                Trigger audits programmatically. JSON findings, webhook events,
                integrate with your CMS or PM tool.
              </p>
              <CodeMini />
            </BentoCell>
          </Reveal>

          {/* Scheduled */}
          <Reveal delay={0.45} className="md:col-span-1 lg:col-span-3">
            <BentoCell>
              <PillarTop Icon={Calendar} title="Scheduled audits" tag="Auto re-run" />
              <p className="text-[14px] text-fg-muted leading-[1.65] mt-2.5">
                Set weekly or monthly cadence. Get email digests when scores
                shift. Track regressions before clients notice.
              </p>
              <ScheduleMini />
            </BentoCell>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BentoCell({
  children,
  big = false,
}: {
  children: React.ReactNode;
  big?: boolean;
}) {
  return (
    <div
      className={`card-lift group h-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-accent)] ${
        big ? "p-8" : "p-7"
      } flex flex-col`}
    >
      {children}
    </div>
  );
}

function PillarTop({
  Icon,
  title,
  tag,
}: {
  Icon: typeof MagnifyingGlass;
  title: string;
  tag: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg grid place-items-center bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] transition-transform duration-300 group-hover:scale-105">
          <Icon size={18} weight="duotone" />
        </div>
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-faint border border-[color:var(--color-border)] px-2 py-1 rounded">
          {tag}
        </span>
      </div>
      <h3 className="font-display font-bold text-[18px] mt-5 leading-snug tracking-tight">
        {title}
      </h3>
    </>
  );
}

function SamplePill({
  text,
  status,
}: {
  text: string;
  status: "warn" | "crit" | "pass";
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
    <div className="mt-auto pt-5">
      <div
        className="font-mono text-[11.5px] leading-[1.5] px-3 py-2 rounded border"
        style={{
          color,
          backgroundColor: bg,
          borderColor: "var(--color-border)",
        }}
      >
        → {text}
      </div>
    </div>
  );
}

function PdfMini() {
  return (
    <div className="mt-auto pt-5">
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3 flex gap-3">
        <div className="w-10 h-12 rounded bg-[color:var(--color-accent-soft)] grid place-items-center">
          <FilePdf
            size={18}
            weight="bold"
            className="text-[color:var(--color-accent)]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-medium truncate">
            audit-northwood-2026-04.pdf
          </div>
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint mt-0.5">
            12 pages · 384 KB
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeMini() {
  return (
    <div className="mt-auto pt-5">
      <pre className="font-mono text-[11px] leading-[1.6] rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-4 text-fg-muted">
        <span className="text-[color:var(--color-accent)]">POST</span>{" "}
        /v1/audit{"\n"}
        {"{ "}
        <span className="text-[color:var(--color-fg)]">&quot;url&quot;</span>:{" "}
        <span className="text-[color:var(--color-fg)]">&quot;site.com&quot;</span>
        {" }"}
      </pre>
    </div>
  );
}

function ScheduleMini() {
  return (
    <div className="mt-auto pt-5 space-y-2">
      {[
        { date: "Apr 02", score: 84, delta: "—" },
        { date: "Apr 09", score: 87, delta: "+3" },
        { date: "Apr 16", score: 89, delta: "+2" },
      ].map((r) => (
        <div
          key={r.date}
          className="flex items-center justify-between rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2"
        >
          <span className="font-mono text-[11px] tracking-[0.12em] text-fg-muted">
            {r.date}
          </span>
          <span className="font-display font-bold text-[15px] tabular-nums">
            {r.score}
          </span>
          <span
            className="font-mono text-[10.5px] tracking-[0.12em]"
            style={{
              color:
                r.delta === "—"
                  ? "var(--color-fg-faint)"
                  : "var(--color-pass)",
            }}
          >
            {r.delta}
          </span>
        </div>
      ))}
    </div>
  );
}
