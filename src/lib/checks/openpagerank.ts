/**
 * OpenPageRank — free domain-authority-style scoring (0-10).
 * 1000 requests/day free with API key.
 * Returns the same data Open PageRank index calculates from public web data.
 *
 * Docs: https://www.domcop.com/openpagerank/documentation
 *
 * Without an API key we silently no-op — feature is optional.
 */

const OPR_URL = "https://openpagerank.com/api/v1.0/getPageRank";

export type OpenPageRankReport = {
  domain: string;
  pageRank: number | null; // 0-10 decimal score
  rank: number | null; // global rank (lower = better)
};

export async function getOpenPageRank(
  rawUrl: string,
): Promise<OpenPageRankReport | null> {
  const apiKey = process.env.OPENPAGERANK_API_KEY;
  if (!apiKey) return null; // optional — skip if not configured

  const target = new URL(rawUrl);
  const domain = target.host.replace(/^www\./, "");
  const params = new URLSearchParams();
  params.append("domains[]", domain);

  try {
    const res = await fetch(`${OPR_URL}?${params.toString()}`, {
      headers: { "API-OPR": apiKey },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      response: {
        domain: string;
        page_rank_decimal: number;
        rank: string;
        status_code: number;
      }[];
    };
    const r = json.response?.[0];
    if (!r || r.status_code !== 200) return null;
    return {
      domain,
      pageRank: typeof r.page_rank_decimal === "number" ? r.page_rank_decimal : null,
      rank: r.rank ? Number(r.rank) : null,
    };
  } catch {
    return null;
  }
}
