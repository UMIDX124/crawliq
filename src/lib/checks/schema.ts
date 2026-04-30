/**
 * JSON-LD / Schema.org validity checker.
 * Lighthouse only checks PRESENCE — we validate STRUCTURE.
 */

import * as cheerio from "cheerio";

export type SchemaIssue = {
  type: string;
  level: "error" | "warning" | "info";
  message: string;
};

export type SchemaReport = {
  totalBlocks: number;
  validBlocks: number;
  malformedBlocks: number;
  detectedTypes: string[];
  issues: SchemaIssue[];
};

/**
 * Required fields per common schema.org type.
 * Not exhaustive — focuses on the types most agencies care about.
 */
const REQUIRED: Record<string, string[]> = {
  Organization: ["name"],
  LocalBusiness: ["name", "address"],
  ProfessionalService: ["name"],
  WebSite: ["name", "url"],
  WebPage: ["name"],
  BreadcrumbList: ["itemListElement"],
  Product: ["name"],
  Offer: ["price", "priceCurrency"],
  Article: ["headline", "author"],
  NewsArticle: ["headline", "author", "datePublished"],
  BlogPosting: ["headline", "author"],
  Person: ["name"],
  Event: ["name", "startDate"],
  Recipe: ["name", "recipeIngredient", "recipeInstructions"],
  FAQPage: ["mainEntity"],
  HowTo: ["name", "step"],
  Review: ["reviewRating", "author"],
  AggregateRating: ["ratingValue", "ratingCount"],
};

export function validateSchema(html: string): SchemaReport {
  const $ = cheerio.load(html);
  const blocks = $('script[type="application/ld+json"]');

  const detected = new Set<string>();
  const issues: SchemaIssue[] = [];
  let validBlocks = 0;
  let malformedBlocks = 0;

  blocks.each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      malformedBlocks++;
      issues.push({
        type: "Block",
        level: "error",
        message: `Malformed JSON-LD: ${err instanceof Error ? err.message : "parse error"}`,
      });
      return;
    }
    validBlocks++;

    const items: Record<string, unknown>[] = [];
    if (Array.isArray(parsed)) {
      parsed.forEach((p) => collectItems(p, items));
    } else {
      collectItems(parsed, items);
    }

    for (const item of items) {
      const t = item["@type"];
      const typeName =
        typeof t === "string"
          ? t
          : Array.isArray(t)
            ? t.find((x): x is string => typeof x === "string") ?? ""
            : "";
      if (!typeName) {
        issues.push({
          type: "Block",
          level: "warning",
          message: "JSON-LD object missing @type",
        });
        continue;
      }
      detected.add(typeName);

      const required = REQUIRED[typeName];
      if (!required) continue;
      for (const field of required) {
        if (item[field] === undefined || item[field] === null || item[field] === "") {
          issues.push({
            type: typeName,
            level: "warning",
            message: `${typeName} missing required field "${field}"`,
          });
        }
      }
    }
  });

  return {
    totalBlocks: blocks.length,
    validBlocks,
    malformedBlocks,
    detectedTypes: Array.from(detected),
    issues,
  };
}

function collectItems(node: unknown, out: Record<string, unknown>[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((n) => collectItems(n, out));
    return;
  }
  if (typeof node !== "object") return;

  const obj = node as Record<string, unknown>;
  if (obj["@type"]) out.push(obj);

  // Recurse into @graph
  const graph = obj["@graph"];
  if (Array.isArray(graph)) {
    graph.forEach((g) => collectItems(g, out));
  }
}
