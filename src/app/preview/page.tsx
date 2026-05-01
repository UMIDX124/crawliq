import Link from "next/link";

const THEMES = [
  {
    href: "/preview/blueprint",
    name: "Blueprint / CAD",
    blurb: "Drafting paper navy + cyan grid (alt theme, not in use).",
    swatch: ["#0E1620", "#00B4D8", "#FFC857"],
  },
  {
    href: "/preview/bloomberg",
    name: "Bloomberg amber terminal",
    blurb: "True black + amber phosphor + scanlines. Trading-desk vibe.",
    swatch: ["#000000", "#E5C07B", "#FFFFFF"],
  },
  {
    href: "/preview/magazine",
    name: "Editorial magazine",
    blurb: "Warm paper + thin serif italic + vermillion red mark.",
    swatch: ["#FAFAF7", "#0F0F0F", "#E63946"],
  },
  {
    href: "/preview/riso",
    name: "Risograph print",
    blurb: "Cream paper + warm red + electric blue. Halftone dots.",
    swatch: ["#F5F0E8", "#E63946", "#1E3A8A"],
  },
];

const PHASES = [
  {
    href: "/preview/scroll-hero",
    num: "01",
    name: "3D scene hero",
    blurb: "R3F + drei. Floating reticle + 5 pillar pyramids + severity dots + grid floor. Drag to orbit.",
  },
  {
    href: "/preview/watch-think",
    num: "02",
    name: "Scroll choreography",
    blurb: "Section pins for 3 viewports. 5 terminals activate sequentially as scroll progresses.",
  },
  {
    href: "/preview/features-h",
    num: "03",
    name: "Vertical → horizontal scroll",
    blurb: "Scroll vertically, cards reveal horizontally. After last card, vertical resumes.",
  },
  {
    href: "/preview/comparison-scroll",
    num: "04",
    name: "Pinned table reveal",
    blurb: "Table rows reveal as scroll advances. Final summary card scales out.",
  },
  {
    href: "/preview/pricing-3d",
    num: "05",
    name: "Cursor 3D depth pricing",
    blurb: "Each card layer (header / price / features / CTA) on its own Z-plane. Cursor tilts.",
  },
  {
    href: "/preview/cursor",
    num: "06",
    name: "Region-scoped reticle cursor",
    blurb: "Native cursor hides in demo region; CrawlIQ reticle follows. Expands on interactive elements.",
  },
  {
    href: "/preview/section-fx",
    num: "07",
    name: "Accent sweep section transitions",
    blurb: "Each section enters with a brief accent sweep. Pure CSS + IntersectionObserver, 60fps.",
  },
  {
    href: "/preview/page-load",
    num: "08",
    name: "Film-opening page-load",
    blurb: "4 acts in 1.6s: brand mark draws → wordmark assembles → hero copy → URL input. First-visit only.",
  },
  {
    href: "/preview/audio-hero",
    num: "09",
    name: "Audio-reactive hero",
    blurb: "Synthesized hum via Web Audio API. Reacts to typing. Toggle on/off in footer. No audio assets.",
  },
  {
    href: "/preview/audit-doc",
    num: "10",
    name: "Page-as-deliverable",
    blurb: "Sticky right margin updates with section-aware findings as you scroll. The page IS its own audit.",
  },
];

export default function PreviewIndex() {
  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] py-16 px-6 md:px-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-4">
          ◇ CrawlIQ · preview index
        </div>
        <h1 className="font-display font-black text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-[-0.03em] mb-6">
          Pick a preview to compare.
        </h1>
        <p className="text-fg-muted text-[16px] leading-[1.65] max-w-prose mb-16">
          Ten phase prototypes plus four theme explorations. Each route is isolated — opening any preview never touches the live homepage.
        </p>

        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-fg-muted mb-6">
          Innovation phases (10)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
          {PHASES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group block rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 hover:border-[color:var(--color-accent)] transition-colors"
            >
              <div className="flex items-baseline justify-between mb-3 font-mono text-[10.5px] tracking-[0.22em] uppercase">
                <span className="text-[color:var(--color-accent)]">◇ Phase {p.num}</span>
                <span className="text-fg-faint group-hover:text-[color:var(--color-accent)] transition-colors">{p.href}</span>
              </div>
              <div className="font-display font-bold text-[18px] mb-2 leading-snug">{p.name}</div>
              <div className="text-fg-muted text-[13px] leading-[1.55]">{p.blurb}</div>
            </Link>
          ))}
        </div>

        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-fg-muted mb-6">
          Theme explorations (4 · alt)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEMES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block p-5 rounded-lg border border-[color:var(--color-border)] hover:border-[color:var(--color-fg-muted)] transition-colors"
            >
              <div className="flex gap-1.5 mb-3">
                {t.swatch.map((c) => (
                  <span key={c} className="w-5 h-5 rounded-sm border border-[color:var(--color-border)]" style={{ background: c }} />
                ))}
              </div>
              <div className="font-bold text-[14px] mb-1">{t.name}</div>
              <div className="text-fg-muted text-[12px] leading-relaxed">{t.blurb}</div>
              <div className="mt-2 font-mono text-[9.5px] tracking-[0.18em] uppercase text-fg-faint">{t.href} →</div>
            </Link>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-[color:var(--color-border)] font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-faint flex items-center justify-between">
          <span>◇ all routes isolated · live homepage untouched</span>
          <Link href="/" className="hover:text-[color:var(--color-accent)] transition-colors">
            ← live site
          </Link>
        </div>
      </div>
    </main>
  );
}
