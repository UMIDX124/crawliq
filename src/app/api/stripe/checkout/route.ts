import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getStripe, getPriceId, type StripePlanKey } from "@/lib/stripe";

export const runtime = "nodejs";

const inputSchema = z.object({
  plan: z.enum(["PRO_MONTHLY", "PRO_ANNUAL", "AGENCY_MONTHLY", "AGENCY_ANNUAL"]),
});

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const priceId = getPriceId(parsed.data.plan as StripePlanKey);

  // ensure a Stripe customer exists for this user
  const existingSub = await db.subscription.findUnique({
    where: { userId: user.id },
  });
  let customerId = existingSub?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id, clerkUserId: user.clerkUserId },
    });
    customerId = customer.id;

    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeCustomerId: customerId,
        plan: "FREE",
        status: "INCOMPLETE",
      },
      update: { stripeCustomerId: customerId },
    });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${siteUrl}/settings/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/settings/billing?status=cancelled`,
    metadata: { userId: user.id, plan: parsed.data.plan },
    subscription_data: {
      metadata: { userId: user.id, plan: parsed.data.plan },
    },
  });

  return Response.json({ url: session.url });
}
