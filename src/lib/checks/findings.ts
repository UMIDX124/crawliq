/**
 * Convert real check results into structured findings.
 * Every finding here is sourced from a deterministic check — never invented.
 * The LLM is only used downstream to write human prose for each finding.
 */

import type { AgentType } from "@prisma/client";
import type { AggregatedChecks } from "@/lib/checks";

export type Severity = "critical" | "warning" | "pass";

export type StructuredFinding = {
  id: string;
  agent: AgentType;
  category: string;
  severity: Severity;
  title: string;
  /** Hard data we know — passed to the LLM for explanation context */
  evidence: Record<string, string | number | boolean | null>;
};

/**
 * Build the full set of findings from real check data, scoped to one agent.
 */
export function buildFindings(
  agent: AgentType,
  checks: AggregatedChecks,
): StructuredFinding[] {
  switch (agent) {
    case "ONPAGE":
      return onPageFindings(checks);
    case "TECHNICAL":
      return technicalFindings(checks);
    case "CONTENT":
      return contentFindings(checks);
    case "OFFSITE":
      return offsiteFindings(checks);
    case "COMPETITOR":
      return competitorFindings(checks);
    default:
      return [];
  }
}

function onPageFindings(c: AggregatedChecks): StructuredFinding[] {
  const out: StructuredFinding[] = [];
  const s = c.crawl;

  // === MULTI-PAGE (site-wide) findings — only when crawl scope was multi ===
  if (c.multiPage) {
    const mp = c.multiPage;
    const a = mp.aggregates;
    const total = mp.pagesSucceeded;

    out.push({
      id: "multi-overview",
      agent: "ONPAGE",
      category: "on-page",
      severity: "pass",
      title: `Site-wide crawl: ${mp.pagesSucceeded} of ${mp.pagesAttempted} pages reached`,
      evidence: {
        pagesSucceeded: mp.pagesSucceeded,
        pagesAttempted: mp.pagesAttempted,
        avgLoadTimeMs: a.avgLoadTimeMs,
        avgWordCount: a.avgWordCount,
      },
    });

    if (total > 0) {
      const flag = (count: number) =>
        count === 0 ? ("pass" as const) : count / total > 0.3 ? ("critical" as const) : ("warning" as const);

      if (a.pagesMissingTitle > 0)
        out.push({
          id: "multi-missing-title",
          agent: "ONPAGE",
          category: "on-page",
          severity: flag(a.pagesMissingTitle),
          title: `${a.pagesMissingTitle} of ${total} pages missing <title>`,
          evidence: { count: a.pagesMissingTitle, total },
        });
      if (a.pagesMissingMeta > 0)
        out.push({
          id: "multi-missing-meta",
          agent: "ONPAGE",
          category: "on-page",
          severity: flag(a.pagesMissingMeta),
          title: `${a.pagesMissingMeta} of ${total} pages missing meta description`,
          evidence: { count: a.pagesMissingMeta, total },
        });
      if (a.pagesMissingH1 > 0)
        out.push({
          id: "multi-missing-h1",
          agent: "ONPAGE",
          category: "on-page",
          severity: flag(a.pagesMissingH1),
          title: `${a.pagesMissingH1} of ${total} pages missing H1`,
          evidence: { count: a.pagesMissingH1, total },
        });
      if (a.pagesWithMultipleH1 > 0)
        out.push({
          id: "multi-multiple-h1",
          agent: "ONPAGE",
          category: "on-page",
          severity: "warning",
          title: `${a.pagesWithMultipleH1} of ${total} pages have multiple H1 tags`,
          evidence: { count: a.pagesWithMultipleH1, total },
        });
      if (a.pagesMissingCanonical > 0)
        out.push({
          id: "multi-missing-canonical",
          agent: "ONPAGE",
          category: "on-page",
          severity: flag(a.pagesMissingCanonical),
          title: `${a.pagesMissingCanonical} of ${total} pages missing canonical tag`,
          evidence: { count: a.pagesMissingCanonical, total },
        });
      if (a.pagesWithThinContent > 0)
        out.push({
          id: "multi-thin-content",
          agent: "ONPAGE",
          category: "content",
          severity: a.pagesWithThinContent / total > 0.4 ? "critical" : "warning",
          title: `${a.pagesWithThinContent} of ${total} pages under 300 words (thin content)`,
          evidence: { count: a.pagesWithThinContent, total },
        });
      if (a.slowestPage && a.slowestPage.ms > 3000)
        out.push({
          id: "multi-slowest",
          agent: "ONPAGE",
          category: "performance",
          severity: a.slowestPage.ms > 5000 ? "critical" : "warning",
          title: `Slowest page: ${a.slowestPage.url} loaded in ${(a.slowestPage.ms / 1000).toFixed(1)}s`,
          evidence: { url: a.slowestPage.url, loadTimeMs: a.slowestPage.ms },
        });
      if (a.largestPage && a.largestPage.bytes > 1_500_000)
        out.push({
          id: "multi-largest",
          agent: "ONPAGE",
          category: "performance",
          severity: a.largestPage.bytes > 3_000_000 ? "critical" : "warning",
          title: `Largest page: ${a.largestPage.url} (${(a.largestPage.bytes / 1024 / 1024).toFixed(1)} MB)`,
          evidence: { url: a.largestPage.url, bytes: a.largestPage.bytes },
        });
      if (a.totalImagesMissingAlt > 0 && a.totalImages > 0) {
        const pct = (a.totalImagesMissingAlt / a.totalImages) * 100;
        out.push({
          id: "multi-alts",
          agent: "ONPAGE",
          category: "accessibility",
          severity: pct > 30 ? "critical" : pct > 10 ? "warning" : "pass",
          title: `${a.totalImagesMissingAlt} of ${a.totalImages} images site-wide missing alt text (${pct.toFixed(0)}%)`,
          evidence: { missing: a.totalImagesMissingAlt, total: a.totalImages, pct: Math.round(pct) },
        });
      }
    }
  }

  // title
  if (!s.title) {
    out.push({
      id: "title-missing",
      agent: "ONPAGE",
      category: "on-page",
      severity: "critical",
      title: "Page is missing a <title> tag",
      evidence: { titleLength: 0 },
    });
  } else if (s.titleLength > 60) {
    out.push({
      id: "title-too-long",
      agent: "ONPAGE",
      category: "on-page",
      severity: "warning",
      title: `Title is ${s.titleLength} characters — Google truncates at 60`,
      evidence: { title: s.title, titleLength: s.titleLength },
    });
  } else if (s.titleLength < 25) {
    out.push({
      id: "title-too-short",
      agent: "ONPAGE",
      category: "on-page",
      severity: "warning",
      title: `Title is only ${s.titleLength} characters — under-utilising SERP space`,
      evidence: { title: s.title, titleLength: s.titleLength },
    });
  } else {
    out.push({
      id: "title-good",
      agent: "ONPAGE",
      category: "on-page",
      severity: "pass",
      title: `Title is well-sized (${s.titleLength} chars)`,
      evidence: { title: s.title, titleLength: s.titleLength },
    });
  }

  // meta description
  if (!s.metaDescription) {
    out.push({
      id: "meta-missing",
      agent: "ONPAGE",
      category: "on-page",
      severity: "critical",
      title: "Meta description is missing",
      evidence: { metaLength: 0 },
    });
  } else if (s.metaDescriptionLength > 160) {
    out.push({
      id: "meta-too-long",
      agent: "ONPAGE",
      category: "on-page",
      severity: "warning",
      title: `Meta description is ${s.metaDescriptionLength} characters — truncates around 160`,
      evidence: {
        meta: s.metaDescription,
        metaLength: s.metaDescriptionLength,
      },
    });
  } else if (s.metaDescriptionLength < 70) {
    out.push({
      id: "meta-too-short",
      agent: "ONPAGE",
      category: "on-page",
      severity: "warning",
      title: `Meta description is only ${s.metaDescriptionLength} characters — under-utilising SERP space`,
      evidence: {
        meta: s.metaDescription,
        metaLength: s.metaDescriptionLength,
      },
    });
  } else {
    out.push({
      id: "meta-good",
      agent: "ONPAGE",
      category: "on-page",
      severity: "pass",
      title: `Meta description is well-sized (${s.metaDescriptionLength} chars)`,
      evidence: {
        meta: s.metaDescription,
        metaLength: s.metaDescriptionLength,
      },
    });
  }

  // H1
  if (s.h1.length === 0) {
    out.push({
      id: "h1-missing",
      agent: "ONPAGE",
      category: "on-page",
      severity: "critical",
      title: "Page has no <h1> heading",
      evidence: { h1Count: 0 },
    });
  } else if (s.h1.length > 1) {
    out.push({
      id: "h1-multiple",
      agent: "ONPAGE",
      category: "on-page",
      severity: "warning",
      title: `Page has ${s.h1.length} <h1> tags — should be exactly 1`,
      evidence: { h1Count: s.h1.length, h1s: s.h1.slice(0, 3).join(" | ") },
    });
  } else {
    out.push({
      id: "h1-good",
      agent: "ONPAGE",
      category: "on-page",
      severity: "pass",
      title: "Single H1 present",
      evidence: { h1: s.h1[0] },
    });
  }

  // image alts
  if (s.imageCount > 0) {
    const altCoverage = ((s.imageCount - s.imagesMissingAlt) / s.imageCount) * 100;
    if (s.imagesMissingAlt === 0) {
      out.push({
        id: "alts-perfect",
        agent: "ONPAGE",
        category: "accessibility",
        severity: "pass",
        title: `Every image has alt text (${s.imageCount} images)`,
        evidence: { imageCount: s.imageCount, imagesMissingAlt: 0 },
      });
    } else if (altCoverage >= 90) {
      out.push({
        id: "alts-good",
        agent: "ONPAGE",
        category: "accessibility",
        severity: "warning",
        title: `${s.imagesMissingAlt} of ${s.imageCount} images missing alt text (${altCoverage.toFixed(0)}% coverage)`,
        evidence: {
          imageCount: s.imageCount,
          imagesMissingAlt: s.imagesMissingAlt,
        },
      });
    } else {
      out.push({
        id: "alts-poor",
        agent: "ONPAGE",
        category: "accessibility",
        severity: "critical",
        title: `${s.imagesMissingAlt} of ${s.imageCount} images missing alt text (${altCoverage.toFixed(0)}% coverage)`,
        evidence: {
          imageCount: s.imageCount,
          imagesMissingAlt: s.imagesMissingAlt,
        },
      });
    }
  }

  // open graph
  if (!s.hasOpenGraph) {
    out.push({
      id: "og-missing",
      agent: "ONPAGE",
      category: "on-page",
      severity: "warning",
      title: "Open Graph tags missing",
      evidence: { hasOpenGraph: false },
    });
  } else {
    out.push({
      id: "og-present",
      agent: "ONPAGE",
      category: "on-page",
      severity: "pass",
      title: "Open Graph tags present",
      evidence: {
        ogTitle: s.ogTitle,
        ogImage: s.ogImage,
      },
    });
  }

  return out;
}

function technicalFindings(c: AggregatedChecks): StructuredFinding[] {
  const out: StructuredFinding[] = [];
  const s = c.crawl;
  const lh = c.lighthouse;
  const sec = c.security;
  const schema = c.schema;

  // HTTPS
  out.push({
    id: "https",
    agent: "TECHNICAL",
    category: "technical",
    severity: s.hasHttps ? "pass" : "critical",
    title: s.hasHttps ? "HTTPS in use" : "Site is not served over HTTPS",
    evidence: { hasHttps: s.hasHttps, finalUrl: s.finalUrl },
  });

  // canonical
  if (!s.canonical) {
    out.push({
      id: "canonical-missing",
      agent: "TECHNICAL",
      category: "technical",
      severity: "warning",
      title: "Canonical tag missing",
      evidence: { canonical: null },
    });
  } else {
    out.push({
      id: "canonical-present",
      agent: "TECHNICAL",
      category: "technical",
      severity: "pass",
      title: "Canonical tag set",
      evidence: { canonical: s.canonical },
    });
  }

  // CrUX — real-user CWV (more important than Lighthouse lab data)
  if (c.crux) {
    const crux = c.crux;
    const m = crux.metrics;
    out.push({
      id: "crux-source",
      agent: "TECHNICAL",
      category: "performance",
      severity: "pass",
      title: `Real-user data: Chrome UX Report (${crux.scope}-level, period ending ${crux.collectionPeriodEnd ?? "n/a"})`,
      evidence: {
        scope: crux.scope,
        period: crux.collectionPeriodEnd,
      },
    });
    if (m.lcp) {
      out.push({
        id: "crux-lcp",
        agent: "TECHNICAL",
        category: "performance",
        severity:
          m.lcp.bucket === "good" ? "pass" : m.lcp.bucket === "ni" ? "warning" : "critical",
        title: `Real-user LCP p75: ${(m.lcp.p75 / 1000).toFixed(2)}s — ${labelBucket(m.lcp.bucket)}`,
        evidence: { p75: Math.round(m.lcp.p75), bucket: m.lcp.bucket },
      });
    }
    if (m.cls) {
      out.push({
        id: "crux-cls",
        agent: "TECHNICAL",
        category: "performance",
        severity:
          m.cls.bucket === "good" ? "pass" : m.cls.bucket === "ni" ? "warning" : "critical",
        title: `Real-user CLS p75: ${m.cls.p75.toFixed(3)} — ${labelBucket(m.cls.bucket)}`,
        evidence: { p75: m.cls.p75, bucket: m.cls.bucket },
      });
    }
    if (m.inp) {
      out.push({
        id: "crux-inp",
        agent: "TECHNICAL",
        category: "performance",
        severity:
          m.inp.bucket === "good" ? "pass" : m.inp.bucket === "ni" ? "warning" : "critical",
        title: `Real-user INP p75: ${Math.round(m.inp.p75)}ms — ${labelBucket(m.inp.bucket)}`,
        evidence: { p75: Math.round(m.inp.p75), bucket: m.inp.bucket },
      });
    }
    if (m.ttfb) {
      out.push({
        id: "crux-ttfb",
        agent: "TECHNICAL",
        category: "performance",
        severity:
          m.ttfb.bucket === "good" ? "pass" : m.ttfb.bucket === "ni" ? "warning" : "critical",
        title: `Real-user TTFB p75: ${Math.round(m.ttfb.p75)}ms — ${labelBucket(m.ttfb.bucket)}`,
        evidence: { p75: Math.round(m.ttfb.p75), bucket: m.ttfb.bucket },
      });
    }
  }

  // Lighthouse Performance
  if (lh) {
    if (lh.scores.performance !== null) {
      const score = lh.scores.performance;
      out.push({
        id: "lh-performance",
        agent: "TECHNICAL",
        category: "performance",
        severity: score >= 90 ? "pass" : score >= 50 ? "warning" : "critical",
        title: `Lighthouse Performance: ${score}/100`,
        evidence: {
          score,
          lcp: lh.cwv.lcp ? `${(lh.cwv.lcp / 1000).toFixed(1)}s` : null,
          cls: lh.cwv.cls?.toFixed(3) ?? null,
          inp: lh.cwv.inp ? `${Math.round(lh.cwv.inp)}ms` : null,
          ttfb: lh.cwv.ttfb ? `${Math.round(lh.cwv.ttfb)}ms` : null,
          fcp: lh.cwv.fcp ? `${(lh.cwv.fcp / 1000).toFixed(1)}s` : null,
        },
      });
    }
    if (lh.scores.accessibility !== null) {
      const score = lh.scores.accessibility;
      out.push({
        id: "lh-accessibility",
        agent: "TECHNICAL",
        category: "accessibility",
        severity: score >= 90 ? "pass" : score >= 70 ? "warning" : "critical",
        title: `Lighthouse Accessibility: ${score}/100`,
        evidence: { score },
      });
    }
    if (lh.scores.bestPractices !== null) {
      const score = lh.scores.bestPractices;
      out.push({
        id: "lh-best-practices",
        agent: "TECHNICAL",
        category: "technical",
        severity: score >= 90 ? "pass" : score >= 70 ? "warning" : "critical",
        title: `Lighthouse Best Practices: ${score}/100`,
        evidence: { score },
      });
    }
    if (lh.scores.seo !== null) {
      const score = lh.scores.seo;
      out.push({
        id: "lh-seo",
        agent: "TECHNICAL",
        category: "on-page",
        severity: score >= 90 ? "pass" : score >= 70 ? "warning" : "critical",
        title: `Lighthouse SEO: ${score}/100`,
        evidence: { score },
      });
    }

    // top opportunities (ms savings)
    for (const opp of lh.opportunities.slice(0, 4)) {
      const ms = opp.numericValue ?? 0;
      out.push({
        id: `lh-opp-${opp.id}`,
        agent: "TECHNICAL",
        category: "performance",
        severity: ms > 1000 ? "critical" : ms > 300 ? "warning" : "warning",
        title: `${opp.title}${opp.displayValue ? ` — ${opp.displayValue}` : ""}`,
        evidence: {
          msSavings: Math.round(ms),
          displayValue: opp.displayValue,
          auditId: opp.id,
          description: opp.description,
        },
      });
    }
  } else if (c.lighthouseError) {
    out.push({
      id: "lh-unavailable",
      agent: "TECHNICAL",
      category: "performance",
      severity: "warning",
      title: "Lighthouse data unavailable for this URL",
      evidence: { error: c.lighthouseError },
    });
  }

  // security headers
  if (sec) {
    out.push({
      id: "security-overall",
      agent: "TECHNICAL",
      category: "technical",
      severity: sec.score >= 80 ? "pass" : sec.score >= 50 ? "warning" : "critical",
      title: `Security headers score: ${sec.score}/100`,
      evidence: { score: sec.score },
    });
    for (const f of sec.findings.filter((x) => x.status !== "pass")) {
      out.push({
        id: `sec-${f.header.toLowerCase()}`,
        agent: "TECHNICAL",
        category: "technical",
        severity: f.status === "critical" ? "critical" : "warning",
        title: `${f.header}: ${f.message}`,
        evidence: {
          header: f.header,
          present: f.present,
          value: f.value,
          recommendation: f.recommendation,
        },
      });
    }
  }

  // schema
  if (schema) {
    if (schema.totalBlocks === 0) {
      out.push({
        id: "schema-missing",
        agent: "TECHNICAL",
        category: "technical",
        severity: "warning",
        title: "No JSON-LD structured data found",
        evidence: { totalBlocks: 0 },
      });
    } else {
      out.push({
        id: "schema-present",
        agent: "TECHNICAL",
        category: "technical",
        severity: schema.malformedBlocks > 0 ? "warning" : "pass",
        title: `${schema.totalBlocks} JSON-LD block(s) — types: ${schema.detectedTypes.join(", ") || "n/a"}`,
        evidence: {
          totalBlocks: schema.totalBlocks,
          validBlocks: schema.validBlocks,
          malformedBlocks: schema.malformedBlocks,
          types: schema.detectedTypes.join(", "),
        },
      });
    }
    for (const issue of schema.issues.slice(0, 4)) {
      out.push({
        id: `schema-${issue.type}-${issue.message.slice(0, 20)}`,
        agent: "TECHNICAL",
        category: "technical",
        severity: issue.level === "error" ? "critical" : "warning",
        title: `Schema (${issue.type}): ${issue.message}`,
        evidence: { schemaType: issue.type, message: issue.message },
      });
    }
  }

  return out;
}

function contentFindings(c: AggregatedChecks): StructuredFinding[] {
  const out: StructuredFinding[] = [];
  const s = c.crawl;

  // word count signal
  if (s.wordCount < 200) {
    out.push({
      id: "thin-content",
      agent: "CONTENT",
      category: "content",
      severity: "critical",
      title: `Thin content: only ${s.wordCount} words`,
      evidence: { wordCount: s.wordCount },
    });
  } else if (s.wordCount < 500) {
    out.push({
      id: "shallow-content",
      agent: "CONTENT",
      category: "content",
      severity: "warning",
      title: `Shallow content: ${s.wordCount} words`,
      evidence: { wordCount: s.wordCount },
    });
  } else {
    out.push({
      id: "content-depth-ok",
      agent: "CONTENT",
      category: "content",
      severity: "pass",
      title: `Content depth: ${s.wordCount} words`,
      evidence: { wordCount: s.wordCount },
    });
  }

  // heading structure
  if (s.totalHeadings < 3) {
    out.push({
      id: "few-headings",
      agent: "CONTENT",
      category: "content",
      severity: "warning",
      title: `Only ${s.totalHeadings} headings — content has weak structure`,
      evidence: { totalHeadings: s.totalHeadings },
    });
  }

  // internal linking (content-quality signal: well-linked content > orphan)
  if (s.internalLinks < 3 && s.wordCount > 300) {
    out.push({
      id: "low-internal-links",
      agent: "CONTENT",
      category: "content",
      severity: "warning",
      title: `Only ${s.internalLinks} internal links from a ${s.wordCount}-word page — orphan signal`,
      evidence: {
        internalLinks: s.internalLinks,
        wordCount: s.wordCount,
      },
    });
  }

  // content snippet so LLM has something concrete to ground its prose
  out.push({
    id: "content-sample",
    agent: "CONTENT",
    category: "content",
    severity: "pass",
    title: "Content sample captured",
    evidence: {
      wordCount: s.wordCount,
      h1: s.h1.slice(0, 1).join(""),
      h2sSample: s.h2.slice(0, 4).join(" | "),
      snippet: s.contentSnippet.slice(0, 400),
    },
  });

  return out;
}

function offsiteFindings(c: AggregatedChecks): StructuredFinding[] {
  const out: StructuredFinding[] = [];
  const s = c.crawl;

  // OpenPageRank — real DA-proxy score
  if (c.openPageRank?.pageRank !== null && c.openPageRank?.pageRank !== undefined) {
    const pr = c.openPageRank.pageRank;
    out.push({
      id: "opr-pagerank",
      agent: "OFFSITE",
      category: "off-site",
      severity: pr >= 5 ? "pass" : pr >= 3 ? "warning" : "critical",
      title: `Open PageRank: ${pr.toFixed(2)}/10 (global rank #${c.openPageRank.rank?.toLocaleString() ?? "n/a"})`,
      evidence: {
        pageRank: pr,
        globalRank: c.openPageRank.rank,
        domain: c.openPageRank.domain,
      },
    });
  } else {
    out.push({
      id: "opr-not-configured",
      agent: "OFFSITE",
      category: "off-site",
      severity: "warning",
      title: "Domain authority data unavailable — connect OpenPageRank or DataForSEO for verified DA scores",
      evidence: {
        note: "OpenPageRank gives 1000 free queries/day and a 0-10 DA-proxy score.",
      },
    });
  }

  // Wayback — domain age signal (Google trusts older domains slightly)
  if (c.wayback) {
    const w = c.wayback;
    if (w.domainAgeYears !== null) {
      out.push({
        id: "wayback-age",
        agent: "OFFSITE",
        category: "off-site",
        severity: w.domainAgeYears >= 3 ? "pass" : w.domainAgeYears >= 1 ? "warning" : "critical",
        title: `Domain age: ${w.domainAgeYears} years (first archived ${formatWaybackDate(w.firstSnapshot)})`,
        evidence: {
          domainAgeYears: w.domainAgeYears,
          firstSnapshot: w.firstSnapshot,
          lastSnapshot: w.lastSnapshot,
        },
      });
    }
    if (w.totalSnapshots > 0) {
      out.push({
        id: "wayback-history",
        agent: "OFFSITE",
        category: "off-site",
        severity: "pass",
        title: `Site has been archived ${formatSnapshotCount(w.totalSnapshots)} times in the Wayback Machine`,
        evidence: {
          totalSnapshots: w.totalSnapshots,
          lastSnapshot: w.lastSnapshot,
        },
      });
    }
  }

  // External link patterns
  if (s.externalLinks > 0) {
    out.push({
      id: "external-link-count",
      agent: "OFFSITE",
      category: "off-site",
      severity: "pass",
      title: `${s.externalLinks} outbound links to external domains`,
      evidence: { externalLinks: s.externalLinks },
    });
  } else {
    out.push({
      id: "no-external-links",
      agent: "OFFSITE",
      category: "off-site",
      severity: "warning",
      title:
        "No outbound links found — pages typically benefit from authoritative external references",
      evidence: { externalLinks: 0 },
    });
  }

  return out;
}

function formatWaybackDate(ts: string | null): string {
  if (!ts || ts.length < 8) return "unknown";
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
}

function formatSnapshotCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k+`;
  return String(n);
}

function competitorFindings(c: AggregatedChecks): StructuredFinding[] {
  const out: StructuredFinding[] = [];
  const s = c.crawl;

  out.push({
    id: "competitor-notice",
    agent: "COMPETITOR",
    category: "competitor",
    severity: "warning",
    title:
      "Competitor analysis is inference-based — no SERP data connected",
    evidence: {
      note:
        "Connect SerpApi or DataForSEO to enable real SERP rank tracking and verified competitor identification.",
    },
  });

  // We can still inspect the page for category positioning signals
  out.push({
    id: "positioning-snippet",
    agent: "COMPETITOR",
    category: "competitor",
    severity: "pass",
    title: "Page positioning captured for qualitative analysis",
    evidence: {
      title: s.title ?? "",
      h1: s.h1.slice(0, 1).join(""),
      h2s: s.h2.slice(0, 4).join(" | "),
      snippet: s.contentSnippet.slice(0, 400),
    },
  });

  return out;
}

/**
 * Score a list of findings into a 0-100 grade.
 * Critical = -15 each, warning = -5 each, pass = +0.
 * Capped at 0..100.
 */
export function scoreFindings(findings: StructuredFinding[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.severity === "critical") score -= 15;
    else if (f.severity === "warning") score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

function labelBucket(b: "good" | "ni" | "poor" | null): string {
  if (b === "good") return "good";
  if (b === "ni") return "needs improvement";
  if (b === "poor") return "poor";
  return "n/a";
}

export function gradeFromScore(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 88) return "A";
  if (score >= 78) return "B";
  if (score >= 68) return "C";
  if (score >= 55) return "D";
  return "F";
}
