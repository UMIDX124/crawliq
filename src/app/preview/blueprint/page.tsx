/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function BlueprintPreview() {
  return (
    <main
      className="min-h-[100dvh] text-[#C4D9E8]"
      style={{
        background: "#0E1620",
        backgroundImage:
          "linear-gradient(to right, rgba(0,180,216,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,180,216,0.06) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-[#C4D9E8]/50 hover:text-[#00B4D8] px-3 py-2 rounded border border-[#00B4D8]/20"
      >
        ← all themes
      </Link>

      {/* Header */}
      <header className="border-b border-[#00B4D8]/15">
        <div className="max-w-[1280px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-[12px]">
            <span className="inline-block w-2.5 h-2.5 rotate-45 border border-[#00B4D8]" />
            <span className="font-bold text-[15px] tracking-tight text-white">
              CrawlIQ<span className="text-[#00B4D8]">·</span>
            </span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C4D9E8]/50">
            sheet 01 / 04 · scale 1:1
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00B4D8] mb-6">
            ◇ technical-drawing.audit-engine
          </div>
          <h1
            className="font-extrabold tracking-[-0.03em] leading-[0.92] text-white text-[clamp(40px,7vw,84px)]"
            style={{ fontFamily: "ui-sans-serif, system-ui" }}
          >
            Your website,<br />
            <span className="text-[#00B4D8]">measured</span> like a<br />
            mechanical part.
          </h1>
          <p className="mt-7 max-w-[480px] text-[15px] leading-[1.7] text-[#C4D9E8]/75">
            Five inspectors run dimensional checks across 267 signals. You get
            a tolerance report, not a 60-page PDF nobody reads.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex items-center border border-[#00B4D8]/40 bg-[#0E1620]/80 backdrop-blur">
              <span className="px-4 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-[#C4D9E8]/50 border-r border-[#00B4D8]/20">
                URL
              </span>
              <input
                placeholder="yoursite.com"
                className="bg-transparent px-4 py-3 outline-none font-mono text-[13px] text-white placeholder:text-[#C4D9E8]/30 w-56"
              />
              <button className="bg-[#00B4D8] text-[#0E1620] px-5 py-3 font-mono text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white">
                Run
              </button>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-x-10 max-w-md font-mono">
            {[
              { v: "267", l: "checks per audit" },
              { v: "<8s", l: "median run time" },
              { v: "5", l: "specialist agents" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[28px] tabular-nums text-white">{s.v}</div>
                <div className="mt-1.5 text-[9.5px] tracking-[0.18em] uppercase text-[#C4D9E8]/50">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: wireframe pentagon (one per pillar) */}
        <div className="hidden lg:block">
          <WireframePentagon />
        </div>
      </section>

      {/* Feature card */}
      <section className="border-t border-[#00B4D8]/15">
        <div className="max-w-[1280px] mx-auto px-8 py-20">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00B4D8] mb-3">
            ◇ score.weighted-composite
          </div>
          <h2 className="font-extrabold text-[36px] tracking-tight text-white mb-12">
            Five pillars. One tolerance report.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-[#00B4D8]/15 border border-[#00B4D8]/15">
            {[
              { name: "On-Page", val: 92 },
              { name: "Technical", val: 81 },
              { name: "Content", val: 94 },
              { name: "Off-Site", val: 88 },
              { name: "Competitor", val: 86 },
            ].map((p) => (
              <div key={p.name} className="bg-[#0E1620] p-6">
                <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#C4D9E8]/55 mb-3">
                  {p.name}
                </div>
                <div className="font-mono text-[42px] tabular-nums text-white leading-none">
                  {p.val}
                </div>
                <div className="mt-3 h-px bg-[#00B4D8]/20 relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#00B4D8]"
                    style={{ width: `${p.val}%` }}
                  />
                </div>
                <div className="mt-2 font-mono text-[9.5px] tracking-[0.16em] uppercase text-[#C4D9E8]/40">
                  ± 0.5 tol
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#00B4D8]/15 py-6 px-8">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-[#C4D9E8]/40">
          <span>blueprint theme · technical-drawing aesthetic</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}

function WireframePentagon() {
  // pentagon w/ 5 vertices labeled
  const cx = 200;
  const cy = 200;
  const r = 140;
  const labels = ["On-Page", "Technical", "Content", "Off-Site", "Competitor"];
  const points = labels.map((_, i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const inner = labels.map((_, i) => {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const f = [0.92, 0.81, 0.94, 0.88, 0.86][i];
    return [cx + r * f * Math.cos(a), cy + r * f * Math.sin(a)];
  });
  return (
    <svg viewBox="0 0 400 400" width="100%" className="max-w-[460px] mx-auto">
      {/* concentric pentagons */}
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={points
            .map((p) => `${cx + (p[0] - cx) * s},${cy + (p[1] - cy) * s}`)
            .join(" ")}
          fill="none"
          stroke="#00B4D8"
          strokeOpacity={0.2}
          strokeDasharray="2 4"
          strokeWidth="1"
        />
      ))}
      {/* spokes */}
      {points.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p[0]}
          y2={p[1]}
          stroke="#00B4D8"
          strokeOpacity={0.25}
          strokeWidth="1"
        />
      ))}
      {/* score polygon */}
      <polygon
        points={inner.map((p) => p.join(",")).join(" ")}
        fill="#00B4D8"
        fillOpacity={0.12}
        stroke="#00B4D8"
        strokeWidth="1.5"
      />
      {/* vertex dots */}
      {inner.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#00B4D8" />
      ))}
      {/* labels */}
      {points.map((p, i) => {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const lx = cx + (r + 28) * Math.cos(a);
        const ly = cy + (r + 28) * Math.sin(a);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle"}
            fontFamily="ui-monospace, Menlo, monospace"
            fontSize="10"
            fill="#C4D9E8"
            fillOpacity={0.7}
            letterSpacing="2"
            style={{ textTransform: "uppercase" }}
          >
            {labels[i]}
          </text>
        );
      })}
      {/* center crosshair */}
      <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke="#00B4D8" strokeWidth="1" />
      <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke="#00B4D8" strokeWidth="1" />
      {/* corner brackets */}
      {[
        [10, 10],
        [390, 10],
        [10, 390],
        [390, 390],
      ].map((c, i) => {
        const dx = c[0] === 10 ? 1 : -1;
        const dy = c[1] === 10 ? 1 : -1;
        return (
          <g key={i} stroke="#00B4D8" strokeWidth="1.5" fill="none">
            <line x1={c[0]} y1={c[1]} x2={c[0] + 12 * dx} y2={c[1]} />
            <line x1={c[0]} y1={c[1]} x2={c[0]} y2={c[1] + 12 * dy} />
          </g>
        );
      })}
    </svg>
  );
}
