/**
 * Google PageSpeed Insights API wrapper.
 *
 * Real Lighthouse audits — same engine Google uses for ranking.
 * Free quota with API key: 25,000 requests/day.
 * Without key: ~10 req/min unauthenticated (best-effort, fine for pilot).
 *
 * Docs: https://developers.google.com/speed/docs/insights/v5/get-started
 */

const PSI_BASE =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export type Strategy = "mobile" | "desktop";

export type CoreWebVitals = {
  /** Largest Contentful Paint (ms) */
  lcp: number | null;
  /** Cumulative Layout Shift (unitless) */
  cls: number | null;
  /** Interaction to Next Paint (ms) */
  inp: number | null;
  /** Time to First Byte (ms) */
  ttfb: number | null;
  /** First Contentful Paint (ms) */
  fcp: number | null;
  /** Speed Index (ms) */
  si: number | null;
  /** Total Blocking Time (ms) */
  tbt: number | null;
};

export type LighthouseAudit = {
  id: string;
  title: string;
  description: string;
  score: number | null;
  /** Human-readable value, e.g. "1.8 s" or "0 elements" */
  displayValue: string | null;
  /** "informative" | "manual" | "metric" or numeric for scoring audits */
  scoreDisplayMode: string;
  /** Estimated ms savings, when applicable (Lighthouse opportunities) */
  numericValue: number | null;
};

export type LighthouseReport = {
  url: string;
  fetchedAt: Date;
  strategy: Strategy;
  /** 0-100 category scores (null if unavailable) */
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  cwv: CoreWebVitals;
  /** Failed audits worth surfacing (score < 0.9 or boolean = false) */
  failingAudits: LighthouseAudit[];
  /** Opportunities — actions ranked by expected ms savings */
  opportunities: LighthouseAudit[];
  /** Passed audits (so we can tell users what's working) */
  passingAudits: LighthouseAudit[];
};

const NUMERIC_AUDIT_IDS = new Set([
  "first-contentful-paint",
  "largest-contentful-paint",
  "speed-index",
  "total-blocking-time",
  "cumulative-layout-shift",
  "interaction-to-next-paint",
  "server-response-time",
]);

export async function runLighthouse(
  url: string,
  strategy: Strategy = "mobile",
): Promise<LighthouseReport> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const params = new URLSearchParams({
    url,
    strategy,
  });
  // PSI accepts repeated `category` params for each Lighthouse category
  for (const cat of ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"]) {
    params.append("category", cat);
  }
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(`${PSI_BASE}?${params.toString()}`, {
    // PSI runs Lighthouse on the request — can take 30-60s
    signal: AbortSignal.timeout(70_000),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `PageSpeed Insights returned ${res.status}: ${text.slice(0, 240)}`,
    );
  }

  type PSIResponse = {
    lighthouseResult: {
      categories: Record<
        string,
        { score: number | null }
      >;
      audits: Record<
        string,
        {
          id: string;
          title: string;
          description: string;
          score: number | null;
          scoreDisplayMode: string;
          displayValue?: string;
          numericValue?: number;
        }
      >;
    };
  };
  const data = (await res.json()) as PSIResponse;
  const lr = data.lighthouseResult;

  const cwv: CoreWebVitals = {
    lcp: numericFrom(lr.audits["largest-contentful-paint"]),
    cls: numericFrom(lr.audits["cumulative-layout-shift"]),
    inp: numericFrom(lr.audits["interaction-to-next-paint"]),
    ttfb: numericFrom(lr.audits["server-response-time"]),
    fcp: numericFrom(lr.audits["first-contentful-paint"]),
    si: numericFrom(lr.audits["speed-index"]),
    tbt: numericFrom(lr.audits["total-blocking-time"]),
  };

  const allAudits = Object.values(lr.audits).map(toLighthouseAudit);

  // Lighthouse: score < 0.9 = needs improvement (yellow), score < 0.5 = failing (red)
  const failingAudits = allAudits.filter(
    (a) =>
      a.scoreDisplayMode === "binary" || a.scoreDisplayMode === "numeric"
        ? a.score !== null && a.score < 0.9
        : false,
  );

  const opportunities = failingAudits
    .filter((a) => (a.numericValue ?? 0) > 0 && !NUMERIC_AUDIT_IDS.has(a.id))
    .sort((a, b) => (b.numericValue ?? 0) - (a.numericValue ?? 0));

  const passingAudits = allAudits.filter(
    (a) =>
      (a.scoreDisplayMode === "binary" || a.scoreDisplayMode === "numeric") &&
      a.score !== null &&
      a.score >= 0.9,
  );

  return {
    url,
    fetchedAt: new Date(),
    strategy,
    scores: {
      performance: scoreOrNull(lr.categories.performance),
      accessibility: scoreOrNull(lr.categories.accessibility),
      bestPractices: scoreOrNull(lr.categories["best-practices"]),
      seo: scoreOrNull(lr.categories.seo),
    },
    cwv,
    failingAudits,
    opportunities,
    passingAudits,
  };
}

function scoreOrNull(cat: { score: number | null } | undefined): number | null {
  if (!cat || cat.score === null || cat.score === undefined) return null;
  return Math.round(cat.score * 100);
}

function numericFrom(audit: { numericValue?: number } | undefined): number | null {
  if (!audit || audit.numericValue === undefined) return null;
  return audit.numericValue;
}

function toLighthouseAudit(a: {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  numericValue?: number;
}): LighthouseAudit {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    score: a.score,
    scoreDisplayMode: a.scoreDisplayMode,
    displayValue: a.displayValue ?? null,
    numericValue: a.numericValue ?? null,
  };
}
