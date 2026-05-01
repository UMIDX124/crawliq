/**
 * /brand — CrawlIQ identity board.
 *
 * Original creative work — six panels visualizing the brand system so it
 * can be reviewed in-context, then components on the main marketing page
 * are updated to match the chosen direction.
 */

import { LogoMark } from "@/components/logo-mark";

export const metadata = {
  title: "Brand identity board",
};

const PALETTE = [
  { name: "canvas", hex: "#0A0A0A", role: "Page background — pure black, no warm tint" },
  { name: "surface", hex: "#16171A", role: "Raised surfaces, cards, modals" },
  { name: "ink", hex: "#FFFFFF", role: "Primary text, accent on accent" },
  { name: "ink-muted", hex: "#A1A1AA", role: "Secondary text, captions" },
  { name: "accent", hex: "#FF5E1A", role: "Primary brand accent, single chromatic move" },
  { name: "pass", hex: "#00DC82", role: "Severity: passed check" },
  { name: "warn", hex: "#FFC107", role: "Severity: warning finding" },
  { name: "crit", hex: "#FF4757", role: "Severity: critical finding" },
];

const TYPE = [
  { label: "Display · 96", weight: 900, size: "96px", text: "267 signals." },
  { label: "Display · 64", weight: 800, size: "64px", text: "Five specialist agents." },
  { label: "Heading · 32", weight: 700, size: "32px", text: "Eight seconds. One report." },
  { label: "Body · 16", weight: 400, size: "16px", text: "CrawlIQ runs five specialist auditors against your URL in parallel and returns a single ranked action plan in under ten seconds." },
  { label: "Mono · 11", weight: 500, size: "11px", text: "LCP 1.42S · CLS 0.018 · INP 38MS · TITLE 47C ✓ · CANONICAL MISSING ✗" },
];

export default function BrandPage() {
  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      {/* Header */}
      <header className="border-b border-[color:var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 flex items-baseline justify-between font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted">
          <span>◇ CrawlIQ · brand identity board</span>
          <span>v0.1 · {new Date().toISOString().slice(0, 10)}</span>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 md:py-16 grid grid-cols-12 gap-px bg-[color:var(--color-border)] border border-[color:var(--color-border)] rounded-2xl overflow-hidden">

        {/* Panel 1 — Logo cover (full width, large) */}
        <section className="col-span-12 bg-[color:var(--color-bg)] p-12 md:p-20 min-h-[420px] flex flex-col justify-between">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted">
            01 · Logo cover
          </div>
          <div className="flex items-center justify-center flex-1 my-12">
            <div className="flex items-center gap-6 md:gap-8">
              <LogoMark size={96} />
              <span
                className="font-display font-black tracking-[-0.04em] leading-none"
                style={{ fontSize: "clamp(72px, 12vw, 168px)" }}
              >
                Crawl<span className="text-[color:var(--color-accent)]">IQ</span>
              </span>
            </div>
          </div>
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-faint">
            Wordmark + reticle mark · Figtree Black 900
          </div>
        </section>

        {/* Panel 2 — Logo variants */}
        <section className="col-span-12 md:col-span-7 bg-[color:var(--color-bg)] p-10 md:p-12">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted mb-10">
            02 · Variants
          </div>
          <div className="space-y-12">
            {/* horizontal lockup */}
            <div className="flex items-end justify-between gap-8 pb-6 border-b border-[color:var(--color-border)]">
              <div className="flex items-center gap-3">
                <LogoMark size={40} />
                <span className="font-display font-extrabold text-[28px] tracking-tight leading-none">
                  Crawl<span className="text-[color:var(--color-accent)]">IQ</span>
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint shrink-0">
                horizontal · 40
              </span>
            </div>
            {/* mark only */}
            <div className="flex items-end justify-between gap-8 pb-6 border-b border-[color:var(--color-border)]">
              <div className="flex items-center gap-6">
                <LogoMark size={64} />
                <LogoMark size={48} />
                <LogoMark size={32} />
                <LogoMark size={20} />
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint shrink-0">
                mark · 64 / 48 / 32 / 20
              </span>
            </div>
            {/* monogram */}
            <div className="flex items-end justify-between gap-8 pb-6 border-b border-[color:var(--color-border)]">
              <div className="w-16 h-16 rounded-lg bg-[color:var(--color-accent)] grid place-items-center font-display font-black text-[28px] tracking-[-0.04em] text-[color:var(--color-accent-fg)]">
                IQ
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint shrink-0">
                monogram · favicon / app icon
              </span>
            </div>
            {/* on accent */}
            <div className="flex items-end justify-between gap-8">
              <div className="bg-[color:var(--color-accent)] px-5 py-4 rounded-lg flex items-center gap-3">
                <LogoMark size={32} />
                <span className="font-display font-extrabold text-[20px] tracking-tight text-[color:var(--color-accent-fg)] leading-none">
                  CrawlIQ
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint shrink-0">
                inverse · on accent
              </span>
            </div>
          </div>
        </section>

        {/* Panel 3 — Construction grid */}
        <section className="col-span-12 md:col-span-5 bg-[color:var(--color-bg)] p-10 md:p-12">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted mb-10">
            03 · Construction
          </div>
          <div className="relative aspect-square max-w-[280px] mx-auto">
            {/* construction grid */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
              {/* grid */}
              {[40, 80, 120, 160].map((p) => (
                <g key={p}>
                  <line x1={p} y1="0" x2={p} y2="200" stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.5" />
                  <line x1="0" y1={p} x2="200" y2={p} stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.5" />
                </g>
              ))}
              {/* outer broken ring */}
              <circle cx="100" cy="100" r="84" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 6" opacity="0.6" />
              {/* inner solid 3/4 arc */}
              <path d="M 100 36 A 64 64 0 1 1 36 100" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              {/* core dot */}
              <circle cx="100" cy="100" r="10" fill="#FFFFFF" />
              {/* finding dot NE */}
              <circle cx="148" cy="64" r="6" fill="#FF5E1A" />
              {/* connector */}
              <line x1="100" y1="100" x2="148" y2="64" stroke="#FF5E1A" strokeWidth="1.5" />
              {/* labels */}
              <text x="100" y="195" textAnchor="middle" fontSize="6" fill="rgb(255 255 255 / 0.5)" fontFamily="ui-monospace, monospace" letterSpacing="2">
                R = 84 · DASH 3·6
              </text>
              <text x="155" y="60" fontSize="6" fill="rgb(255 94 26 / 0.85)" fontFamily="ui-monospace, monospace" letterSpacing="1">
                FINDING
              </text>
            </svg>
          </div>
          <div className="mt-8 font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted leading-relaxed">
            Five layered animations all signal "active scan / found insight" — outer dashed orbit, inner 3/4 arc, core heartbeat, NE discovery dot, connecting hairline.
          </div>
        </section>

        {/* Panel 4 — Color palette */}
        <section className="col-span-12 bg-[color:var(--color-bg)] p-10 md:p-12">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted mb-8">
            04 · Color system
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] border border-[color:var(--color-border)] rounded-lg overflow-hidden">
            {PALETTE.map((c) => (
              <div key={c.name} className="bg-[color:var(--color-bg-2)] p-5 flex flex-col gap-3">
                <div
                  className="aspect-[3/2] rounded border border-[color:var(--color-border-strong)]"
                  style={{ background: c.hex }}
                />
                <div>
                  <div className="font-display font-bold text-[15px] tracking-tight">
                    {c.name}
                  </div>
                  <div className="mt-1 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted tabular-nums">
                    {c.hex}
                  </div>
                  <div className="mt-2 text-[12px] text-fg-muted leading-snug">
                    {c.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Panel 5 — Typography ladder */}
        <section className="col-span-12 md:col-span-7 bg-[color:var(--color-bg)] p-10 md:p-12">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted mb-10">
            05 · Typography
          </div>
          <div className="space-y-8">
            {TYPE.map((row, i) => (
              <div key={i} className="border-b border-[color:var(--color-border)] pb-6 last:border-b-0">
                <div className="flex items-baseline justify-between gap-6 mb-3 font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint">
                  <span>{row.label}</span>
                  <span>{i === 4 ? "Geist Mono" : "Figtree"} · {row.weight}</span>
                </div>
                <div
                  className={i === 4 ? "font-mono tabular-nums" : "font-display"}
                  style={{
                    fontSize: row.size,
                    fontWeight: row.weight,
                    lineHeight: i < 3 ? 0.95 : 1.5,
                    letterSpacing: i < 3 ? "-0.025em" : "0",
                  }}
                >
                  {row.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Panel 6 — Tagline / brand essence */}
        <section className="col-span-12 md:col-span-5 bg-[color:var(--color-bg)] p-10 md:p-12 flex flex-col justify-between min-h-[400px]">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted">
            06 · Brand essence
          </div>
          <div>
            <div
              className="font-display font-black tracking-[-0.04em] leading-[0.95] mb-6"
              style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
            >
              Real signals.<br />
              <span className="text-[color:var(--color-accent)]">No guesses.</span>
            </div>
            <p className="text-[15px] text-fg-muted leading-[1.65] max-w-[36ch]">
              Eight named data sources. Five specialist auditors. One ranked action plan in under ten seconds.
            </p>
          </div>
          <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-faint">
            tagline · single line · used on hero, OG image, footer cap
          </div>
        </section>

        {/* Panel 7 — Hero mockup */}
        <section className="col-span-12 md:col-span-7 bg-[color:var(--color-bg-2)] p-10 md:p-12">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted mb-8">
            07 · Hero application · desktop
          </div>
          {/* fake browser frame */}
          <div className="rounded-xl border border-[color:var(--color-border-strong)] overflow-hidden bg-[color:var(--color-bg)]">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[color:var(--color-bg-3)] border-b border-[color:var(--color-border)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-4 px-3 py-0.5 rounded bg-[color:var(--color-bg)] font-mono text-[10px] text-fg-muted">
                crawliq.ai
              </div>
            </div>
            <div className="px-8 py-12">
              <div className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-[color:var(--color-accent)] mb-4">
                ◇ § 01 / 12 · audit live
              </div>
              <div className="font-display font-black text-[42px] leading-[0.95] tracking-[-0.035em] mb-4">
                Real signals.<br />
                <span className="text-[color:var(--color-accent)]">No guesses.</span>
              </div>
              <p className="text-[12px] text-fg-muted leading-[1.6] mb-6 max-w-[40ch]">
                Five specialist auditors crawl your site in parallel and return one ranked action plan.
              </p>
              <div className="inline-flex items-center border border-[color:var(--color-border-strong)] rounded-md bg-[color:var(--color-surface)]">
                <span className="px-3 py-2 font-mono text-[10px] text-fg-faint">https://</span>
                <span className="px-3 py-2 font-mono text-[10px] text-fg-muted border-l border-[color:var(--color-border)]">yourwebsite.com</span>
                <button className="bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-4 py-2 font-mono text-[10px] tracking-[0.16em] uppercase font-bold">
                  Run audit →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Panel 8 — Mobile mockup */}
        <section className="col-span-12 md:col-span-5 bg-[color:var(--color-bg-2)] p-10 md:p-12">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted mb-8">
            08 · Hero application · mobile
          </div>
          <div className="flex justify-center">
            {/* fake phone frame */}
            <div className="w-[220px] h-[440px] rounded-[28px] border-2 border-[color:var(--color-border-strong)] overflow-hidden bg-[color:var(--color-bg)] relative">
              {/* notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[color:var(--color-bg-3)] rounded-b-2xl" />
              <div className="px-5 pt-12 pb-5 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                  <LogoMark size={20} />
                  <span className="font-display font-extrabold text-[14px] tracking-tight">
                    Crawl<span className="text-[color:var(--color-accent)]">IQ</span>
                  </span>
                </div>
                <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-[color:var(--color-accent)] mb-3">
                  ◇ live
                </div>
                <div className="font-display font-black text-[26px] leading-[0.95] tracking-[-0.03em] mb-3">
                  Real signals.<br />
                  <span className="text-[color:var(--color-accent)]">No guesses.</span>
                </div>
                <p className="text-[10px] text-fg-muted leading-[1.55] mb-5">
                  Five auditors. One ranked plan. Eight seconds.
                </p>
                <div className="rounded border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] flex flex-col">
                  <input
                    placeholder="yoursite.com"
                    className="bg-transparent px-3 py-2 outline-none font-mono text-[10px] text-fg-muted"
                    readOnly
                  />
                </div>
                <button className="mt-2 bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] py-2 font-mono text-[9px] tracking-[0.16em] uppercase font-bold">
                  Run audit →
                </button>
                <div className="mt-auto font-mono text-[7.5px] tracking-[0.18em] uppercase text-fg-faint flex justify-between">
                  <span>267 signals</span>
                  <span>v1</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel 9 — System detail (UI chips / status row) */}
        <section className="col-span-12 bg-[color:var(--color-bg)] p-10 md:p-12">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-muted mb-8">
            09 · System detail · status chips
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10.5px] tracking-[0.14em] uppercase">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-pass)] bg-[color:var(--color-pass-bg)] text-[color:var(--color-pass)]">
              ● PASSED
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-warn)] bg-[color:var(--color-warn-bg)] text-[color:var(--color-warn)]">
              ◆ WARNING
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-crit)] bg-[color:var(--color-crit-bg)] text-[color:var(--color-crit)]">
              ▲ CRITICAL
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]">
              ✱ NEW FINDING
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-border-strong)] text-fg-muted">
              § 04 / 12
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-border-strong)] text-fg-muted tabular-nums">
              LCP 1.42s
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-border-strong)] text-fg-muted tabular-nums">
              267 SIGNALS
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[color:var(--color-border-strong)] text-fg-muted tabular-nums">
              REV 1F178FE
            </span>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[color:var(--color-border)] mt-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8 flex items-baseline justify-between font-mono text-[10.5px] tracking-[0.2em] uppercase text-fg-faint">
          <span>CrawlIQ · brand identity board · v0.1</span>
          <a href="/" className="hover:text-[color:var(--color-accent)] transition-colors">
            ← back to site
          </a>
        </div>
      </footer>
    </main>
  );
}
