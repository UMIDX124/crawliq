import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Plan limits for the marketing-tier signups before Stripe is wired in.
 * Free: 3 audits per month.
 * Pro / Agency: unlimited (gated by Stripe metadata in Phase 4).
 */
export type Plan = "free" | "pro" | "agency";

const LIMITS: Record<Plan, { auditsPerMonth: number | null }> = {
  free: { auditsPerMonth: 3 },
  pro: { auditsPerMonth: null },
  agency: { auditsPerMonth: null },
};

/**
 * Resolve a user's current plan. Phase 1: everyone is "free" until Stripe is wired.
 * Phase 4 will read this from a `subscription` table.
 */
export function getUserPlan(_user: User): Plan {
  return "free";
}

export type LimitCheck =
  | { ok: true; remaining: number | null; plan: Plan; limit: number | null }
  | { ok: false; remaining: 0; plan: Plan; limit: number; resetAt: Date };

export async function checkAuditLimit(user: User): Promise<LimitCheck> {
  const plan = getUserPlan(user);
  const limit = LIMITS[plan].auditsPerMonth;

  if (limit === null) {
    return { ok: true, remaining: null, plan, limit: null };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const used = await db.audit.count({
    where: {
      userId: user.id,
      createdAt: { gte: monthStart, lt: monthEnd },
    },
  });

  if (used >= limit) {
    return {
      ok: false,
      remaining: 0,
      plan,
      limit,
      resetAt: monthEnd,
    };
  }

  return {
    ok: true,
    remaining: limit - used,
    plan,
    limit,
  };
}
