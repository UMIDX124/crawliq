import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await db.user.update({
    where: { id: user.id },
    data: { onboardedAt: new Date() },
  });
  return Response.json({ ok: true });
}
