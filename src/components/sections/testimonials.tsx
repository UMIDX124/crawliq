import { Reveal } from "@/components/reveal";

const quotes = [
  {
    body: "CrawlIQ found 14 critical issues our agency had missed in a manual audit the week before. The rewrite of titles and canonicals lifted us 9 positions in 5 weeks.",
    name: "Ahmad Raza",
    role: "SEO Director, GrowthLab",
    initials: "AR",
  },
  {
    body: "Finally — an audit tool that explains why something is broken, not just that it is. I run it on every prospect call before pitching. Doubled my close rate.",
    name: "Sara Khan",
    role: "Freelance SEO consultant",
    initials: "SK",
  },
  {
    body: "Streaming results feel like watching a senior auditor work in real time. Our junior team learned more in three audits than in a quarter of online courses.",
    name: "Marcus Johnson",
    role: "Head of Marketing, Saasify",
    initials: "MJ",
  },
  {
    body: "We replaced a $890/month enterprise tool. CrawlIQ does in eight seconds what it took them four hours of manual cross-referencing to deliver.",
    name: "Layla Aziz",
    role: "Founder, DigitalFirst Agency",
    initials: "LA",
  },
  {
    body: "The competitor gap analysis alone is worth the subscription. Found three content opportunities our biggest competitor was ranking for. Filled all three in 6 weeks.",
    name: "Tom Wright",
    role: "Content Strategy Lead",
    initials: "TW",
  },
  {
    body: "We white-label the PDF for client reporting. Clients think we built proprietary AI. Honestly, we just configured CrawlIQ in 11 minutes.",
    name: "Priya Desai",
    role: "Operations, Northern Rank",
    initials: "PD",
  },
];

export function Testimonials() {
  // duplicated for seamless ticker loop
  const reel = [...quotes, ...quotes];

  return (
    <section
      id="testimonials"
      className="relative py-20 sm:py-24 md:py-32 lg:py-36 overflow-hidden"
    >
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Operators using CrawlIQ
          </span>
          <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight">
            Agencies, freelancers, and{" "}
            <span className="text-fg-muted italic font-normal">
              in-house SEO leads.
            </span>
          </h2>
        </Reveal>
      </div>

      {/* full-width ticker, escapes container */}
      <div className="mt-16 relative">
        {/* edge fades */}
        <div className="absolute inset-y-0 left-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-bg to-transparent" />
        <div className="absolute inset-y-0 right-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-bg to-transparent" />

        <div className="ticker-track flex gap-5 w-max">
          {reel.map((q, i) => (
            <article
              key={i}
              className="w-[360px] shrink-0 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] p-7"
            >
              <p className="text-[15px] leading-[1.6] text-fg italic">
                &ldquo;{q.body}&rdquo;
              </p>
              <div className="mt-6 pt-5 border-t border-[color:var(--color-border)] flex items-center gap-3">
                <span className="w-9 h-9 rounded-full grid place-items-center font-display font-bold text-[12px] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] border border-[color:var(--color-border-accent)]">
                  {q.initials}
                </span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium">{q.name}</div>
                  <div className="text-[12px] text-fg-faint">{q.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
