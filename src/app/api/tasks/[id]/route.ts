import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assigneeId: z.string().nullable().optional(),
});

async function getOwnedTask(id: string, userId: string) {
  return db.task.findFirst({
    where: {
      id,
      OR: [{ creatorId: userId }, { assigneeId: userId }],
    },
  });
}

export async function PATCH(
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
  const t = await getOwnedTask(id, user.id);
  if (!t) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await db.task.update({
    where: { id },
    data: {
      status: parsed.data.status,
      title: parsed.data.title,
      description:
        parsed.data.description === undefined
          ? undefined
          : parsed.data.description,
      priority: parsed.data.priority,
      assigneeId:
        parsed.data.assigneeId === undefined
          ? undefined
          : parsed.data.assigneeId,
    },
  });
  return Response.json({ task: updated });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const t = await getOwnedTask(id, user.id);
  if (!t) return Response.json({ error: "Not found" }, { status: 404 });
  await db.task.delete({ where: { id } });
  return Response.json({ ok: true });
}
