/**
 * Orchestrator: runs all real-data checks for an audit, in parallel where possible.
 * Returns the union of every signal we trust enough to surface as a finding.
 *
 * Free data sources stacked here:
 *   - cheerio crawl (HTML structure)
 *   - PageSpeed Insights / Lighthouse (lab-data CWV)
 *   - Chrome UX Report / CrUX (real-user CWV)
 *   - Security headers (HSTS, CSP, etc)
 *   - Schema.org JSON-LD validation
 *   - Wayback Machine (site history, domain age)
 *   - OpenPageRank (domain authority proxy, optional w/ API key)
 */

import { crawlSite, type CrawlSignals } from "@/lib/audit";
import {
  runLighthouse,
  type LighthouseReport,
} from "@/lib/checks/pagespeed";
import {
  checkSecurityHeaders,
  type SecurityHeadersReport,
} from "@/lib/checks/security-headers";
import { validateSchema, type SchemaReport } from "@/lib/checks/schema";
import { getCruxReport, type CruxReport } from "@/lib/checks/crux";
import { getWaybackReport, type WaybackReport } from "@/lib/checks/wayback";
import {
  getOpenPageRank,
  type OpenPageRankReport,
} from "@/lib/checks/openpagerank";

export type AggregatedChecks = {
  crawl: CrawlSignals;
  lighthouse: LighthouseReport | null;
  lighthouseError?: string;
  crux: CruxReport | null;
  security: SecurityHeadersReport | null;
  securityError?: string;
  schema: SchemaReport | null;
  wayback: WaybackReport | null;
  openPageRank: OpenPageRankReport | null;
};

export async function runAllChecks(url: string): Promise<AggregatedChecks> {
  // crawl first because schema reuses the HTML
  const crawl = await crawlSite(url);
  const finalUrl = crawl.finalUrl;

  // run remaining checks in parallel
  const [lighthouseRes, securityRes, cruxRes, waybackRes, oprRes] =
    await Promise.allSettled([
      runLighthouse(finalUrl, "mobile"),
      checkSecurityHeaders(finalUrl),
      getCruxReport(finalUrl),
      getWaybackReport(finalUrl),
      getOpenPageRank(finalUrl),
    ]);

  // schema validation needs raw HTML — re-fetch (fast, cached)
  let schema: SchemaReport | null = null;
  try {
    const res = await fetch(finalUrl, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "CrawlIQ/1.0 (+https://crawliq.ai; schema validator)",
      },
      signal: AbortSignal.timeout(12_000),
    });
    const html = await res.text();
    schema = validateSchema(html);
  } catch {
    schema = null;
  }

  return {
    crawl,
    lighthouse:
      lighthouseRes.status === "fulfilled" ? lighthouseRes.value : null,
    lighthouseError:
      lighthouseRes.status === "rejected"
        ? lighthouseRes.reason instanceof Error
          ? lighthouseRes.reason.message
          : String(lighthouseRes.reason)
        : undefined,
    crux: cruxRes.status === "fulfilled" ? cruxRes.value : null,
    security:
      securityRes.status === "fulfilled" ? securityRes.value : null,
    securityError:
      securityRes.status === "rejected"
        ? securityRes.reason instanceof Error
          ? securityRes.reason.message
          : String(securityRes.reason)
        : undefined,
    schema,
    wayback: waybackRes.status === "fulfilled" ? waybackRes.value : null,
    openPageRank: oprRes.status === "fulfilled" ? oprRes.value : null,
  };
}
