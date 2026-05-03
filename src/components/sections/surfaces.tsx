"use client";

/**
 * Surfaces — the verb-as-product proof.
 *
 * Six glass-morphic mockups of CrawlIQ running inside the tools agencies
 * already use. The product itself doesn't have a screen here — these mockups
 * are the product. The viewer scans six surfaces in 5 seconds and gets the
 * thesis: CrawlIQ shows up where the work happens, not in a new dashboard.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  SlackLogo,
  GithubLogo,
  NotionLogo,
  EnvelopeSimple,
  ChatCircleText,
  Browser,
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { Reveal } from "@/components/reveal";
import { ReportEyebrow } from "@/components/glyph";
import { cn } from "@/lib/cn";

type SurfaceId = "slack" | "github" | "notion" | "email" | "sms" | "browser";

const SURFACES: { id: SurfaceId; label: string; tag: string; Icon: typeof SlackLogo }[] = [
  { id: "slack",   label: "Slack",   tag: "/crawliq",     Icon: SlackLogo },
  { id: "github",  label: "GitHub",  tag: "@crawliq",     Icon: GithubLogo },
  { id: "notion",  label: "Notion",  tag: "/crawliq",     Icon: NotionLogo },
  { id: "email",   label: "Email",   tag: "crawl@",       Icon: EnvelopeSimple },
  { id: "sms",     label: "SMS",     tag: "+1·CRAWLIQ",   Icon: ChatCircleText },
  { id: "browser", label: "Browser", tag: "right-click",  Icon: Browser },
];

export function Surfaces() {
  const [active, setActive] = useState<SurfaceId>("slack");

  return (
    <section
      id="surfaces"
      className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      <div className="container-page">
        <Reveal y={32} className="max-w-3xl">
          <ReportEyebrow num="02">The verb · six surfaces</ReportEyebrow>
          <h2 className="display-2xl mt-5">
            Type{" "}
            <span className="font-mono text-[color:var(--color-term-bg)] bg-[color:var(--color-term)] px-2 py-0.5 rounded-md tracking-tight">
              crawliq
            </span>{" "}
            <span className="italic font-normal [font-family:var(--font-serif)] tracking-[-0.01em] text-fg-muted">
              anywhere your team already lives.
            </span>
          </h2>
          <p className="mt-7 max-w-[58ch] text-fg-muted text-[16px] md:text-[17px] leading-[1.7]">
            We&rsquo;re not a tool you log into. We&rsquo;re a verb that shows
            up inside Slack, GitHub, Notion, your inbox, your phone, and any
            browser tab. Same engine, six interfaces, zero new logins.
          </p>
        </Reveal>

        {/* Tab strip */}
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-2">
            {SURFACES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={cn(
                  "btn-tactile inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border font-mono text-[11px] tracking-[0.16em] uppercase transition-colors",
                  active === s.id
                    ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-ink-fg)] shadow-ink"
                    : "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-fg-muted hover:border-[color:var(--color-ink)] hover:text-fg",
                )}
              >
                <s.Icon size={14} weight={active === s.id ? "fill" : "regular"} />
                {s.label}
                <span
                  className={cn(
                    "font-mono text-[9.5px] tracking-tight normal-case ml-1 px-1.5 py-0.5 rounded",
                    active === s.id
                      ? "bg-[color:var(--color-term)] text-[color:var(--color-term-bg)]"
                      : "bg-[color:var(--color-bg-3)] text-fg-faint",
                  )}
                >
                  {s.tag}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Surface stage */}
        <Reveal delay={0.18}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] shadow-layered-xl p-6 sm:p-8 md:p-10"
          >
            {active === "slack" && <SlackMock />}
            {active === "github" && <GithubMock />}
            {active === "notion" && <NotionMock />}
            {active === "email" && <EmailMock />}
            {active === "sms" && <SmsMock />}
            {active === "browser" && <BrowserMock />}
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Slack ──────────────────────────────────────────────────────────────────

function SlackMock() {
  return (
    <div className="rounded-xl bg-[#1A1D21] text-white overflow-hidden border border-white/5">
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 text-[13px]">
        <span className="text-white/55">#</span>
        <span className="font-semibold">acme-client</span>
        <span className="text-white/30 text-[11px] ml-2">42 members</span>
      </div>
      <div className="p-5 space-y-5 font-sans">
        <Bubble who="alex" time="10:14" body={
          <>
            <span className="font-mono text-[13px] bg-white/10 px-2 py-0.5 rounded">
              /crawliq audit acme.com
            </span>
          </>
        } />
        <Bubble who="crawliq" time="10:14" verified body={
          <>
            <div className="text-[14px] mb-3">
              ✓ Audit complete · <span className="text-emerald-400 font-semibold">87/100</span> · 8.2s ·{" "}
              <a className="text-blue-400 underline">view living audit →</a>
            </div>
            <div className="space-y-2 text-[13px]">
              <FindingLine sev="crit" title="H1 missing" detail="/blog/post-3 — most-read page last 30d" />
              <FindingLine sev="warn" title="Alt-text 84%" detail="14 images missing across 6 product pages" />
              <FindingLine sev="pass" title="Canonical · all set" detail="247 URLs scanned" />
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 text-[12px]">
              <button className="px-3 py-1.5 rounded bg-emerald-500 text-black font-semibold">Open 23 PRs</button>
              <button className="px-3 py-1.5 rounded bg-white/10 text-white/80">Send to client</button>
              <button className="px-3 py-1.5 rounded bg-white/10 text-white/80">Schedule re-audit</button>
            </div>
          </>
        } />
      </div>
    </div>
  );
}

function Bubble({
  who,
  time,
  verified,
  body,
}: {
  who: string;
  time: string;
  verified?: boolean;
  body: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "w-9 h-9 rounded-md grid place-items-center font-bold text-[12px] shrink-0 mt-0.5",
          who === "crawliq"
            ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
            : "bg-white/15 text-white",
        )}
      >
        {who === "crawliq" ? "Q" : who[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-[14px]">
            {who === "crawliq" ? "CrawlIQ" : who}
          </span>
          {verified && (
            <span className="text-[10px] tracking-[0.16em] uppercase text-emerald-400">
              ✓ App
            </span>
          )}
          <span className="text-[11.5px] text-white/40">{time}</span>
        </div>
        <div className="leading-[1.55] text-[14px] text-white/90">{body}</div>
      </div>
    </div>
  );
}

function FindingLine({
  sev,
  title,
  detail,
}: {
  sev: "crit" | "warn" | "pass";
  title: string;
  detail: string;
}) {
  const Icon = sev === "crit" ? XCircle : sev === "warn" ? WarningCircle : CheckCircle;
  const color =
    sev === "crit" ? "text-red-400" : sev === "warn" ? "text-amber-400" : "text-emerald-400";
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} weight="fill" className={cn("mt-0.5 shrink-0", color)} />
      <div className="min-w-0">
        <span className="font-semibold">{title}</span>
        <span className="text-white/55"> · {detail}</span>
      </div>
    </div>
  );
}

// ─── GitHub ─────────────────────────────────────────────────────────────────

function GithubMock() {
  return (
    <div className="rounded-xl bg-[#0D1117] text-[#E6EDF3] overflow-hidden border border-white/5 font-mono">
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 text-[12.5px]">
        <GithubLogo size={16} weight="fill" />
        <span className="text-white/55">acme-corp /</span>
        <span className="font-semibold">marketing-site</span>
        <span className="text-white/30">·</span>
        <span className="text-emerald-400">PR #842</span>
        <span className="text-white/30">Update hero copy & meta tags</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="text-[13px] text-white/70">
          <span className="font-semibold text-white">@you</span> requested a review from{" "}
          <span className="text-blue-400">@crawliq</span>
        </div>
        <div className="rounded-md border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-[color:var(--color-accent)] grid place-items-center text-[10px] font-bold text-[color:var(--color-accent-fg)]">
              Q
            </div>
            <span className="font-semibold text-[13px]">crawliq[bot]</span>
            <span className="text-[10.5px] text-white/40">commented · just now</span>
          </div>
          <div className="text-[13px] leading-[1.6] space-y-2">
            <div className="text-white/85">
              ⚠ <span className="text-amber-400 font-semibold">SEO regression detected</span> — score{" "}
              <span className="text-amber-400">−6 pts</span> on this PR (87 → 81).
            </div>
            <div className="text-white/65">
              · <span className="text-red-400">Title length 78c</span> — Google truncates at ~60c.
            </div>
            <div className="text-white/65">
              · <span className="text-amber-400">Meta description missing</span> on /pricing (was set on main).
            </div>
            <div className="text-white/65">
              · <span className="text-emerald-400">+1 win</span>: H1 hierarchy now valid on /about.
            </div>
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center gap-2">
              <button className="px-3 py-1 rounded bg-emerald-500 text-black font-semibold text-[11px]">
                Open fix PR ↓
              </button>
              <button className="px-3 py-1 rounded bg-white/10 text-white/80 text-[11px]">
                Approve regression
              </button>
              <span className="ml-auto text-[10.5px] text-white/40">
                blocking · score-budget 5 pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notion ─────────────────────────────────────────────────────────────────

function NotionMock() {
  return (
    <div className="rounded-xl bg-white text-[#37352F] overflow-hidden border border-black/5 shadow-inner">
      <div className="px-5 py-3 border-b border-black/5 flex items-center gap-3 text-[12.5px]">
        <span className="text-black/40">📄</span>
        <span className="font-medium">Clients / Northwood Capital / SEO</span>
      </div>
      <div className="p-7 space-y-5">
        <h3 className="text-[26px] font-semibold tracking-tight">Northwood — Q2 SEO plan</h3>
        <p className="text-[14.5px] leading-[1.7] text-black/65">
          Plan for the next quarter, anchored to the live audit Alex ran in our
          standup last week. Findings update live; this doc is the source of truth.
        </p>
        <div className="rounded-lg border border-black/8 bg-black/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3 text-[11.5px] tracking-[0.16em] uppercase text-black/40">
            <div className="w-5 h-5 rounded bg-[color:var(--color-accent)] grid place-items-center text-[9px] font-bold text-white">
              Q
            </div>
            crawliq · live audit
            <span className="ml-auto text-emerald-600">●</span>
            <span className="text-black/50 normal-case tracking-normal">
              re-audited 12 min ago
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Stat label="Score" value="87" trend="+4" />
            <Stat label="Critical" value="2" trend="−3" />
            <Stat label="Warnings" value="14" trend="−6" />
          </div>
          <div className="text-[13px] space-y-1.5 text-black/70">
            <div>
              <span className="font-semibold text-black">▸</span> H1 missing on /blog/post-3 ·{" "}
              <span className="text-black/45">unfixed since Mar 18</span>
            </div>
            <div>
              <span className="font-semibold text-emerald-700">✓</span> JSON-LD schema added
              site-wide ·{" "}
              <span className="text-black/45">shipped Apr 02 by @maria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, trend }: { label: string; value: string; trend: string }) {
  const positive = trend.startsWith("+") || trend.startsWith("−") && parseInt(trend.slice(1), 10) > 0;
  return (
    <div>
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-black/40">{label}</div>
      <div className="flex items-baseline gap-2 mt-0.5">
        <span className="text-[28px] font-bold tracking-tight text-black/85 tabular-nums">
          {value}
        </span>
        <span className={cn("text-[12px] font-semibold", positive ? "text-emerald-600" : "text-red-600")}>
          {trend}
        </span>
      </div>
    </div>
  );
}

// ─── Email ──────────────────────────────────────────────────────────────────

function EmailMock() {
  return (
    <div className="rounded-xl bg-white text-[#1F2328] overflow-hidden border border-black/5">
      <div className="px-5 py-3 border-b border-black/5 flex items-center gap-3 text-[12.5px] text-black/60">
        <EnvelopeSimple size={16} weight="duotone" />
        <span className="font-medium text-black">Inbox · 1 new</span>
        <span className="ml-auto text-black/40">10:42 AM</span>
      </div>
      <div className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[color:var(--color-accent)] grid place-items-center text-[13px] font-bold text-[color:var(--color-accent-fg)]">
            Q
          </div>
          <div>
            <div className="font-semibold text-[14.5px]">CrawlIQ &lt;crawl@crawliq.ai&gt;</div>
            <div className="text-[12px] text-black/55">to alex@northwood.com</div>
          </div>
        </div>
        <div className="text-[18px] font-semibold mb-4 leading-tight">
          Re: northwood.com — audit complete (87/100, top 3 fixes attached)
        </div>
        <div className="text-[14px] leading-[1.7] text-black/75 space-y-3">
          <p>Alex —</p>
          <p>
            You forwarded northwood.com 28 seconds ago. Five auditors finished
            in 8.2s. Score 87. Top 3 wins, ranked by impact:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              <strong>Title tag truncation</strong> on /pricing (78c → trim to 58c).
              Predicted CTR lift: +12%.
            </li>
            <li>
              <strong>Missing JSON-LD Article schema</strong> on 14 blog posts.
            </li>
            <li>
              <strong>Internal linking gap</strong> — 4 high-traffic pages
              orphaned from the homepage hub.
            </li>
          </ol>
          <p>
            Living audit URL (auto-updates as your team ships fixes):{" "}
            <a className="text-[color:var(--color-accent)] underline">
              crawliq.ai/r/nw-q2
            </a>
          </p>
          <p className="text-black/55 text-[13px] pt-2 border-t border-black/5">
            Reply to this thread with another URL to audit it. No login required.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SMS ────────────────────────────────────────────────────────────────────

function SmsMock() {
  return (
    <div className="max-w-[420px] mx-auto">
      <div className="rounded-[40px] bg-black p-2 shadow-layered-xl">
        <div className="rounded-[32px] bg-[#F2F2F7] overflow-hidden">
          <div className="bg-white px-5 py-3 border-b border-black/5 flex items-center justify-between text-[12.5px] text-black/60">
            <span>9:41</span>
            <span className="font-mono tracking-[0.16em]">crawliq</span>
            <span>5G</span>
          </div>
          <div className="px-4 py-5 space-y-3">
            <div className="flex justify-end">
              <div className="bg-[#0A84FF] text-white rounded-2xl rounded-br-md px-4 py-2 text-[14px] max-w-[80%]">
                acme.com
              </div>
            </div>
            <div className="text-[10.5px] tracking-[0.16em] uppercase text-black/40 text-center pt-2">
              CrawlIQ · 8s later
            </div>
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 text-[13.5px] max-w-[85%] shadow-sm">
                <div className="font-semibold mb-1">Score 87/100 · grade A</div>
                <div className="text-black/70 leading-[1.55]">
                  Top 3:
                  <br />· H1 missing on /blog/post-3
                  <br />· Title 78c on /pricing
                  <br />· 14 imgs missing alt-text
                </div>
                <div className="mt-2 text-[12px]">
                  <span className="text-[color:var(--color-accent)] underline">
                    crawliq.ai/r/q2x
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 text-[12px] text-black/55 max-w-[70%] shadow-sm">
                Reply with another URL to audit it.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Browser ────────────────────────────────────────────────────────────────

function BrowserMock() {
  return (
    <div className="rounded-xl bg-[#FAFBFC] overflow-hidden border border-black/8">
      <div className="px-4 py-2.5 border-b border-black/8 flex items-center gap-2.5">
        <span className="terminal-chrome-dot bg-[#FF5F57]" />
        <span className="terminal-chrome-dot bg-[#FEBC2E]" />
        <span className="terminal-chrome-dot bg-[#28C840]" />
        <div className="ml-3 flex-1 px-3 py-1 rounded-md bg-white border border-black/5 font-mono text-[11.5px] text-black/55">
          🔒 https://acme.com
        </div>
        <div className="px-2 py-1 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-mono text-[10px] font-bold tracking-[0.14em] uppercase shadow-sm">
          Q · audit
        </div>
      </div>
      <div className="grid grid-cols-[1fr_280px]">
        <div className="p-8 text-black/30">
          <div className="space-y-3">
            <div className="h-3 w-2/3 bg-black/10 rounded" />
            <div className="h-3 w-1/2 bg-black/10 rounded" />
            <div className="h-3 w-3/4 bg-black/10 rounded" />
          </div>
        </div>
        <div className="border-l border-black/8 bg-white p-5">
          <div className="text-[10.5px] tracking-[0.16em] uppercase text-black/45 mb-3">
            crawliq · this page
          </div>
          <div className="text-[28px] font-bold tracking-tight tabular-nums mb-4">
            87<span className="text-[16px] text-black/40 font-normal">/100</span>
          </div>
          <div className="space-y-2.5 text-[12.5px]">
            <RowItem sev="warn" label="Title 78c · trim to 58c" />
            <RowItem sev="crit" label="H1 missing" />
            <RowItem sev="pass" label="Canonical set" />
            <RowItem sev="pass" label="HTTPS" />
            <RowItem sev="warn" label="Alt-text 84%" />
          </div>
          <button className="mt-5 w-full py-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] text-[11px] font-mono tracking-[0.14em] uppercase font-bold">
            Open 5 fix PRs →
          </button>
        </div>
      </div>
    </div>
  );
}

function RowItem({ sev, label }: { sev: "crit" | "warn" | "pass"; label: string }) {
  const color =
    sev === "crit"
      ? "bg-red-500"
      : sev === "warn"
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("w-1.5 h-1.5 rounded-full", color)} />
      <span className="text-black/75">{label}</span>
    </div>
  );
}
