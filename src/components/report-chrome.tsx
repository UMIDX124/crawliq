/**
 * Report-style chrome that wraps the marketing page.
 * - Top bar: "AUDIT REPORT · Subject: crawliq.io · Prepared by CrawlIQ · Page X of Y"
 * - Bottom: methodology appendix anchor + page-of-pages
 *
 * The pitch: this isn't a marketing site, it's a deliverable.
 * Visitors scroll the same artifact CrawlIQ produces for paying clients.
 */

import { CalendarBlank, FileText, Hash } from "@phosphor-icons/react/dist/ssr";

export function ReportTopBar() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="sticky top-0 z-30 bg-[color:var(--color-bg-2)] border-b border-[color:var(--color-border-strong)] shadow-[0_1px_0_0_rgb(21_17_13_/_0.04),0_8px_18px_-12px_rgb(21_17_13_/_0.10)]">
      {/* hairline accent rail — ink + tangerine 2-color print */}
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-ink) 0%, var(--color-ink) 60%, var(--color-accent) 60%, var(--color-accent) 100%)",
        }}
        aria-hidden
      />
      <div className="max-w-[1480px] mx-auto px-5 md:px-10 py-2.5 flex items-center justify-between gap-3 font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={12} weight="bold" className="text-[color:var(--color-accent)] shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Audit report</span>
          <span className="text-[color:var(--color-fg-faint)] hidden sm:inline">·</span>
          <span className="whitespace-nowrap truncate">
            <span className="text-[color:var(--color-fg-faint)]">Subject:</span>{" "}
            <span className="text-[color:var(--color-fg)] font-semibold">crawliq.io</span>
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <CalendarBlank size={11} weight="bold" />
            {dateStr}
          </span>
          <span className="hidden md:inline text-[color:var(--color-fg-faint)]">·</span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Hash size={11} weight="bold" />
            <span className="text-[color:var(--color-fg-faint)]">Rev</span>
            <span className="text-[color:var(--color-fg)] font-semibold">{(process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function ReportAppendixDivider({ section }: { section: string }) {
  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-fg-faint">
      <span className="truncate">{section}</span>
      <span className="hidden sm:inline text-fg-faint/60 shrink-0">— · —</span>
      <span className="whitespace-nowrap shrink-0">CrawlIQ · Confidential</span>
    </div>
  );
}
