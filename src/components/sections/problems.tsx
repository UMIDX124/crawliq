import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { MagnifyingGlass, ChartLineDown, Hourglass } from "@phosphor-icons/react/dist/ssr";

const problems = [
  {
    icon: MagnifyingGlass,
    title: "Hidden technical debt",
    body: "Broken canonicals, missing meta, slow Core Web Vitals — issues your team never sees until rankings start sliding. By then it's a quarter of work to claw back.",
    metricNum: 73,
    metricSuffix: "%",
    metricLabel: "of sites have at least 1 critical SEO bug",
  },
  {
    icon: ChartLineDown,
    title: "Reports without priorities",
    body: "Agencies hand over 80-page audit PDFs that list every nit. No ranking by impact, no effort estimate, no clear first action. Teams freeze and nothing ships.",
    metricNum: 2400,
    metricPrefix: "$",
    metricLabel: "average spend per shelved audit",
  },
  {
    icon: Hourglass,
    title: "Weeks, not minutes",
    body: "Manual audits take days. Your competitor finds the same gap and ships fixes inside a sprint. The window for organic recovery closes while you wait.",
    metricNum: 18,
    metricSuffix: " days",
    metricLabel: "typical audit turnaround",
  },
];

export function Problems() {
  return (
    <section id="problems" className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            The problem
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Your site is losing rankings.{" "}
            <span className="italic font-light text-fg-muted">
              Most audit tools won&rsquo;t tell you why.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal
                key={p.title}
                delay={i * 0.08}
                className="bg-[color:var(--color-bg)] p-8 md:p-10 group hover:bg-[color:var(--color-bg-2)] transition-colors"
              >
                <div className="flex items-center justify-between mb-7">
                  <Icon
                    size={28}
                    weight="duotone"
                    className="text-[color:var(--color-accent)]"
                  />
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>
                </div>
                <h3 className="font-display font-bold text-[19px] mb-3 leading-snug">
                  {p.title}
                </h3>
                <p className="text-[14.5px] leading-[1.65] text-fg-muted">
                  {p.body}
                </p>
                <div className="mt-7 pt-5 border-t border-[color:var(--color-border)]">
                  <CountUp
                    to={p.metricNum}
                    prefix={p.metricPrefix ?? ""}
                    suffix={p.metricSuffix ?? ""}
                    className="font-display font-extrabold text-[28px] leading-none tabular-nums text-fg group-hover:text-[color:var(--color-accent)] transition-colors"
                  />
                  <div className="mt-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                    {p.metricLabel}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
