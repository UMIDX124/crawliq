"use client";

/**
 * /preview/scroll-hero — original CrawlIQ 3D-scene hero preview.
 *
 * Composition pattern: massive centered headline + subhead + single CTA,
 * with an interactive 3D scene as full-bleed background.
 *
 * Staged on a preview route so the live homepage stays untouched until
 * approved.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";

const ThreeSceneHero = dynamic(
  () => import("@/components/three-scene-hero").then((m) => m.ThreeSceneHero),
  { ssr: false, loading: () => null },
);

export default function ScrollHeroPreview() {
  const [url, setUrl] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let v = url.trim();
    if (!v.startsWith("http://") && !v.startsWith("https://")) v = "https://" + v;
    window.location.href = `/audit?url=${encodeURIComponent(v)}`;
  };

  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] overflow-hidden">
      {/* preview chrome */}
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted/70 hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border)] rounded backdrop-blur"
      >
        ← preview index
      </Link>

      {/* HERO — 3D scene full-bleed behind, content centered on top */}
      <section className="relative w-full h-[100dvh] min-h-[640px] flex items-center justify-center">
        {/* 3D scene as full-bleed background */}
        <div className="absolute inset-0 z-0">
          <ThreeSceneHero />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-10 text-center pointer-events-none">
          {/* eyebrow */}
          <div
            className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full border border-[color:var(--color-border-accent)] bg-[color:var(--color-bg)]/65 backdrop-blur px-3.5 py-1.5 mb-8 font-mono text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-accent)]"
            style={{ animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)]" />
            267 signals · 5 specialist agents · live
          </div>

          {/* MASSIVE headline */}
          <h1
            className="font-display font-black tracking-[-0.04em] leading-[0.92] text-balance mx-auto mb-7"
            style={{
              fontSize: "clamp(56px, 9.5vw, 144px)",
              animation: "fade-up 0.9s 0.1s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            Audit your site{" "}
            <span className="italic font-light text-fg-muted">like</span>{" "}
            <br className="hidden sm:inline" />
            an <span className="text-[color:var(--color-accent)] not-italic font-black">expert.</span>
          </h1>

          {/* subhead */}
          <p
            className="text-fg-muted text-[16px] md:text-[19px] leading-[1.55] max-w-[640px] mx-auto mb-12"
            style={{
              animation: "fade-up 0.9s 0.25s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            Five AI auditors crawl your site in parallel. They explain what&rsquo;s
            broken, why it matters, and how to fix it — in eight seconds.
          </p>

          {/* URL input + CTA */}
          <form
            onSubmit={submit}
            className="pointer-events-auto inline-flex items-center bg-[color:var(--color-bg)]/85 backdrop-blur border border-[color:var(--color-border-strong)] rounded-full p-1.5 max-w-[520px] w-full mx-auto"
            style={{
              animation: "fade-up 0.9s 0.4s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <span className="px-4 font-mono text-[12px] text-fg-faint shrink-0 hidden sm:inline">
              https://
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//, ""))}
              placeholder="yourwebsite.com"
              className="flex-1 min-w-0 bg-transparent px-3 py-3 outline-none text-[14px] sm:text-[15px] placeholder:text-fg-faint"
              autoComplete="off"
              spellCheck={false}
              aria-label="Website URL"
            />
            <button
              type="submit"
              className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] font-bold hover:bg-[color:var(--color-accent-hover)]"
            >
              <Sparkle size={13} weight="fill" />
              <span className="hidden sm:inline">Run audit</span>
              <ArrowRight size={13} weight="bold" />
            </button>
          </form>

          {/* trust row */}
          <div
            className="mt-8 flex items-center justify-center gap-x-7 gap-y-2 flex-wrap font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint pointer-events-auto"
            style={{
              animation: "fade-up 0.9s 0.55s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <span>● No signup</span>
            <span>● No card</span>
            <span>● Results in &lt;10s</span>
          </div>
        </div>

        {/* "Press and drag to orbit" caption */}
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] tracking-[0.22em] uppercase text-fg-muted/70 px-4 py-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/40 backdrop-blur"
          style={{
            animation: "fade-up 0.9s 0.8s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          ◇ press and drag to orbit · scroll to enter
        </div>

        {/* corner labels */}
        <div className="pointer-events-none absolute inset-0 font-mono text-[9.5px] tracking-[0.22em] uppercase text-fg-muted/55 z-10">
          <span className="absolute top-6 left-6">◇ audit.engine · v1</span>
          <span className="absolute top-6 right-6">267 signals</span>
          <span className="absolute bottom-24 left-6 hidden md:inline">5 pillars</span>
          <span className="absolute bottom-24 right-6 hidden md:inline tabular-nums">
            {new Date().toISOString().slice(0, 10)}
          </span>
        </div>
      </section>

      {/* scroll teaser */}
      <section className="relative py-32 px-6 md:px-10">
        <div className="max-w-[820px] mx-auto text-center">
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-fg-muted mb-6">
            ↓ continue scrolling
          </div>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,52px)] leading-[1.05] tracking-[-0.025em] mb-6">
            Below the hero — your site&rsquo;s findings, ranked.
          </h2>
          <p className="text-fg-muted text-[16px] leading-[1.7]">
            This is a preview route. Once you approve the hero, it replaces the
            templated layout on the live homepage. Scroll behavior, pillar
            sections, pricing, FAQ — all the existing sections stay; only the
            hero changes.
          </p>
        </div>
      </section>
    </main>
  );
}
