import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** POST /api/audit/[id]/share — generates (or rotates) a public share token. */
export async function POST(
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

  const audit = await db.audit.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!audit) return Response.json({ error: "Not found" }, { status: 404 });

  // 24-byte URL-safe token (~32 chars base64url)
  const token = randomBytes(24)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await db.audit.update({
    where: { id },
    data: { shareToken: token },
  });
  return Response.json({ token });
}

/** DELETE /api/audit/[id]/share — revoke the share link. */
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
  const audit = await db.audit.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!audit) return Response.json({ error: "Not found" }, { status: 404 });

  await db.audit.update({
    where: { id },
    data: { shareToken: null },
  });
  return Response.json({ ok: true });
}
