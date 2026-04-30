/**
 * Orchestrator: runs all real-data checks for an audit, in parallel where possible.
 * Returns the union of every signal we trust enough to surface as a finding.
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

export type AggregatedChecks = {
  crawl: CrawlSignals;
  lighthouse: LighthouseReport | null;
  lighthouseError?: string;
  security: SecurityHeadersReport | null;
  securityError?: string;
  schema: SchemaReport | null;
};

export async function runAllChecks(url: string): Promise<AggregatedChecks> {
  // crawl first because security + schema reuse parts of it
  const crawl = await crawlSite(url);
  const finalUrl = crawl.finalUrl;

  // run remaining checks in parallel
  const [lighthouseRes, securityRes] = await Promise.allSettled([
    runLighthouse(finalUrl, "mobile"),
    checkSecurityHeaders(finalUrl),
  ]);

  // schema validation needs raw HTML — re-fetch if needed.
  // (We could thread the HTML through crawlSite, but a re-fetch is fine
  //  because schema check is fast and the page is hot in caches.)
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
    security:
      securityRes.status === "fulfilled" ? securityRes.value : null,
    securityError:
      securityRes.status === "rejected"
        ? securityRes.reason instanceof Error
          ? securityRes.reason.message
          : String(securityRes.reason)
        : undefined,
    schema,
  };
}
