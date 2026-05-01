import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  cadence: z.enum(["off", "weekly", "monthly"]),
});

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { cadence } = parsed.data;
  const now = new Date();
  const nextRunAt = (() => {
    if (cadence === "off") return null;
    const next = new Date(now);
    if (cadence === "weekly") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    return next;
  })();

  const updated = await db.project.update({
    where: { id },
    data: { cadence, nextRunAt },
  });
  return Response.json({ project: updated });
}
