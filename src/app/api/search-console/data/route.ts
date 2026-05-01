import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import {
  getValidAccessToken,
  getSearchAnalytics,
  formatDateYmd,
} from "@/lib/google-search-console";

export const runtime = "nodejs";

const querySchema = z.object({
  siteUrl: z.string().min(3),
  days: z
    .string()
    .optional()
    .transform((v) => (v ? Math.min(90, Math.max(7, Number(v))) : 28)),
  dimension: z.enum(["query", "page", "country", "device", "date"]).optional(),
});

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = querySchema.safeParse({
    siteUrl: req.nextUrl.searchParams.get("siteUrl") ?? "",
    days: req.nextUrl.searchParams.get("days") ?? "28",
    dimension: req.nextUrl.searchParams.get("dimension") ?? "query",
  });
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { siteUrl, days, dimension } = parsed.data;
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2); // GSC has ~2 day lag
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);

  try {
    const token = await getValidAccessToken(user.id);

    // Fetch the requested dimension + a daily timeseries in parallel
    const [primary, daily] = await Promise.all([
      getSearchAnalytics(token, siteUrl, {
        startDate: formatDateYmd(start),
        endDate: formatDateYmd(end),
        dimensions: [dimension ?? "query"],
        rowLimit: 25,
      }),
      getSearchAnalytics(token, siteUrl, {
        startDate: formatDateYmd(start),
        endDate: formatDateYmd(end),
        dimensions: ["date"],
        rowLimit: 200,
      }),
    ]);

    const totals = primary.reduce(
      (acc, r) => {
        acc.clicks += r.clicks;
        acc.impressions += r.impressions;
        return acc;
      },
      { clicks: 0, impressions: 0 },
    );

    return Response.json({
      siteUrl,
      range: {
        startDate: formatDateYmd(start),
        endDate: formatDateYmd(end),
        days,
      },
      totals,
      rows: primary,
      timeseries: daily.map((r) => ({
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to fetch data" },
      { status: 500 },
    );
  }
}
