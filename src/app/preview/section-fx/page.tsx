"use client";

import Link from "next/link";
import { SweepSection } from "@/components/section-sweep";

const SECTIONS = [
  { num: "01", label: "The problem", body: "Most audit reports are 60-page PDFs that nobody reads past page three." },
  { num: "02", label: "Method", body: "Five specialist agents run in parallel against eight named data sources." },
  { num: "03", label: "Deliverable", body: "Three things to fix first, in order, with the reason next to each." },
  { num: "04", label: "Pricing", body: "Free tier for testing. Paid tiers start at $49/mo. No annual lock-in." },
  { num: "05", label: "Action", body: "Run an audit. The page above did its own audit live in your browser." },
];

export default function SectionFxPreview() {
  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted/70 hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border)] rounded backdrop-blur"
      >
        ← preview index
      </Link>

      <header className="pt-24 pb-10 px-6 md:px-10 text-center">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-4">
          ◇ Phase 7 · accent sweep section transitions
        </div>
        <h1 className="font-display font-black text-[clamp(26px,4.2vw,54px)] leading-[1] tracking-[-0.03em] mb-5 max-w-[680px] mx-auto">
          Scroll. Each section enters with a sweep.
        </h1>
        <p className="text-fg-muted text-[14px] leading-[1.6] max-w-[540px] mx-auto">
          Pure CSS + Framer Motion + IntersectionObserver. No WebGL needed for this; runs at 60fps even on integrated graphics.
        </p>
      </header>

      {SECTIONS.map((s, i) => (
        <SweepSection
          key={s.num}
          id={`section-${s.num}`}
          className={`min-h-[55vh] flex items-center px-6 md:px-10 py-16 ${i % 2 === 0 ? "bg-[color:var(--color-bg)]" : "bg-[color:var(--color-bg-2)]"}`}
        >
          <div className="max-w-[760px] mx-auto w-full">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-5">
              ◇ § {s.num} / 05 · {s.label}
            </div>
            <h2 className="font-display font-black text-[clamp(20px,3vw,36px)] leading-[1.15] tracking-[-0.02em] mb-5 max-w-[28ch]">
              {s.body}
            </h2>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-fg-faint">
              ↓ scroll to next section
            </div>
          </div>
        </SweepSection>
      ))}
    </main>
  );
}
