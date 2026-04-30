import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  url: z.string().trim().min(3).max(300).optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

async function getOwnedProject(id: string, userId: string) {
  return db.project.findFirst({ where: { id, ownerId: userId } });
}

export async function GET(
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

  const project = await db.project.findFirst({
    where: { id, ownerId: user.id },
    include: {
      audits: {
        orderBy: { createdAt: "desc" },
        take: 25,
      },
      tasks: { orderBy: { createdAt: "desc" }, take: 25 },
      _count: { select: { audits: true, tasks: true } },
    },
  });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ project });
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

  const project = await getOwnedProject(id, user.id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let url = parsed.data.url;
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const updated = await db.project.update({
    where: { id },
    data: {
      name: parsed.data.name ?? undefined,
      url: url ?? undefined,
      description:
        parsed.data.description === undefined
          ? undefined
          : parsed.data.description,
    },
  });
  return Response.json({ project: updated });
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
  const project = await getOwnedProject(id, user.id);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  await db.project.delete({ where: { id } });
  return Response.json({ ok: true });
}
