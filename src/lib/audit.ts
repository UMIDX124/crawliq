import * as cheerio from "cheerio";
import { z } from "zod";

export const auditInputSchema = z.object({
  url: z.string().trim().min(1, "URL is required"),
});

export type AuditInput = z.infer<typeof auditInputSchema>;

export type CrawlSignals = {
  finalUrl: string;
  status: number;
  loadTimeMs: number;
  byteSize: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonical: string | null;
  robotsMeta: string | null;
  viewport: string | null;
  language: string | null;
  h1: string[];
  h2: string[];
  h3Count: number;
  totalHeadings: number;
  imageCount: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasOpenGraph: boolean;
  ogTitle: string | null;
  ogImage: string | null;
  hasTwitterCard: boolean;
  hasJsonLd: boolean;
  jsonLdTypes: string[];
  hasHttps: boolean;
  wordCount: number;
  contentSnippet: string;
};

export function normalizeUrl(input: string): string {
  let v = input.trim();
  if (!v.startsWith("http://") && !v.startsWith("https://")) {
    v = "https://" + v;
  }
  return v;
}

export async function crawlSite(rawUrl: string): Promise<CrawlSignals> {
  const url = normalizeUrl(rawUrl);
  const target = new URL(url);
  const host = target.host;

  const started = Date.now();
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "CrawlIQ/1.0 (+https://crawliq.ai; AI Audit Bot)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(10_000),
  });
  const html = await res.text();
  const loadTimeMs = Date.now() - started;

  const $ = cheerio.load(html);

  const title = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const canonical =
    $('link[rel="canonical"]').attr("href")?.trim() || null;
  const robotsMeta =
    $('meta[name="robots"]').attr("content")?.trim() || null;
  const viewport =
    $('meta[name="viewport"]').attr("content")?.trim() || null;
  const language = $("html").attr("lang")?.trim() || null;

  const h1 = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  const h2 = $("h2")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 12);
  const h3Count = $("h3").length;
  const totalHeadings =
    h1.length + $("h2").length + $("h3").length + $("h4").length + $("h5").length + $("h6").length;

  const images = $("img");
  const imageCount = images.length;
  const imagesMissingAlt = images
    .filter((_, el) => {
      const alt = $(el).attr("alt");
      return alt === undefined;
    })
    .length;

  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
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

  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || null;
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim() || null;
  const hasOpenGraph =
    Boolean(ogTitle) || $('meta[property^="og:"]').length > 0;
  const hasTwitterCard = $('meta[name^="twitter:"]').length > 0;

  const jsonLdTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const collect = (node: unknown) => {
        if (!node) return;
        if (Array.isArray(node)) {
          node.forEach(collect);
          return;
        }
        if (typeof node === "object") {
          const t = (node as Record<string, unknown>)["@type"];
          if (typeof t === "string") jsonLdTypes.push(t);
          else if (Array.isArray(t))
            t.filter((x): x is string => typeof x === "string").forEach((x) =>
              jsonLdTypes.push(x)
            );
        }
      };
      collect(parsed);
    } catch {
      /* malformed json-ld — skip */
    }
  });
  const hasJsonLd = jsonLdTypes.length > 0;

  // strip scripts + styles, then collect text
  $("script, style, noscript").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;
  const contentSnippet = bodyText.slice(0, 1800);

  return {
    finalUrl: res.url,
    status: res.status,
    loadTimeMs,
    byteSize: html.length,
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    canonical,
    robotsMeta,
    viewport,
    language,
    h1,
    h2,
    h3Count,
    totalHeadings,
    imageCount,
    imagesMissingAlt,
    internalLinks,
    externalLinks,
    hasOpenGraph,
    ogTitle,
    ogImage,
    hasTwitterCard,
    hasJsonLd,
    jsonLdTypes,
    hasHttps: target.protocol === "https:",
    wordCount,
    contentSnippet,
  };
}

export type Severity = "critical" | "warning" | "pass";

export type Finding = {
  title: string;
  severity: Severity;
  detail: string;
  category: "on-page" | "technical" | "content" | "performance" | "accessibility";
};

export type AuditResult = {
  url: string;
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  findings: Finding[];
  quickWins: string[];
  signals: CrawlSignals;
};

/**
 * Bucket a load time into stable ranges so a 1843ms vs 2104ms vs 1956ms
 * fetch of the same site produces the same prompt → same audit output.
 */
function bucketLoadTime(ms: number): string {
  if (ms < 800) return "fast (<800ms)";
  if (ms < 1500) return "good (~1s)";
  if (ms < 2500) return "moderate (~2s)";
  if (ms < 4000) return "slow (~3s)";
  if (ms < 6000) return "very slow (~5s)";
  return "critical (>6s)";
}

/**
 * Bucket HTML weight into stable ranges (50 KB granularity).
 */
function bucketByteSize(bytes: number): string {
  const kb = Math.round(bytes / 1024 / 50) * 50;
  return `~${kb} KB`;
}

/**
 * Bucket word count to nearest 100 so minor content changes don't
 * change the prompt.
 */
function bucketWords(n: number): string {
  return `~${Math.round(n / 100) * 100}`;
}

export function buildAuditPrompt(signals: CrawlSignals): string {
  const lines = [
    `URL: ${signals.finalUrl}`,
    `HTTP status: ${signals.status}`,
    `HTTPS: ${signals.hasHttps ? "yes" : "no"}`,
    `Load time: ${bucketLoadTime(signals.loadTimeMs)}`,
    `HTML size: ${bucketByteSize(signals.byteSize)}`,
    `Language: ${signals.language ?? "not declared"}`,
    `Viewport meta: ${signals.viewport ?? "missing"}`,
    `Robots meta: ${signals.robotsMeta ?? "default"}`,
    `Canonical: ${signals.canonical ?? "missing"}`,
    "",
    `Title (${signals.titleLength} chars): ${signals.title ?? "MISSING"}`,
    `Meta description (${signals.metaDescriptionLength} chars): ${signals.metaDescription ?? "MISSING"}`,
    "",
    `H1 count: ${signals.h1.length}`,
    `H1 contents: ${signals.h1.slice(0, 5).join(" | ") || "NONE"}`,
    `H2 count: ${signals.h2.length}`,
    `H3 count: ${signals.h3Count}`,
    `Total headings: ${signals.totalHeadings}`,
    "",
    `Images: ${signals.imageCount}`,
    `Images missing alt: ${signals.imagesMissingAlt}`,
    `Internal links: ${signals.internalLinks}`,
    `External links: ${signals.externalLinks}`,
    "",
    `Open Graph tags: ${signals.hasOpenGraph ? "yes" : "no"}`,
    `Twitter Card tags: ${signals.hasTwitterCard ? "yes" : "no"}`,
    `JSON-LD: ${signals.hasJsonLd ? `yes (${signals.jsonLdTypes.join(", ")})` : "no"}`,
    "",
    `Word count: ${bucketWords(signals.wordCount)}`,
    `Content snippet: ${signals.contentSnippet.slice(0, 800)}`,
  ];
  return lines.join("\n");
}

export const AUDIT_SYSTEM_PROMPT = `You are CrawlIQ, a senior technical SEO auditor. You analyze the crawl signals provided and return a structured audit.

Hard rules:
- Output ONLY valid JSON. No markdown, no code fences, no commentary.
- Base every finding on the crawl signals provided. Do not invent metrics.
- Be specific: cite the actual numbers and tags from the signals (e.g., "Title is 78 chars" not "title is too long").
- Be honest about what passes. A clean site should get a high score.

Output schema:
{
  "score": <number 0-100>,
  "grade": "<A+ | A | B | C | D | F>",
  "summary": "<2-3 sentence overall verdict>",
  "findings": [
    {
      "title": "<short specific issue>",
      "severity": "<critical | warning | pass>",
      "detail": "<one-paragraph explanation: what's wrong + why it matters + how to fix it>",
      "category": "<on-page | technical | content | performance | accessibility>"
    }
  ],
  "quickWins": [
    "<short imperative action a developer can do today>"
  ]
}

Provide 6-10 findings covering on-page, technical, content, and accessibility. Include passing items so the user can see what's working. Provide 3-5 quickWins.`;
