/**
 * Chrome UX Report (CrUX) API.
 * Real-world performance data from actual Chrome users — NOT lab simulation.
 * Lighthouse runs once on a Google server; CrUX is what real visitors experience.
 *
 * Free, no quota for reasonable usage. Same API key as PageSpeed Insights.
 * Docs: https://developer.chrome.com/docs/crux/api
 */

const CRUX_URL =
  "https://chromeuxreport.googleapis.com/v1/records:queryRecord";

export type CruxMetric = {
  /** p75 value, the threshold below which 75% of users fall */
  p75: number;
  /** "Good", "Needs Improvement", "Poor" — based on CWV thresholds */
  bucket: "good" | "ni" | "poor" | null;
};

export type CruxReport = {
  url: string;
  /** "url" if the URL had its own data, "origin" if we fell back to origin */
  scope: "url" | "origin";
  collectionPeriodEnd: string | null;
  metrics: {
    lcp: CruxMetric | null;
    cls: CruxMetric | null;
    inp: CruxMetric | null;
    ttfb: CruxMetric | null;
    fcp: CruxMetric | null;
  };
};

type CruxResponse = {
  record: {
    key: { url?: string; origin?: string };
    metrics: Record<
      string,
      {
        percentiles: { p75: number };
        histogram: { start: number; end?: number; density: number }[];
      }
    >;
    collectionPeriod: {
      lastDate: { year: number; month: number; day: number };
    };
  };
};

const METRIC_KEYS = {
  lcp: "largest_contentful_paint",
  cls: "cumulative_layout_shift",
  inp: "interaction_to_next_paint",
  ttfb: "experimental_time_to_first_byte",
  fcp: "first_contentful_paint",
} as const;

function bucketFor(metric: keyof typeof METRIC_KEYS, p75: number): CruxMetric["bucket"] {
  // Core Web Vitals thresholds
  switch (metric) {
    case "lcp":
      return p75 <= 2500 ? "good" : p75 <= 4000 ? "ni" : "poor";
    case "cls":
      return p75 <= 0.1 ? "good" : p75 <= 0.25 ? "ni" : "poor";
    case "inp":
      return p75 <= 200 ? "good" : p75 <= 500 ? "ni" : "poor";
    case "ttfb":
      return p75 <= 800 ? "good" : p75 <= 1800 ? "ni" : "poor";
    case "fcp":
      return p75 <= 1800 ? "good" : p75 <= 3000 ? "ni" : "poor";
  }
}

async function fetchOnce(
  body: Record<string, unknown>,
): Promise<CruxResponse | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const url = apiKey ? `${CRUX_URL}?key=${apiKey}` : CRUX_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (res.status === 404) return null; // no CrUX data for this URL/origin
  if (!res.ok) return null;
  return (await res.json()) as CruxResponse;
}

export async function getCruxReport(rawUrl: string): Promise<CruxReport | null> {
  const target = new URL(rawUrl);

  // try URL-level first
  let resp = await fetchOnce({
    url: target.toString(),
    formFactor: "PHONE",
  });
  let scope: "url" | "origin" = "url";

  // fallback to origin
  if (!resp) {
    const origin = `${target.protocol}//${target.host}`;
    resp = await fetchOnce({ origin, formFactor: "PHONE" });
    scope = "origin";
  }
  if (!resp) return null;

  const cp = resp.record.collectionPeriod.lastDate;
  const collectionPeriodEnd = cp
    ? `${cp.year}-${String(cp.month).padStart(2, "0")}-${String(cp.day).padStart(2, "0")}`
    : null;

  const m = resp.record.metrics;
  const get = (k: keyof typeof METRIC_KEYS): CruxMetric | null => {
    const data = m[METRIC_KEYS[k]];
    if (!data) return null;
    const p75 = data.percentiles?.p75;
    if (p75 === undefined) return null;
    return { p75, bucket: bucketFor(k, p75) };
  };

  return {
    url: rawUrl,
    scope,
    collectionPeriodEnd,
    metrics: {
      lcp: get("lcp"),
      cls: get("cls"),
      inp: get("inp"),
      ttfb: get("ttfb"),
      fcp: get("fcp"),
    },
  };
}
