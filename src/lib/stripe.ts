import Stripe from "stripe";

const env = process.env;

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      // omit apiVersion to use the SDK's pinned default — avoids version-string mismatch
      typescript: true,
    });
  }
  return _stripe;
}

export type StripePlanKey = "PRO_MONTHLY" | "PRO_ANNUAL" | "AGENCY_MONTHLY" | "AGENCY_ANNUAL";

export function getPriceId(key: StripePlanKey): string {
  const map: Record<StripePlanKey, string | undefined> = {
    PRO_MONTHLY: env.STRIPE_PRICE_PRO_MONTHLY,
    PRO_ANNUAL: env.STRIPE_PRICE_PRO_ANNUAL,
    AGENCY_MONTHLY: env.STRIPE_PRICE_AGENCY_MONTHLY,
    AGENCY_ANNUAL: env.STRIPE_PRICE_AGENCY_ANNUAL,
  };
  const v = map[key];
  if (!v) {
    throw new Error(`Stripe price id not configured for ${key}`);
  }
  return v;
}

export function planFromPriceId(priceId: string | null | undefined): {
  plan: "FREE" | "PRO" | "AGENCY";
  cycle: "MONTHLY" | "ANNUAL" | null;
} {
  if (!priceId) return { plan: "FREE", cycle: null };
  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY)
    return { plan: "PRO", cycle: "MONTHLY" };
  if (priceId === env.STRIPE_PRICE_PRO_ANNUAL)
    return { plan: "PRO", cycle: "ANNUAL" };
  if (priceId === env.STRIPE_PRICE_AGENCY_MONTHLY)
    return { plan: "AGENCY", cycle: "MONTHLY" };
  if (priceId === env.STRIPE_PRICE_AGENCY_ANNUAL)
    return { plan: "AGENCY", cycle: "ANNUAL" };
  return { plan: "FREE", cycle: null };
}
