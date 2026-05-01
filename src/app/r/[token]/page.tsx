import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  WarningCircle,
  XCircle,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { Logo } from "@/components/logo";
import type { Severity } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const audit = await db.audit.findFirst({
    where: { shareToken: token },
    select: { url: true, score: true, grade: true },
  });
  if (!audit) return { title: "Audit not found" };
  return {
    title: `${audit.url} — score ${audit.score}/100 (${audit.grade})`,
    description: `Public CrawlIQ audit report for ${audit.url}.`,
  };
}

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const audit = await db.audit.findFirst({
    where: { shareToken: token, status: "COMPLETED" },
    include: {
      project: true,
      findings: { orderBy: { severity: "asc" } },
    },
  });
  if (!audit) notFound();

  const counts = {
    crit: audit.findings.filter((f) => f.severity === "CRITICAL").length,
    warn: audit.findings.filter((f) => f.severity === "WARNING").length,
    pass: audit.findings.filter((f) => f.severity === "PASS").length,
  };

  // resolve project branding (white-label)
  const brandName = audit.project?.brandName ?? "CrawlIQ";
  const brandColor = audit.project?.brandColor ?? "var(--color-accent)";
  const brandLogo = audit.project?.brandLogoUrl ?? null;

  return (
    <main className="min-h-[100dvh]">
      {/* header */}
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container-page h-16 flex items-center justify-between">
          {brandLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandLogo} alt={brandName} className="h-7 w-auto" />
          ) : (
            <Logo size="md" />
          )}
          <Link
            href="/sign-up"
            className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]"
          >
            <Sparkle size={12} weight="fill" />
            Run yours
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="py-14 md:py-20">
        <div className="container-page max-w-5xl">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Public audit · {brandName}
          </span>
          <h1 className="font-display font-extrabold mt-4 text-[clamp(28px,4.5vw,52px)] leading-[1.05] tracking-[-0.025em] break-all">
            {audit.url}
          </h1>
          <div className="mt-3 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
            Audited{" "}
            {(audit.endedAt ?? audit.createdAt).toLocaleDateString()} ·{" "}
            {audit.scope === "multi"
              ? `${audit.pageCount} pages`
              : "single page"}
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
              <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
                Score
              </div>
              <div
                className="mt-3 font-display font-extrabold text-[68px] leading-none tabular-nums"
                style={{ color: brandColor }}
              >
                {audit.score ?? "—"}
                <span className="text-fg-faint text-[24px] font-normal">
                  /100
                </span>
              </div>
              <div
                className="mt-1.5 font-mono text-[11px] tracking-[0.14em] uppercase"
                style={{ color: brandColor }}
              >
                Grade {audit.grade ?? "—"}
              </div>
              {audit.summary && (
                <p className="mt-6 text-[13.5px] leading-[1.65] text-fg-muted">
                  {audit.summary}
                </p>
              )}
              <div className="mt-7 pt-6 border-t border-[color:var(--color-border)] grid grid-cols-3 gap-3">
                <Tally label="Critical" value={counts.crit} status="crit" />
                <Tally label="Warning" value={counts.warn} status="warn" />
                <Tally label="Passing" value={counts.pass} status="pass" />
              </div>
            </aside>

            <div className="flex flex-col gap-3">
              {audit.findings.map((f) => (
                <FindingCard
                  key={f.id}
                  title={f.title}
                  detail={f.detail}
                  category={f.category}
                  severity={f.severity}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-2)]">
        <div className="container-page max-w-3xl text-center">
          <span className="eyebrow">
            <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
            Powered by CrawlIQ
          </span>
          <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
            Run an audit on your own site.
          </h2>
          <p className="mt-4 text-fg-muted text-[15px] leading-[1.65] max-w-xl mx-auto">
            8 trusted data sources — Lighthouse, Chrome UX Report, Google
            Search Console, Wayback Machine, Open PageRank, security headers,
            schema validation, and structural crawl. Free for 3 audits a month.
          </p>
          <Link
            href="/sign-up"
            className="btn-tactile mt-8 inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
          >
            <Sparkle size={13} weight="fill" />
            Audit your site free
            <ArrowRight size={13} weight="bold" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function FindingCard({
  title,
  detail,
  category,
  severity,
}: {
  title: string;
  detail: string;
  category: string;
  severity: Severity;
}) {
  const map = {
    CRITICAL: { Icon: XCircle, color: "var(--color-crit)", bg: "var(--color-crit-bg)", label: "Critical" },
    WARNING: { Icon: WarningCircle, color: "var(--color-warn)", bg: "var(--color-warn-bg)", label: "Warning" },
    PASS: { Icon: CheckCircle, color: "var(--color-pass)", bg: "var(--color-pass-bg)", label: "Passing" },
  } as const;
  const m = map[severity];
  const Icon = m.Icon;
  return (
    <article
      className="rounded-lg border p-6 flex gap-4 items-start"
      style={{ backgroundColor: m.bg, borderColor: "var(--color-border)" }}
    >
      <Icon size={22} weight="fill" style={{ color: m.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span
            className="font-mono text-[10px] tracking-[0.18em] uppercase font-bold"
            style={{ color: m.color }}
          >
            {m.label}
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
            {category}
          </span>
        </div>
        <h3 className="font-display font-bold text-[16px] mb-2">{title}</h3>
        <p className="text-[14px] leading-[1.65] text-fg-muted">{detail}</p>
      </div>
    </article>
  );
}

function Tally({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: "pass" | "warn" | "crit";
}) {
  const color =
    status === "pass" ? "var(--color-pass)" : status === "warn" ? "var(--color-warn)" : "var(--color-crit)";
  return (
    <div>
      <div
        className="font-display font-extrabold text-[24px] leading-none tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
        {label}
      </div>
    </div>
  );
}
