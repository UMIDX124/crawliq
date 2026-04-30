import { Reveal } from "@/components/reveal";

const logos = [
  "GROWTHLAB",
  "NORTHWOOD",
  "DIGITALFIRST",
  "ATELIER FOURNIER",
  "COBALT LABS",
  "FIELDDATA",
  "RIVERTIDE MEDIA",
  "HARBOR LAW",
  "MINTBIKE",
  "NORDEN STUDIO",
  "NORTHERN RANK",
  "SAASIFY",
];

export function LogoStrip() {
  return (
    <section className="relative py-16 md:py-24 border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-2)] overflow-hidden">
      <div className="container-page">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted text-center mb-10">
            Trusted by operators at <span className="text-fg">100+</span> teams
          </p>
        </Reveal>
      </div>

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-[color:var(--color-bg-2)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-[color:var(--color-bg-2)] to-transparent" />

      <div className="ticker-track flex w-max gap-14 items-center">
        {[...logos, ...logos].map((label, i) => (
          <span
            key={i}
            className="font-display font-extrabold text-[18px] md:text-[22px] tracking-[-0.02em] text-fg-faint hover:text-fg transition-colors whitespace-nowrap"
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
