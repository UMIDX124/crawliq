"use client";

import { useEffect, useState } from "react";

type Metric = {
  key: string;
  label: string;
  value: string;
  status: "pass" | "warn" | "crit" | "pending";
  source: "live" | "build" | "static";
};

/**
 * Sticky right-rail that audits the marketing page itself, live.
 * - Lazy-loads web-vitals for real LCP / CLS / INP / FCP / TTFB
 * - Reads document.title length, meta description length, h1 count, image alt coverage
 * - Updates as the visitor scrolls (scroll depth + section in view)
 *
 * The pitch: every other audit tool's landing page would FAIL these checks.
 * Ours doesn't. The page is the proof.
 */
export function LiveAuditMargin() {
  const [metrics, setMetrics] = useState<Metric[]>(initial);
  const [scrollPct, setScrollPct] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  // DOM-derived metrics (run once on mount)
  useEffect(() => {
    const upd: Partial<Record<string, Metric>> = {};

    const titleLen = document.title.length;
    upd.title = mkMetric(
      "title",
      "Title",
      `${titleLen}c`,
      titleLen <= 60 && titleLen >= 30 ? "pass" : "warn",
      "build",
    );

    const desc = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content") ?? "";
    upd.meta = mkMetric(
      "meta",
      "Meta desc",
      `${desc.length}c`,
      desc.length >= 100 && desc.length <= 160 ? "pass" : "warn",
      "build",
    );

    const h1s = document.querySelectorAll("h1").length;
    upd.h1 = mkMetric(
      "h1",
      "H1 count",
      String(h1s),
      h1s === 1 ? "pass" : "warn",
      "build",
    );

    const imgs = Array.from(document.querySelectorAll("img"));
    const withAlt = imgs.filter((i) => (i.alt ?? "").trim().length > 0).length;
    const altPct = imgs.length === 0 ? 100 : Math.round((withAlt / imgs.length) * 100);
    upd.alt = mkMetric(
      "alt",
      "Alt-text",
      `${altPct}%`,
      altPct >= 95 ? "pass" : altPct >= 80 ? "warn" : "crit",
      "build",
    );

    const canon = document.querySelector('link[rel="canonical"]');
    upd.canonical = mkMetric(
      "canonical",
      "Canonical",
      canon ? "set" : "missing",
      canon ? "pass" : "crit",
      "build",
    );

    const og = document.querySelector('meta[property="og:image"]');
    upd.og = mkMetric(
      "og",
      "OG image",
      og ? "set" : "missing",
      og ? "pass" : "warn",
      "build",
    );

    const schema = document.querySelector('script[type="application/ld+json"]');
    upd.schema = mkMetric(
      "schema",
      "JSON-LD",
      schema ? "present" : "absent",
      schema ? "pass" : "warn",
      "build",
    );

    setMetrics((prev) => merge(prev, upd));
  }, []);

  // web-vitals (lazy)
  useEffect(() => {
    let cancelled = false;
    import("web-vitals").then(({ onLCP, onCLS, onINP, onFCP, onTTFB }) => {
      if (cancelled) return;
      onLCP((m) => updMetric("lcp", "LCP", `${(m.value / 1000).toFixed(2)}s`, m.value < 2500 ? "pass" : m.value < 4000 ? "warn" : "crit"));
      onCLS((m) => updMetric("cls", "CLS", m.value.toFixed(3), m.value < 0.1 ? "pass" : m.value < 0.25 ? "warn" : "crit"));
      onINP((m) => updMetric("inp", "INP", `${Math.round(m.value)}ms`, m.value < 200 ? "pass" : m.value < 500 ? "warn" : "crit"));
      onFCP((m) => updMetric("fcp", "FCP", `${(m.value / 1000).toFixed(2)}s`, m.value < 1800 ? "pass" : m.value < 3000 ? "warn" : "crit"));
      onTTFB((m) => updMetric("ttfb", "TTFB", `${Math.round(m.value)}ms`, m.value < 800 ? "pass" : m.value < 1800 ? "warn" : "crit"));
    });

    function updMetric(k: string, l: string, v: string, s: Metric["status"]) {
      setMetrics((prev) =>
        prev.map((m) => (m.key === k ? { ...m, value: v, status: s, source: "live" } : m)),
      );
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // scroll depth tracking
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      setScrollPct(Math.min(100, Math.round((scrolled / max) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside
      aria-label="Live page audit"
      className="hidden 2xl:block fixed right-4 top-28 z-40 w-[208px] font-mono"
    >
      <div className="rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/85 backdrop-blur-md shadow-[0_8px_24px_-12px_rgb(0_0_0_/_0.18)] overflow-hidden">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border-b border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-2)] transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-pass)] pulse-dot" />
            <span className="text-[9.5px] tracking-[0.18em] uppercase text-fg-muted">
              live · self-audit
            </span>
          </span>
          <span className="text-[9.5px] text-fg-faint">
            {collapsed ? "+" : "−"}
          </span>
        </button>

        {!collapsed && (
          <>
            <div className="px-3 pt-3 pb-2 border-b border-[color:var(--color-border)]">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[9.5px] tracking-[0.18em] uppercase text-fg-muted">
                  scroll
                </span>
                <span className="text-[10.5px] tabular-nums text-fg">
                  {scrollPct}%
                </span>
              </div>
              <div className="h-[3px] bg-[color:var(--color-bg-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--color-accent)] transition-[width] duration-150"
                  style={{ width: `${scrollPct}%` }}
                />
              </div>
            </div>

            <ul className="px-3 py-2.5 space-y-[7px] text-[10.5px]">
              {metrics.map((m) => (
                <li key={m.key} className="flex items-center gap-2">
                  <Dot status={m.status} />
                  <span className="text-fg-muted w-[68px] truncate">{m.label}</span>
                  <span className="ml-auto tabular-nums text-fg">{m.value}</span>
                </li>
              ))}
            </ul>

            <div className="px-3 py-2 border-t border-[color:var(--color-border)] flex items-center justify-between text-[9px] tracking-[0.16em] uppercase text-fg-faint">
              <span>this page</span>
              <span>· run by CrawlIQ</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function Dot({ status }: { status: Metric["status"] }) {
  const c =
    status === "pass"
      ? "var(--color-pass)"
      : status === "warn"
        ? "var(--color-warn)"
        : status === "crit"
          ? "var(--color-crit)"
          : "var(--color-fg-faint)";
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: c }}
      aria-hidden
    />
  );
}

function mkMetric(
  key: string,
  label: string,
  value: string,
  status: Metric["status"],
  source: Metric["source"],
): Metric {
  return { key, label, value, status, source };
}

function merge(prev: Metric[], upd: Partial<Record<string, Metric>>): Metric[] {
  return prev.map((m) => upd[m.key] ?? m);
}

const initial: Metric[] = [
  { key: "lcp", label: "LCP", value: "…", status: "pending", source: "live" },
  { key: "cls", label: "CLS", value: "…", status: "pending", source: "live" },
  { key: "inp", label: "INP", value: "…", status: "pending", source: "live" },
  { key: "fcp", label: "FCP", value: "…", status: "pending", source: "live" },
  { key: "ttfb", label: "TTFB", value: "…", status: "pending", source: "live" },
  { key: "title", label: "Title", value: "…", status: "pending", source: "build" },
  { key: "meta", label: "Meta desc", value: "…", status: "pending", source: "build" },
  { key: "h1", label: "H1 count", value: "…", status: "pending", source: "build" },
  { key: "alt", label: "Alt-text", value: "…", status: "pending", source: "build" },
  { key: "canonical", label: "Canonical", value: "…", status: "pending", source: "build" },
  { key: "og", label: "OG image", value: "…", status: "pending", source: "build" },
  { key: "schema", label: "JSON-LD", value: "…", status: "pending", source: "build" },
];
