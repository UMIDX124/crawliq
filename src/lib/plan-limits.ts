import { db } from "@/lib/db";
import type { User, Subscription } from "@prisma/client";

/**
 * Plan limits — Free / Pro / Agency.
 * Pro+Agency = unlimited audits.
 */
export type Plan = "free" | "pro" | "agency";

const LIMITS: Record<Plan, { auditsPerMonth: number | null }> = {
  free: { auditsPerMonth: 3 },
  pro: { auditsPerMonth: null },
  agency: { auditsPerMonth: null },
};

/**
 * Resolve a user's current plan from their Stripe-backed Subscription row.
 * Falls back to "free" if no active subscription.
 */
export async function getUserPlan(user: User): Promise<Plan> {
  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
  });
  return resolvePlan(sub);
}

export function resolvePlan(sub: Subscription | null | undefined): Plan {
  if (!sub) return "free";
  if (sub.status !== "ACTIVE" && sub.status !== "TRIALING") return "free";
  if (sub.plan === "PRO") return "pro";
  if (sub.plan === "AGENCY") return "agency";
  return "free";
}

export type LimitCheck =
  | { ok: true; remaining: number | null; plan: Plan; limit: number | null }
  | { ok: false; remaining: 0; plan: Plan; limit: number; resetAt: Date };

export async function checkAuditLimit(user: User): Promise<LimitCheck> {
  const plan = await getUserPlan(user);
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
    return { ok: false, remaining: 0, plan, limit, resetAt: monthEnd };
  }
  return { ok: true, remaining: limit - used, plan, limit };
}
