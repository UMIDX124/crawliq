/**
 * Wayback Machine CDX API — free, unlimited, no auth.
 * Returns site history: first archive, latest archive, total snapshots.
 * Useful for: "this domain has been online since 2018", change-frequency,
 * and verifying a site's age signal for SEO trust.
 *
 * Docs: https://archive.org/help/wayback_api.php
 */

const CDX_BASE = "https://web.archive.org/cdx/search/cdx";

export type WaybackReport = {
  url: string;
  totalSnapshots: number;
  firstSnapshot: string | null; // YYYYMMDDHHMMSS
  lastSnapshot: string | null;
  domainAgeYears: number | null;
};

type CdxRow = string[];

export async function getWaybackReport(rawUrl: string): Promise<WaybackReport | null> {
  const target = new URL(rawUrl);
  const host = target.host;

  // Use a single query with limit=1&showResumeKey to get total + first
  const params = new URLSearchParams({
    url: host + "/*",
    output: "json",
    fl: "timestamp",
    limit: "1",
    from: "1996",
  });

  let firstSnapshot: string | null = null;
  let lastSnapshot: string | null = null;
  let totalSnapshots = 0;

  try {
    // first snapshot
    const firstRes = await fetch(`${CDX_BASE}?${params.toString()}`, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (firstRes.ok) {
      const data = (await firstRes.json()) as CdxRow[];
      // CDX returns header row first, then data rows
      firstSnapshot = data[1]?.[0] ?? null;
    }

    // last snapshot
    params.set("limit", "-1"); // -1 = newest
    const lastRes = await fetch(`${CDX_BASE}?${params.toString()}`, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (lastRes.ok) {
      const data = (await lastRes.json()) as CdxRow[];
      lastSnapshot = data[1]?.[0] ?? null;
    }

    // total — use showNumPages or just count via small page
    const countParams = new URLSearchParams({
      url: host + "/*",
      output: "json",
      fl: "timestamp",
      showNumPages: "true",
    });
    const countRes = await fetch(`${CDX_BASE}?${countParams.toString()}`, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (countRes.ok) {
      const text = (await countRes.text()).trim();
      // showNumPages returns just a number per page (each page = 150k snapshots)
      const pages = parseInt(text, 10);
      if (!Number.isNaN(pages)) {
        totalSnapshots = pages * 150_000; // upper-bound estimate
      }
    }
  } catch {
    return null;
  }

  let domainAgeYears: number | null = null;
  if (firstSnapshot && /^\d{14}$/.test(firstSnapshot)) {
    const y = Number(firstSnapshot.slice(0, 4));
    if (y >= 1996 && y <= new Date().getFullYear()) {
      domainAgeYears = new Date().getFullYear() - y;
    }
  }

  return {
    url: rawUrl,
    totalSnapshots,
    firstSnapshot,
    lastSnapshot,
    domainAgeYears,
  };
}
