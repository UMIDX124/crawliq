/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

const RED = "#E63946";
const BLUE = "#1E3A8A";
const PAPER = "#F5F0E8";
const INK = "#1A1614";

export default function RisoPreview() {
  return (
    <main
      className="min-h-[100dvh] relative"
      style={{
        background: PAPER,
        color: INK,
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(26,22,20,0.16) 1px, transparent 0)",
        backgroundSize: "4px 4px",
      }}
    >
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 border-2"
        style={{ color: BLUE, borderColor: BLUE, background: PAPER }}
      >
        ← all themes
      </Link>

      {/* Header — printed on cream */}
      <header style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="max-w-[1100px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span
              className="font-extrabold text-[28px] tracking-tight"
              style={{ fontFamily: "ui-sans-serif, system-ui" }}
            >
              Crawl<span style={{ color: RED }}>IQ</span>
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-65">
              Risograph edition
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="px-3 py-1 font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ background: RED, color: PAPER }}
            >
              ✱ Limited run
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* big offset chromatic shape — registration mark feel */}
        <div
          aria-hidden
          className="absolute pointer-events-none rounded-full mix-blend-multiply"
          style={{
            background: RED,
            opacity: 0.85,
            width: 380,
            height: 380,
            top: 60,
            right: 80,
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none rounded-full mix-blend-multiply"
          style={{
            background: BLUE,
            opacity: 0.85,
            width: 380,
            height: 380,
            top: 90,
            right: 110,
          }}
        />

        <div className="relative max-w-[1100px] mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-16">
          <div>
            <div
              className="inline-block px-2 py-1 mb-7 font-mono text-[10px] tracking-[0.22em] uppercase"
              style={{ background: BLUE, color: PAPER }}
            >
              An honest tool · printed proudly
            </div>
            <h1
              className="text-[clamp(46px,8vw,108px)] leading-[0.92] tracking-[-0.025em] font-black"
              style={{ fontFamily: "ui-sans-serif, system-ui" }}
            >
              Audits made by{" "}
              <span style={{ color: RED }}>humans,</span>
              <br />
              checked by{" "}
              <span style={{ color: BLUE }}>machines.</span>
            </h1>
            <p className="mt-7 max-w-[480px] text-[16px] leading-[1.65] opacity-80">
              267 signals. Five inspectors. One short report you can act on
              before the kettle boils. No 60-page PDF, no shelving.
            </p>

            <div className="mt-9 flex items-center" style={{ border: `2px solid ${INK}` }}>
              <input
                placeholder="yoursite.com"
                className="bg-transparent px-5 py-3.5 outline-none text-[14px] flex-1 font-mono"
              />
              <button
                className="px-6 py-3.5 font-bold tracking-wide uppercase text-[12px]"
                style={{ background: INK, color: PAPER }}
              >
                Print my audit ⊙
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-x-8">
              {[
                ["267", "checks"],
                ["8s", "median"],
                ["5", "agents"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div
                    className="text-[44px] leading-none font-black"
                    style={{ fontFamily: "ui-sans-serif, system-ui" }}
                  >
                    {v}
                  </div>
                  <div className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillar cards */}
      <section style={{ borderTop: `2px solid ${INK}` }}>
        <div className="max-w-[1100px] mx-auto px-8 py-20">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60 mb-3">
            ✱ Inside the kit
          </div>
          <h2
            className="text-[42px] leading-[1.05] mb-12 max-w-2xl font-black"
            style={{ fontFamily: "ui-sans-serif, system-ui" }}
          >
            Five inspectors,{" "}
            <span style={{ color: BLUE }}>one short report.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "On-Page", val: 92, color: BLUE },
              { name: "Technical", val: 81, color: RED },
              { name: "Content", val: 94, color: BLUE },
              { name: "Off-Site", val: 88, color: BLUE },
              { name: "Competitor", val: 86, color: BLUE },
            ].map((p, i) => (
              <div
                key={p.name}
                className="p-6 relative"
                style={{
                  background: PAPER,
                  border: `2px solid ${INK}`,
                  boxShadow: `4px 4px 0 0 ${p.color}`,
                }}
              >
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60 mb-3">
                  Pillar {String(i + 1).padStart(2, "0")} · {p.name}
                </div>
                <div
                  className="text-[56px] leading-none font-black"
                  style={{
                    fontFamily: "ui-sans-serif, system-ui",
                    color: p.color,
                  }}
                >
                  {p.val}
                </div>
                <div className="mt-4 h-1.5" style={{ background: `${INK}15` }}>
                  <div
                    style={{
                      width: `${p.val}%`,
                      height: "100%",
                      background: p.color,
                    }}
                  />
                </div>
                {p.val < 85 && (
                  <div
                    className="mt-3 inline-block px-2 py-0.5 font-mono text-[9.5px] tracking-[0.18em] uppercase"
                    style={{ background: RED, color: PAPER }}
                  >
                    Needs attention
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `2px solid ${INK}` }}>
        <div className="max-w-[1100px] mx-auto px-8 py-6 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">
          <span>Risograph theme · printed on warm cream paper</span>
          <span>{new Date().getFullYear()} · CrawlIQ press</span>
        </div>
      </footer>
    </main>
  );
}
