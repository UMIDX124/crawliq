import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowSquareOut, MagnifyingGlass, Plug, X } from "@phosphor-icons/react/dist/ssr";
import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { isGscConfigured } from "@/lib/google-search-console";
import { SearchConsoleClient } from "./search-console-client";

export const metadata = { title: "Search Console" };

export default async function SearchConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const { status, error } = await searchParams;
  const user = await requireUser();
  const conn = await db.searchConsoleConnection.findUnique({
    where: { userId: user.id },
  });

  return (
    <>
      <AppTopbar title="Search Console" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div>
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              Real Google data
            </span>
            <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
              Search Console.
            </h2>
            <p className="mt-3 text-fg-muted text-[15px] leading-[1.65] max-w-xl">
              Connect your verified site once. We&rsquo;ll show real
              impressions, clicks, queries, and average position straight from
              Google — alongside our audit findings.
            </p>
          </div>

          {status === "connected" && (
            <div className="mt-7 rounded-lg border border-[color:var(--color-pass)]/30 bg-[color:var(--color-pass-bg)] p-5">
              <div className="font-display font-bold text-[14.5px] text-[color:var(--color-pass)]">
                Connected as {conn?.email}
              </div>
              <p className="mt-1 text-[13.5px] text-fg-muted leading-[1.55]">
                Pick a verified site below to see your last 28 days of search performance.
              </p>
            </div>
          )}
          {error && (
            <div className="mt-7 rounded-lg border border-[color:var(--color-crit)]/30 bg-[color:var(--color-crit-bg)] p-5">
              <div className="font-display font-bold text-[14.5px] text-[color:var(--color-crit)]">
                Connection failed
              </div>
              <p className="mt-1 text-[13.5px] text-fg-muted leading-[1.55]">
                {decodeURIComponent(error)}
              </p>
            </div>
          )}

          {!isGscConfigured() ? (
            <NotConfigured />
          ) : conn ? (
            <SearchConsoleClient connectedEmail={conn.email} />
          ) : (
            <ConnectPanel />
          )}
        </div>
      </main>
    </>
  );
}

function ConnectPanel() {
  return (
    <div className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10">
      <div className="max-w-xl">
        <Plug
          size={28}
          weight="duotone"
          className="text-[color:var(--color-accent)] mb-5"
        />
        <h3 className="font-display font-bold text-[18px] mb-2">
          Connect your Google Search Console
        </h3>
        <p className="text-[14.5px] leading-[1.65] text-fg-muted mb-7">
          Read-only — we only request the &lsquo;view your search data&rsquo;
          scope. Disconnect anytime. We never write, post, or modify anything
          in your Google account.
        </p>
        <a
          href="/api/search-console/connect"
          className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
        >
          <Plug size={13} weight="bold" />
          Connect Search Console
          <ArrowSquareOut size={13} weight="bold" />
        </a>
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-10">
      <div className="max-w-xl">
        <MagnifyingGlass
          size={28}
          weight="duotone"
          className="text-fg-faint mb-5"
        />
        <h3 className="font-display font-bold text-[18px] mb-2">
          Google OAuth not configured
        </h3>
        <p className="text-[14.5px] leading-[1.65] text-fg-muted">
          Add <code className="font-mono text-[12.5px] text-fg">GOOGLE_OAUTH_CLIENT_ID</code> and{" "}
          <code className="font-mono text-[12.5px] text-fg">GOOGLE_OAUTH_CLIENT_SECRET</code>{" "}
          to your env vars to enable Search Console connection.
        </p>
        <Link
          href="/settings"
          className="mt-6 inline-block font-mono text-[11px] tracking-[0.16em] uppercase text-[color:var(--color-accent)] hover:underline"
        >
          ← Back to settings
        </Link>
      </div>
    </div>
  );
}
