/**
 * Multi-page (site-wide) crawler.
 *
 * Strategy:
 *   1. Crawl root URL with full cheerio extraction → CrawlSignals
 *   2. Extract internal links from the root page
 *   3. BFS up to N pages (default 12 — configurable, capped at 25)
 *   4. For each additional page: lightweight cheerio scan only (no Lighthouse)
 *   5. Return aggregated PerPageReport[]
 *
 * Lighthouse (~30s/page) is NOT run per-page — too slow within Vercel function
 * timeout. It runs only on the root in the higher-level orchestrator.
 */

import * as cheerio from "cheerio";
import { crawlSite, normalizeUrl, type CrawlSignals } from "@/lib/audit";

export type PerPageReport = {
  url: string;
  status: number;
  loadTimeMs: number;
  byteSize: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  h1Count: number;
  totalHeadings: number;
  imageCount: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasOpenGraph: boolean;
  hasJsonLd: boolean;
  canonical: string | null;
  wordCount: number;
  errorMsg: string | null;
};

export type MultiPageReport = {
  rootUrl: string;
  pagesAttempted: number;
  pagesSucceeded: number;
  pages: PerPageReport[];
  /** Aggregations across all crawled pages */
  aggregates: {
    pagesMissingTitle: number;
    pagesMissingMeta: number;
    pagesMissingH1: number;
    pagesWithMultipleH1: number;
    pagesMissingCanonical: number;
    pagesMissingOG: number;
    pagesWithThinContent: number; // <300 words
    avgLoadTimeMs: number;
    largestPage: { url: string; bytes: number } | null;
    slowestPage: { url: string; ms: number } | null;
    avgWordCount: number;
    totalImages: number;
    totalImagesMissingAlt: number;
  };
};

/**
 * Crawl a single URL and return a slim PerPageReport (cheerio only, no Lighthouse).
 */
async function crawlPageLite(rawUrl: string): Promise<PerPageReport> {
  const url = normalizeUrl(rawUrl);
  const target = new URL(url);

  let res: Response;
  const started = Date.now();
  try {
    res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "CrawlIQ/1.0 (+https://crawliq.ai; multi-page crawler)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8_000),
    });
  } catch (err) {
    return {
      url,
      status: 0,
      loadTimeMs: Date.now() - started,
      byteSize: 0,
      title: null,
      titleLength: 0,
      metaDescription: null,
      metaDescriptionLength: 0,
      h1Count: 0,
      totalHeadings: 0,
      imageCount: 0,
      imagesMissingAlt: 0,
      internalLinks: 0,
      externalLinks: 0,
      hasOpenGraph: false,
      hasJsonLd: false,
      canonical: null,
      wordCount: 0,
      errorMsg: err instanceof Error ? err.message : "fetch failed",
    };
  }

  const html = await res.text();
  const loadTimeMs = Date.now() - started;
  const $ = cheerio.load(html);
  const host = target.host;

  const title = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const h1s = $("h1");
  const totalHeadings =
    h1s.length + $("h2").length + $("h3").length + $("h4").length + $("h5").length + $("h6").length;

  const images = $("img");
  const imageCount = images.length;
  const imagesMissingAlt = images.filter((_, el) => $(el).attr("alt") === undefined).length;

  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
      return;
    try {
      const u = new URL(href, url);
      if (u.host === host) internalLinks++;
      else externalLinks++;
    } catch {
      /* ignore */
    }
  });

  $("script, style, noscript").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

  return {
    url: res.url,
    status: res.status,
    loadTimeMs,
    byteSize: html.length,
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    h1Count: h1s.length,
    totalHeadings,
    imageCount,
    imagesMissingAlt,
    internalLinks,
    externalLinks,
    hasOpenGraph: $('meta[property^="og:"]').length > 0,
    hasJsonLd: $('script[type="application/ld+json"]').length > 0,
    canonical: $('link[rel="canonical"]').attr("href")?.trim() || null,
    wordCount,
    errorMsg: null,
  };
}

/**
 * Discover internal links from a root page's HTML.
 */
function discoverLinks(rootSignals: CrawlSignals, rootHtml: string): string[] {
  const $ = cheerio.load(rootHtml);
  const target = new URL(rootSignals.finalUrl);
  const host = target.host;
  const seen = new Set<string>();
  const out: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
      return;
    try {
      const u = new URL(href, rootSignals.finalUrl);
      if (u.host !== host) return;
      // strip hash and trailing slash
      u.hash = "";
      const norm = u.toString().replace(/\/$/, "");
      if (norm === rootSignals.finalUrl.replace(/\/$/, "")) return; // skip the root itself
      if (seen.has(norm)) return;
      seen.add(norm);
      out.push(norm);
    } catch {
      /* ignore */
    }
  });

  return out;
}

export async function crawlMultiPage(
  rootUrl: string,
  maxPages = 12,
): Promise<MultiPageReport> {
  const cap = Math.max(2, Math.min(25, maxPages));

  // 1. crawl root
  const rootSignals = await crawlSite(rootUrl);

  // 2. fetch root HTML again to discover links
  let rootHtml = "";
  try {
    const res = await fetch(rootSignals.finalUrl, {
      headers: {
        "User-Agent": "CrawlIQ/1.0 (+https://crawliq.ai; link discovery)",
      },
      signal: AbortSignal.timeout(10_000),
    });
    rootHtml = await res.text();
  } catch {
    /* fallback to single-page behaviour if HTML fetch fails */
  }
  const candidateUrls = rootHtml ? discoverLinks(rootSignals, rootHtml) : [];

  // 3. crawl up to (cap - 1) additional pages
  const toCrawl = candidateUrls.slice(0, cap - 1);

  // build root entry from rootSignals
  const rootPage: PerPageReport = {
    url: rootSignals.finalUrl,
    status: rootSignals.status,
    loadTimeMs: rootSignals.loadTimeMs,
    byteSize: rootSignals.byteSize,
    title: rootSignals.title,
    titleLength: rootSignals.titleLength,
    metaDescription: rootSignals.metaDescription,
    metaDescriptionLength: rootSignals.metaDescriptionLength,
    h1Count: rootSignals.h1.length,
    totalHeadings: rootSignals.totalHeadings,
    imageCount: rootSignals.imageCount,
    imagesMissingAlt: rootSignals.imagesMissingAlt,
    internalLinks: rootSignals.internalLinks,
    externalLinks: rootSignals.externalLinks,
    hasOpenGraph: rootSignals.hasOpenGraph,
    hasJsonLd: rootSignals.hasJsonLd,
    canonical: rootSignals.canonical,
    wordCount: rootSignals.wordCount,
    errorMsg: null,
  };

  // crawl with concurrency=4 to balance speed + politeness
  const results: PerPageReport[] = [rootPage];
  const concurrency = 4;
  for (let i = 0; i < toCrawl.length; i += concurrency) {
    const batch = toCrawl.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(crawlPageLite));
    results.push(...batchResults);
  }

  const succeeded = results.filter((r) => r.status >= 200 && r.status < 400);

  return {
    rootUrl: rootSignals.finalUrl,
    pagesAttempted: results.length,
    pagesSucceeded: succeeded.length,
    pages: results,
    aggregates: aggregate(succeeded),
  };
}

function aggregate(pages: PerPageReport[]) {
  if (pages.length === 0) {
    return {
      pagesMissingTitle: 0,
      pagesMissingMeta: 0,
      pagesMissingH1: 0,
      pagesWithMultipleH1: 0,
      pagesMissingCanonical: 0,
      pagesMissingOG: 0,
      pagesWithThinContent: 0,
      avgLoadTimeMs: 0,
      largestPage: null,
      slowestPage: null,
      avgWordCount: 0,
      totalImages: 0,
      totalImagesMissingAlt: 0,
    };
  }

  const sumLoad = pages.reduce((s, p) => s + p.loadTimeMs, 0);
  const sumWords = pages.reduce((s, p) => s + p.wordCount, 0);
  const totalImages = pages.reduce((s, p) => s + p.imageCount, 0);
  const totalImagesMissingAlt = pages.reduce((s, p) => s + p.imagesMissingAlt, 0);

  const largest = pages.reduce(
    (max, p) => (p.byteSize > (max?.bytes ?? 0) ? { url: p.url, bytes: p.byteSize } : max),
    null as { url: string; bytes: number } | null,
  );
  const slowest = pages.reduce(
    (max, p) => (p.loadTimeMs > (max?.ms ?? 0) ? { url: p.url, ms: p.loadTimeMs } : max),
    null as { url: string; ms: number } | null,
  );

  return {
    pagesMissingTitle: pages.filter((p) => !p.title).length,
    pagesMissingMeta: pages.filter((p) => !p.metaDescription).length,
    pagesMissingH1: pages.filter((p) => p.h1Count === 0).length,
    pagesWithMultipleH1: pages.filter((p) => p.h1Count > 1).length,
    pagesMissingCanonical: pages.filter((p) => !p.canonical).length,
    pagesMissingOG: pages.filter((p) => !p.hasOpenGraph).length,
    pagesWithThinContent: pages.filter((p) => p.wordCount < 300).length,
    avgLoadTimeMs: Math.round(sumLoad / pages.length),
    largestPage: largest,
    slowestPage: slowest,
    avgWordCount: Math.round(sumWords / pages.length),
    totalImages,
    totalImagesMissingAlt,
  };
}
