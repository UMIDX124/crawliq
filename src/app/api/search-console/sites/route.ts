import { requireUser } from "@/lib/auth-helpers";
import {
  getValidAccessToken,
  listSites,
} from "@/lib/google-search-console";

export const runtime = "nodejs";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = await getValidAccessToken(user.id);
    const sites = await listSites(token);
    return Response.json({ sites });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to fetch sites" },
      { status: 500 },
    );
  }
}
