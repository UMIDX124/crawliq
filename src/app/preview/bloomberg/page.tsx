/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function BloombergPreview() {
  return (
    <main
      className="min-h-[100dvh] text-[#E5C07B] relative"
      style={{
        background: "#000000",
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
      }}
    >
      {/* CRT scanlines overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, #E5C07B 2px, #E5C07B 3px)",
        }}
      />

      <Link
        href="/preview"
        className="fixed top-3 left-3 z-50 text-[10px] tracking-[0.2em] uppercase text-[#E5C07B]/60 hover:text-white px-3 py-1.5 border border-[#E5C07B]/25"
      >
        ← all themes
      </Link>

      <div className="relative z-10">
        {/* Header bar — like Bloomberg terminal top */}
        <header className="border-b border-[#E5C07B]/30 bg-[#0a0905]">
          <div className="max-w-[1280px] mx-auto px-6 py-2.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-6">
              <span className="text-white font-bold">CRAWLIQ&lt;GO&gt;</span>
              <span className="text-[#E5C07B]/60">AUDIT TERMINAL</span>
              <span className="text-[#E5C07B]/40">|</span>
              <span className="text-[#E5C07B]/60">SESSION 0001</span>
            </div>
            <div className="flex items-center gap-6 text-[#E5C07B]/60">
              <span className="text-[#00DC82]">● ONLINE</span>
              <span>{new Date().toISOString().slice(0, 19).replace("T", " ")} UTC</span>
            </div>
          </div>
        </header>

        {/* Main */}
        <section className="max-w-[1280px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10">
          <div>
            <div className="text-[11px] tracking-[0.18em] text-[#E5C07B]/55 mb-5">
              [audit.engine] :: rev 4.7 :: 5 agents online
            </div>
            <h1 className="text-[clamp(36px,6vw,72px)] leading-[1.02] tracking-tight text-white font-bold">
              YOUR SITE,<br />
              <span className="text-[#E5C07B]">FROM A TRADING DESK.</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-[14px] leading-[1.7] text-[#E5C07B]/75">
              267 signals streamed in parallel. Score updates in real time. No
              dashboards, no ceremony — just the readout an operator needs to
              act in eight seconds.
            </p>

            <div className="mt-8 border border-[#E5C07B]/30 bg-[#0a0905] flex">
              <span className="px-4 py-3 text-[11px] tracking-[0.18em] text-[#E5C07B]/55 border-r border-[#E5C07B]/30">
                URL&gt;
              </span>
              <input
                placeholder="yoursite.com"
                className="bg-transparent flex-1 px-4 py-3 outline-none text-[13px] text-white placeholder:text-[#E5C07B]/30"
              />
              <button className="bg-[#E5C07B] text-black px-6 py-3 text-[11px] tracking-[0.18em] font-bold hover:bg-white">
                EXEC ↵
              </button>
            </div>

            {/* Live tape */}
            <div className="mt-8 border-t border-b border-[#E5C07B]/20 py-3 overflow-hidden">
              <div className="flex gap-8 text-[11px] whitespace-nowrap">
                {[
                  ["TITLE", "ok", "+0"],
                  ["META", "ok", "+0"],
                  ["H1", "ALERT", "-3"],
                  ["LCP", "warn", "-1"],
                  ["CANONICAL", "ALERT", "-5"],
                  ["SCHEMA", "ok", "+1"],
                  ["TLS", "ok", "+0"],
                ].map(([k, s, d]) => {
                  const c =
                    s === "ALERT"
                      ? "text-[#FF4757]"
                      : s === "warn"
                        ? "text-[#E5C07B]"
                        : "text-[#00DC82]";
                  return (
                    <span key={k}>
                      <span className="text-[#E5C07B]/50">{k}</span>{" "}
                      <span className={c}>{s.toUpperCase()}</span>{" "}
                      <span className="text-[#E5C07B]/40">{d}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: live readout */}
          <div className="border border-[#E5C07B]/25">
            <div className="px-4 py-2 border-b border-[#E5C07B]/25 bg-[#0a0905] flex items-center justify-between text-[10.5px] tracking-[0.16em]">
              <span className="text-[#E5C07B]">[ score.live ]</span>
              <span className="text-[#E5C07B]/60">tick 0.4s</span>
            </div>
            <div className="p-5 text-[12px] space-y-2">
              {[
                { k: "On-Page", v: 92, c: "#00DC82" },
                { k: "Technical", v: 81, c: "#E5C07B" },
                { k: "Content", v: 94, c: "#00DC82" },
                { k: "Off-Site", v: 88, c: "#00DC82" },
                { k: "Competitor", v: 86, c: "#00DC82" },
              ].map((r) => (
                <div key={r.k} className="flex items-center gap-3">
                  <span className="text-[#E5C07B]/65 w-24">{r.k.padEnd(10, " ")}</span>
                  <span className="flex-1 h-3 bg-[#E5C07B]/10 relative">
                    <span
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${r.v}%`, background: r.c }}
                    />
                  </span>
                  <span className="text-white tabular-nums w-10 text-right">{r.v}</span>
                </div>
              ))}
              <div className="border-t border-[#E5C07B]/20 pt-3 mt-4 flex items-baseline justify-between">
                <span className="text-[#E5C07B]/60 text-[10px] tracking-[0.16em]">
                  SCORE.OVERALL
                </span>
                <span className="text-white text-[34px] tabular-nums leading-none font-bold">
                  88
                </span>
              </div>
              <div className="text-[10px] text-[#E5C07B]/45 tracking-[0.1em]">
                ─────────────────────────────────
              </div>
              <div className="text-[10.5px] text-[#E5C07B]/65 leading-relaxed">
                ALERT: missing canonical on /blog/* (3 routes)
                <br />
                WARN: LCP 2.4s &gt; budget 2.0s
                <br />
                <span className="text-[#00DC82]">PASS: schema.org Organization detected</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#E5C07B]/25 px-6 py-3">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between text-[10px] tracking-[0.18em] text-[#E5C07B]/45">
            <span>BLOOMBERG-AMBER · CRT PHOSPHOR · ANTI-MARKETING</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
