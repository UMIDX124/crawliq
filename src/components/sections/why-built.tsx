import { Reveal } from "@/components/reveal";
import { Quotes } from "@phosphor-icons/react/dist/ssr";

/**
 * Founder voice section — tells the WHY behind CrawlIQ.
 * Not a testimonial. Not a feature pitch. Just one human paragraph
 * that explains the angle no competitor can copy: built by an
 * agency operator who lived the problem.
 */
export function WhyBuilt() {
  return (
    <section
      id="why"
      className="relative py-20 sm:py-24 md:py-32"
    >
      <div className="container-page">
        <div className="max-w-4xl mx-auto">
          <Reveal y={28}>
            <Quotes
              size={36}
              weight="duotone"
              className="text-[color:var(--color-accent)] mb-7"
            />
            <p className="font-display text-[clamp(22px,3vw,32px)] leading-[1.35] tracking-[-0.018em] text-balance text-fg">
              I&rsquo;ve spent years running an agency that ships audits, CRM
              systems, and AI automation for businesses across three brands.
              Every audit took two days to write, sat unread for a week, and
              listed 60 issues with no priority order. Half the time clients
              shelved the whole thing.{" "}
              <span className="text-fg-muted italic font-light">
                CrawlIQ is the audit tool I wish my own team had — fast enough
                to run on a sales call, sharp enough to point at the three
                fixes that actually move rankings.
              </span>
            </p>

            <p className="mt-6 max-w-[58ch] text-[15.5px] leading-[1.7] text-fg-muted">
              I don&rsquo;t build tools to chase trends. I build the ones I
              needed yesterday and didn&rsquo;t exist. If something on this
              page reads like a marketing claim, ask me on a call — every
              number, every check, every line of code in the audit pipeline
              has a person behind it who has used it on real client work.
            </p>

            <div className="mt-10 flex items-center justify-between gap-6 pt-7 border-t border-[color:var(--color-border)]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[color:var(--color-accent-soft)] grid place-items-center font-display font-bold text-[15px] text-[color:var(--color-accent)]">
                  UF
                </div>
                <div>
                  <div className="font-display font-bold text-[14.5px] text-fg leading-tight">
                    Umer Farooq
                  </div>
                  <div className="mt-1 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted">
                    Founder · Digital Point LLC · Pakistan
                  </div>
                </div>
              </div>
              <a
                href="#cta"
                className="hidden sm:inline-flex font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
              >
                Talk to me →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
