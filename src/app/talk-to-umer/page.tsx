import Link from "next/link";
import { ArrowRight, Calendar, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/sections/nav";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Book 30 min with Umer",
  description:
    "Founder-led conversation. 30 minutes. The math on whether CrawlIQ saves your agency more than it costs.",
};

const SALES_EMAIL = "umer@crawliq.ai";
const CAL_URL = process.env.NEXT_PUBLIC_CAL_URL ?? "";

export default function TalkToUmerPage() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-3xl">
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-5">
            Enterprise · founder-led
          </div>
          <h1 className="display-2xl">
            Book 30 minutes with{" "}
            <span className="italic font-normal [font-family:var(--font-serif)] tracking-[-0.01em] text-[color:var(--color-fg-muted)]">
              Umer.
            </span>
          </h1>

          <p className="mt-7 max-w-[60ch] text-[16px] md:text-[17px] leading-[1.7] text-fg-muted">
            No SDR, no slide deck. We open with the math: how many senior-SEO
            hours a week your team currently spends on audit production, what
            that costs you annually, and whether CrawlIQ replaces enough of it
            to be worth a conversation. If the math doesn&rsquo;t pencil, we
            end the call early — both of us get our time back.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {CAL_URL ? (
              <a
                href={CAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile rounded-2xl bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] p-7 md:p-8 flex flex-col gap-4 shadow-accent group"
              >
                <Calendar size={28} weight="duotone" />
                <div className="font-display font-extrabold text-[22px] leading-tight">
                  Pick a slot on my calendar
                </div>
                <div className="text-[13.5px] leading-[1.6] opacity-90">
                  30-minute slots, Monday–Thursday, 11am–6pm Pakistan time.
                  Calendar shows live availability — no back-and-forth.
                </div>
                <div className="mt-auto flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase">
                  Open calendar
                  <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </a>
            ) : (
              <a
                href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent(
                  "30 min — CrawlIQ enterprise",
                )}&body=${encodeURIComponent(
                  "Hi Umer,\n\nI run an agency with [N] client retainers. We currently spend [N] hours/week on audit production. I'd like to see whether CrawlIQ replaces enough of that workflow to be worth a conversation.\n\nPropose a few 30-min slots that work for you.\n\nThanks,\n",
                )}`}
                className="btn-tactile rounded-2xl bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] p-7 md:p-8 flex flex-col gap-4 shadow-accent group"
              >
                <Calendar size={28} weight="duotone" />
                <div className="font-display font-extrabold text-[22px] leading-tight">
                  Email me — I&rsquo;ll send slots
                </div>
                <div className="text-[13.5px] leading-[1.6] opacity-90">
                  Calendar booking goes live shortly. In the meantime, drop me
                  a note with your timezone and I&rsquo;ll send three options
                  inside the same business day.
                </div>
                <div className="mt-auto flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase">
                  {SALES_EMAIL}
                  <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </a>
            )}

            <a
              href={`mailto:${SALES_EMAIL}`}
              className="btn-tactile rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-7 md:p-8 flex flex-col gap-4 shadow-layered shadow-layered-hover group"
            >
              <EnvelopeSimple size={28} weight="duotone" className="text-[color:var(--color-ink)]" />
              <div className="font-display font-extrabold text-[22px] leading-tight text-fg">
                Or just send me a note
              </div>
              <div className="text-[13.5px] leading-[1.6] text-fg-muted">
                Faster if you already know the question. Reply within 24h on
                weekdays. If it&rsquo;s about an integration or a
                platform-partnership, mention it in the subject — those go to
                the top of my inbox.
              </div>
              <div className="mt-auto flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink)]">
                {SALES_EMAIL}
                <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>
          </div>

          <div className="mt-16 pt-10 border-t border-[color:var(--color-border)]">
            <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted mb-5">
              What we cover
            </div>
            <ul className="space-y-4 text-[15px] leading-[1.7] text-fg-muted">
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--color-ink)] font-bold shrink-0 mt-1">
                  00–05
                </span>
                <span>
                  Your current audit production workflow — who runs it, how
                  long it takes per client, what they actually deliver to the
                  client at the end.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--color-ink)] font-bold shrink-0 mt-1">
                  05–15
                </span>
                <span>
                  Live audit on one of your real client sites. You get a
                  ranked, prioritized findings list inside the call. Decide
                  for yourself whether it&rsquo;s usable.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--color-ink)] font-bold shrink-0 mt-1">
                  15–25
                </span>
                <span>
                  The math: senior-SEO hours saved × your loaded cost ÷ CrawlIQ
                  spend. If it doesn&rsquo;t clear 3× the spend, we shake hands
                  and move on.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--color-ink)] font-bold shrink-0 mt-1">
                  25–30
                </span>
                <span>
                  If the numbers work: scope, timeline, white-label setup,
                  named onboarding, and the contract path. No SDR follow-up
                  drip — direct line from here.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-14">
            <Link
              href="/#pricing"
              className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
            >
              ← Back to pricing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
