import { Reveal } from "@/components/reveal";
import { MagnifyingGlass, ChartLineDown, Hourglass } from "@phosphor-icons/react/dist/ssr";
import { ReportEyebrow } from "@/components/glyph";

const problems = [
  {
    icon: MagnifyingGlass,
    title: "Hidden technical debt",
    body: "Broken canonicals, missing meta, slow Core Web Vitals — issues your team never sees until rankings start sliding. By then it's a quarter of work to claw back.",
    tagline: "Silent decay",
    detail: "Months of regression before the dashboard reacts",
  },
  {
    icon: ChartLineDown,
    title: "Reports without priorities",
    body: "Agencies hand over long audit PDFs that list every nit. No ranking by impact, no effort estimate, no clear first action. Teams freeze and nothing ships.",
    tagline: "Frozen by data",
    detail: "Every finding looks equally urgent — so nothing moves",
  },
  {
    icon: Hourglass,
    title: "Weeks, not minutes",
    body: "Manual audits take days. Your competitor finds the same gap and ships fixes inside a sprint. The window for organic recovery closes while you wait.",
    tagline: "Closing window",
    detail: "Recovery cost compounds with every week of delay",
  },
];

export function Problems() {
  return (
    <section id="problems" className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <ReportEyebrow num="01">The problem</ReportEyebrow>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Your site is losing rankings.{" "}
            <span className="italic font-normal text-[color:var(--color-fg)] [font-family:var(--font-serif)] tracking-[-0.01em]">
              Most audit tools won&rsquo;t tell you why.
            </span>
          </h2>
        </Reveal>

        {/* asymmetric: feature card spans 2 cols, smaller cards stack on the right */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-5 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]">
          {problems.map((p, i) => {
            const Icon = p.icon;
            const big = i === 0;
            return (
              <Reveal
                key={p.title}
                delay={i * 0.08}
                y={big ? 32 : 16}
                className={`bg-[color:var(--color-bg)] group hover:bg-[color:var(--color-bg-2)] transition-colors ${
                  big
                    ? "md:col-span-3 md:row-span-2 p-9 md:p-12 flex flex-col"
                    : "md:col-span-2 p-7 md:p-9"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon
                    size={big ? 34 : 24}
                    weight="duotone"
                    className="text-[color:var(--color-accent)]"
                  />
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>
                </div>
                <h3
                  className={`font-display font-bold mb-3 leading-snug ${
                    big ? "text-[26px] md:text-[30px] tracking-[-0.015em]" : "text-[17px]"
                  }`}
                >
                  {p.title}
                </h3>
                <p
                  className={`leading-[1.65] text-fg-muted ${
                    big ? "text-[16px] max-w-[44ch]" : "text-[13.5px]"
                  }`}
                >
                  {p.body}
                </p>
                <div
                  className={`pt-5 border-t border-[color:var(--color-border)] ${
                    big ? "mt-auto pt-7" : "mt-6"
                  }`}
                >
                  <div
                    className={`font-display font-extrabold leading-tight text-fg group-hover:text-[color:var(--color-accent)] transition-colors tracking-[-0.02em] ${
                      big ? "text-[28px] md:text-[34px]" : "text-[18px]"
                    }`}
                  >
                    {p.tagline}
                  </div>
                  <div className="mt-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                    {p.detail}
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
