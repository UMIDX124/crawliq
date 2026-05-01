"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowsClockwise, Globe, Plug } from "@phosphor-icons/react";
import { AuditTrendChart } from "@/components/app/audit-trend-chart";

type Site = { siteUrl: string; permissionLevel: string };

type Row = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type DataResponse = {
  siteUrl: string;
  range: { startDate: string; endDate: string; days: number };
  totals: { clicks: number; impressions: number };
  rows: Row[];
  timeseries: {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
};

export function SearchConsoleClient({
  connectedEmail,
}: {
  connectedEmail: string;
}) {
  const router = useRouter();
  const [sites, setSites] = useState<Site[] | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [activeSite, setActiveSite] = useState<string | null>(null);
  const [data, setData] = useState<DataResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSites();
  }, []);

  async function loadSites() {
    setLoadingSites(true);
    try {
      const res = await fetch("/api/search-console/sites");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load sites");
      const list: Site[] = json.sites ?? [];
      setSites(list);
      if (list.length > 0 && !activeSite) {
        setActiveSite(list[0].siteUrl);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingSites(false);
    }
  }

  useEffect(() => {
    if (activeSite) void loadData(activeSite);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSite]);

  async function loadData(siteUrl: string) {
    setLoadingData(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/search-console/data?siteUrl=${encodeURIComponent(siteUrl)}&days=28&dimension=query`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load data");
      setData(json);
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoadingData(false);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect Google Search Console?")) return;
    await fetch("/api/search-console/disconnect", { method: "POST" });
    router.refresh();
  }

  const trendPoints = useMemo(() => {
    if (!data?.timeseries) return [];
    // map clicks 0..max to 0..100 for the trend chart
    const max = Math.max(...data.timeseries.map((t) => t.clicks), 1);
    return data.timeseries.map((t) => ({
      date: new Date(t.date),
      score: Math.round((t.clicks / max) * 100),
    }));
  }, [data]);

  return (
    <div className="mt-10">
      {/* connection meta */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-fg-muted">
          Connected as <span className="text-fg">{connectedEmail}</span>
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted hover:text-[color:var(--color-crit)] transition-colors"
        >
          <Plug size={12} weight="bold" />
          Disconnect
        </button>
      </div>

      {/* sites picker */}
      <div className="mb-8">
        <label className="block font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted mb-2.5">
          Verified site
        </label>
        {loadingSites ? (
          <div className="font-mono text-[12px] text-fg-muted">Loading sites…</div>
        ) : sites && sites.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[color:var(--color-border-strong)] p-5">
            <p className="text-[13.5px] text-fg-muted leading-[1.6]">
              You don&rsquo;t have any verified sites yet. Add and verify a property in{" "}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--color-accent)] hover:underline"
              >
                Google Search Console
              </a>{" "}
              first.
            </p>
          </div>
        ) : (
          <div className="relative">
            <select
              value={activeSite ?? ""}
              onChange={(e) => setActiveSite(e.target.value)}
              className="appearance-none w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3.5 py-3 text-[14px] outline-none focus:border-[color:var(--color-accent)] focus:shadow-[0_0_0_4px_var(--color-accent-soft)] pr-10"
            >
              {sites?.map((s) => (
                <option key={s.siteUrl} value={s.siteUrl}>
                  {s.siteUrl}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[12px] text-fg-faint">
              ▼
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-[color:var(--color-crit)]/30 bg-[color:var(--color-crit-bg)] p-5 mb-8">
          <p className="text-[13.5px] text-fg-muted leading-[1.55]">{error}</p>
        </div>
      )}

      {/* totals + chart */}
      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-xl overflow-hidden border border-[color:var(--color-border)]">
            <Stat label="Clicks · 28d" value={data.totals.clicks.toLocaleString()} accent />
            <Stat
              label="Impressions · 28d"
              value={data.totals.impressions.toLocaleString()}
            />
            <Stat
              label="CTR avg"
              value={
                data.totals.impressions > 0
                  ? `${((data.totals.clicks / data.totals.impressions) * 100).toFixed(2)}%`
                  : "—"
              }
            />
            <Stat
              label="Top queries"
              value={String(data.rows.length)}
            />
          </div>

          <div className="mt-8 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
            <div className="flex items-center justify-between mb-5">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Daily clicks
              </span>
              <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                {data.range.startDate} → {data.range.endDate}
              </span>
            </div>
            <AuditTrendChart points={trendPoints} />
          </div>

          {/* top queries table */}
          <div className="mt-8 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--color-border)]">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                Top 25 queries
              </span>
              <button
                type="button"
                onClick={() => activeSite && loadData(activeSite)}
                className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
              >
                <ArrowsClockwise size={11} weight="bold" />
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
                    <th className="text-left px-6 py-3">Query</th>
                    <th className="text-right px-3 py-3">Clicks</th>
                    <th className="text-right px-3 py-3">Impressions</th>
                    <th className="text-right px-3 py-3">CTR</th>
                    <th className="text-right px-6 py-3">Avg position</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr
                      key={i}
                      className={
                        i > 0
                          ? "border-t border-[color:var(--color-border)]"
                          : ""
                      }
                    >
                      <td className="px-6 py-3 truncate max-w-[400px]">{r.keys[0]}</td>
                      <td className="text-right px-3 py-3 font-mono tabular-nums">
                        {r.clicks}
                      </td>
                      <td className="text-right px-3 py-3 font-mono tabular-nums text-fg-muted">
                        {r.impressions.toLocaleString()}
                      </td>
                      <td className="text-right px-3 py-3 font-mono tabular-nums text-fg-muted">
                        {(r.ctr * 100).toFixed(2)}%
                      </td>
                      <td className="text-right px-6 py-3 font-mono tabular-nums text-fg-muted">
                        {r.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {loadingData && !data && (
        <div className="font-mono text-[12px] text-fg-muted mt-8">Loading data…</div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-[color:var(--color-surface)] p-5 sm:p-6">
      <div
        className="font-display font-extrabold text-[26px] sm:text-[30px] leading-none tabular-nums"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-fg)" }}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted">
        {label}
      </div>
    </div>
  );
}
