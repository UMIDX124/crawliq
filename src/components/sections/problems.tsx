import { Reveal } from "@/components/reveal";
import { MagnifyingGlass, ChartLineDown, Hourglass } from "@phosphor-icons/react/dist/ssr";

const problems = [
  {
    icon: MagnifyingGlass,
    title: "Hidden technical debt",
    body: "Broken canonicals, missing meta, slow Core Web Vitals — issues your team never sees until rankings start sliding. By then it's a quarter of work to claw back.",
    metric: "73% of sites",
    metricLabel: "have at least 1 critical SEO bug",
  },
  {
    icon: ChartLineDown,
    title: "Reports without priorities",
    body: "Agencies hand over 80-page audit PDFs that list every nit. No ranking by impact, no effort estimate, no clear first action. Teams freeze and nothing ships.",
    metric: "$2,400 avg.",
    metricLabel: "spent per shelved audit",
  },
  {
    icon: Hourglass,
    title: "Weeks, not minutes",
    body: "Manual audits take days. Your competitor finds the same gap and ships fixes inside a sprint. The window for organic recovery closes while you wait.",
    metric: "12-21 days",
    metricLabel: "typical audit turnaround",
  },
];

export function Problems() {
  return (
    <section id="problems" className="relative py-28 md:py-36">
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            The problem
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight">
            Your site is losing rankings.{" "}
            <span className="text-fg-muted">
              Most audit tools won't tell you why.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--color-border)] rounded-lg overflow-hidden border border-[color:var(--color-border)]">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal
                key={p.title}
                delay={i * 0.08}
                className="bg-[color:var(--color-bg)] p-8 md:p-10 group"
              >
                <Icon
                  size={28}
                  weight="duotone"
                  className="text-[color:var(--color-accent)] mb-7"
                />
                <h3 className="font-display font-bold text-[19px] mb-3">
                  {p.title}
                </h3>
                <p className="text-[14.5px] leading-[1.65] text-fg-muted">
                  {p.body}
                </p>
                <div className="mt-7 pt-5 border-t border-[color:var(--color-border)] flex items-baseline gap-3">
                  <span className="font-display font-extrabold text-[20px] text-fg">
                    {p.metric}
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                    {p.metricLabel}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
