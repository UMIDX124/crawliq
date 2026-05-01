import Link from "next/link";

const themes = [
  {
    href: "/preview/blueprint",
    name: "Blueprint / CAD",
    blurb: "Drafting paper navy + cyan grid. Engineering precision.",
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

export default function PreviewIndex() {
  return (
    <main className="min-h-[100dvh] bg-[#0a0a0a] text-white p-12">
      <div className="max-w-3xl mx-auto">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/50 mb-4">
          CrawlIQ · theme exploration
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">
          Pick a theme to preview.
        </h1>
        <p className="text-white/60 leading-relaxed mb-12 max-w-prose">
          Each route is a self-contained mockup of the same hero / feature /
          score block in a different visual direction. Open them in separate
          tabs and compare.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block p-6 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
            >
              <div className="flex gap-1.5 mb-4">
                {t.swatch.map((c) => (
                  <span
                    key={c}
                    className="w-6 h-6 rounded-sm border border-white/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="font-bold text-[16px] mb-1">{t.name}</div>
              <div className="text-white/55 text-[13px] leading-relaxed">
                {t.blurb}
              </div>
              <div className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-white/35">
                {t.href} →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
