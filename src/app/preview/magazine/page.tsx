/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function MagazinePreview() {
  return (
    <main className="min-h-[100dvh] bg-[#FAFAF7] text-[#0F0F0F]">
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-[#0F0F0F]/55 hover:text-[#E63946] px-3 py-2"
      >
        ← all themes
      </Link>

      {/* Masthead */}
      <header className="border-b-2 border-[#0F0F0F]">
        <div className="max-w-[1100px] mx-auto px-10 py-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-6">
            <span
              className="font-extrabold text-[28px] tracking-tight"
              style={{
                fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
              }}
            >
              CrawlIQ
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0F0F0F]/55">
              Issue 01 · Spring 2026
            </span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0F0F0F]/55">
            $0 — read free
          </div>
        </div>
      </header>

      {/* Hero — magazine cover style */}
      <section className="border-b border-[#0F0F0F]/15">
        <div className="max-w-[1100px] mx-auto px-10 pt-20 pb-24 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-14">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#E63946] mb-6">
              01 · The cover story
            </div>
            <h1
              className="leading-[0.96] tracking-tight text-[clamp(48px,8vw,108px)] mb-8"
              style={{
                fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
                fontWeight: 400,
              }}
            >
              The audit was{" "}
              <em className="font-light italic text-[#0F0F0F]/65">never broken.</em>
              <br />
              <span className="font-bold">The format was.</span>
            </h1>
            <p className="text-[17px] leading-[1.65] max-w-[60ch] text-[#0F0F0F]/80">
              For two decades, agencies handed clients sixty-page PDFs that
              listed every nit and ranked nothing. CrawlIQ replaces the report
              with three findings, in priority order, in eight seconds.
            </p>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex items-center border-2 border-[#0F0F0F]">
                <input
                  placeholder="https://yoursite.com"
                  className="bg-transparent px-5 py-3.5 outline-none text-[14px] w-72"
                />
                <button className="bg-[#0F0F0F] text-[#FAFAF7] px-6 py-3.5 font-mono text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-[#E63946]">
                  Read me →
                </button>
              </div>
            </div>
          </div>

          {/* Right column — sidebar like a magazine table-of-contents */}
          <aside className="border-l border-[#0F0F0F]/15 pl-10">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0F0F0F]/55 mb-6">
              Inside this issue
            </div>
            <ol className="space-y-4 text-[14px] leading-snug">
              {[
                ["The five inspectors", "p. 04"],
                ["What we measure (& why)", "p. 11"],
                ["A field test on 50 sites", "p. 22"],
                ["Why we built this", "p. 38"],
                ["Subscribe", "p. 48"],
              ].map((row, i) => (
                <li key={i} className="flex justify-between border-b border-dotted border-[#0F0F0F]/25 pb-2">
                  <span style={{ fontFamily: "ui-serif, Georgia, serif" }}>
                    {row[0]}
                  </span>
                  <span className="font-mono text-[11px] text-[#0F0F0F]/55">
                    {row[1]}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-l-4 border-[#E63946] pl-5">
              <p
                className="text-[17px] leading-snug italic"
                style={{ fontFamily: "ui-serif, Georgia, serif" }}
              >
                "The audit was never broken — the format was."
              </p>
              <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#0F0F0F]/55">
                — pull-quote, page 04
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Feature article block */}
      <section>
        <div className="max-w-[1100px] mx-auto px-10 py-20">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#E63946] mb-6">
            02 · The five pillars
          </div>
          <h2
            className="text-[44px] leading-[1.05] mb-14 max-w-3xl"
            style={{ fontFamily: "ui-serif, Georgia, serif", fontWeight: 400 }}
          >
            Each inspector returns a{" "}
            <em className="text-[#0F0F0F]/65">single weighted score.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-y-8 gap-x-10 border-t border-[#0F0F0F]/20 pt-10">
            {[
              { name: "On-Page", val: 92, note: "title, meta, headings, alts" },
              { name: "Technical", val: 81, note: "https, redirects, canonicals" },
              { name: "Content", val: 94, note: "depth, freshness, clusters" },
              { name: "Off-Site", val: 88, note: "domain authority, backlinks" },
              { name: "Competitor", val: 86, note: "gap analysis, threats" },
            ].map((p, i) => (
              <div key={p.name} className="border-l border-[#0F0F0F]/15 pl-4">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0F0F0F]/55 mb-3">
                  {String(i + 1).padStart(2, "0")} · {p.name}
                </div>
                <div
                  className="text-[64px] leading-none"
                  style={{ fontFamily: "ui-serif, Georgia, serif" }}
                >
                  {p.val}
                </div>
                <div className="mt-3 text-[12.5px] text-[#0F0F0F]/65 leading-snug">
                  {p.note}
                </div>
                {p.val < 85 && (
                  <div className="mt-3 inline-block px-2 py-0.5 font-mono text-[9.5px] tracking-[0.18em] uppercase text-[#E63946] border border-[#E63946]">
                    needs attention
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0F0F0F] py-8">
        <div className="max-w-[1100px] mx-auto px-10 flex items-baseline justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-[#0F0F0F]/55">
          <span>Editorial · CrawlIQ — published in Pakistan</span>
          <span>p. 04 of 48</span>
        </div>
      </footer>
    </main>
  );
}
