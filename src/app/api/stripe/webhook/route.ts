import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, planFromPriceId } from "@/lib/stripe";

export const runtime = "nodejs";

const SUB_STATUS_MAP: Record<string, "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE"> = {
  trialing: "TRIALING",
  active: "ACTIVE",
  past_due: "PAST_DUE",
  unpaid: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "INCOMPLETE",
  paused: "INCOMPLETE",
};

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad signature";
    return Response.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const userId = session.metadata?.userId;
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!userId || !subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        await syncSubscription(userId, sub);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) {
          // fall back to the linked customer's metadata
          const customerId =
            typeof sub.customer === "string" ? sub.customer : sub.customer.id;
          const existing = await db.subscription.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (existing) {
            await syncSubscription(existing.userId, sub);
          }
          break;
        }
        await syncSubscription(userId, sub);
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        // mark subscription PAST_DUE for the linked customer
        const customerId =
          typeof inv.customer === "string"
            ? inv.customer
            : inv.customer?.id;
        if (!customerId) break;
        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      default:
        // ignore unrelated events
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function syncSubscription(userId: string, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const { plan, cycle } = planFromPriceId(priceId);
  const status = SUB_STATUS_MAP[sub.status] ?? "INCOMPLETE";
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const periodEndUnix =
    (item?.current_period_end as number | null | undefined) ??
    null;

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan,
      billingCycle: cycle ?? null,
      status,
      currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan,
      billingCycle: cycle ?? null,
      status,
      currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}
