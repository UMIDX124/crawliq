import { Reveal } from "@/components/reveal";
import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { ParallaxCard } from "@/components/parallax-card";

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
      className="relative section-ink py-24 sm:py-28 md:py-36 lg:py-44 overflow-hidden"
    >
      {/* faint paper-fibre echo on the ink page so it still reads as printed,
          not as a flat dark slab */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.92 0 0 0 0 0.78 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "220px 220px",
        }}
      />
      {/* register marks at the page corners — magazine plate cue */}
      <div className="absolute inset-0 register-marks pointer-events-none" aria-hidden />

      <div className="relative container-page">
        <div className="max-w-4xl mx-auto">
          <Reveal y={28}>
            <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase mb-8" style={{ color: "rgb(244 233 205 / 0.55)" }}>
              <span style={{ color: "var(--color-accent)" }}>§ 04</span> &nbsp;·&nbsp; Founder note
            </div>

            <Quotes
              size={42}
              weight="duotone"
              className="text-[color:var(--color-accent)] mb-7"
            />

            <p className="font-display drop-cap text-[clamp(22px,3vw,32px)] leading-[1.4] tracking-[-0.018em] text-balance" style={{ color: "#F4E9CD" }}>
              Look — I&rsquo;ve been running an agency for years and audits
              were always the worst part of the job. Two days to write one.
              Clients wouldn&rsquo;t read past page three. They&rsquo;d ask me
              which thing to fix first and I never had a clean answer, because
              the report wasn&rsquo;t built that way.
            </p>

            <p className="mt-7 max-w-[62ch] text-[16px] leading-[1.75]" style={{ color: "rgb(244 233 205 / 0.78)" }}>
              CrawlIQ exists because I wanted to run an audit on a sales call
              and have something actually useful by the time the call ended.
              The three things that matter, in order, with a real reason next
              to each one. Not a 60-page PDF nobody opens.
            </p>

            <p className="mt-5 max-w-[62ch] text-[15px] leading-[1.75]" style={{ color: "rgb(244 233 205 / 0.66)" }}>
              If something on this page sounds like marketing, email me. The
              only thing I&rsquo;m selling here is the tool I&rsquo;d pay for
              myself.
            </p>

            <div className="mt-12 flex items-center justify-between gap-6 pt-7 border-t" style={{ borderColor: "rgb(255 255 255 / 0.14)" }}>
              <div className="flex items-center gap-3.5">
                <ParallaxCard
                  intensity={1.4}
                  className="w-12 h-12 rounded-full grid place-items-center font-display font-bold text-[16px] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] shadow-accent"
                >
                  UF
                </ParallaxCard>
                <div>
                  <div className="font-display font-bold text-[15px] leading-tight" style={{ color: "#F4E9CD" }}>
                    Umer Farooq
                  </div>
                  <div className="mt-1 font-mono text-[10.5px] tracking-[0.14em] uppercase" style={{ color: "rgb(244 233 205 / 0.55)" }}>
                    Founder · CrawlIQ
                  </div>
                </div>
              </div>
              <a
                href="#cta"
                className="hidden sm:inline-flex font-mono text-[11px] tracking-[0.16em] uppercase transition-colors"
                style={{ color: "rgb(244 233 205 / 0.66)" }}
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
