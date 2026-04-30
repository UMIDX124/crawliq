import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
  });
  if (!sub?.stripeCustomerId) {
    return Response.json(
      { error: "No active billing account. Subscribe first." },
      { status: 400 },
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${siteUrl}/settings/billing`,
  });

  return Response.json({ url: session.url });
}
