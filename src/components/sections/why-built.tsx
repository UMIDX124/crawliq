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
              Look — I&rsquo;ve been running an agency for years and audits
              were always the worst part of the job. Two days to write one.
              Clients wouldn&rsquo;t read past page three. They&rsquo;d ask me
              which thing to fix first and I never had a clean answer, because
              the report wasn&rsquo;t built that way.
            </p>

            <p className="mt-6 max-w-[60ch] text-[16px] leading-[1.7] text-fg-muted">
              CrawlIQ exists because I wanted to run an audit on a sales call
              and have something actually useful by the time the call ended.
              The three things that matter, in order, with a real reason next
              to each one. Not a 60-page PDF nobody opens.
            </p>

            <p className="mt-5 max-w-[60ch] text-[15px] leading-[1.7] text-fg-muted">
              If something on this page sounds like marketing, email me. The
              only thing I&rsquo;m selling here is the tool I&rsquo;d pay for
              myself.
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
