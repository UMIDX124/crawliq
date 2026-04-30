import Link from "next/link";
import { ArrowLeft, Check, Minus, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { AppTopbar } from "@/components/app/topbar";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import {
  UpgradeButton,
  ManageBillingButton,
} from "@/components/app/billing-buttons";
import { resolvePlan } from "@/lib/plan-limits";
import { cn } from "@/lib/cn";

export const metadata = { title: "Billing" };

type TierKey = "FREE" | "PRO" | "AGENCY";

const TIERS: {
  key: TierKey;
  name: string;
  monthly: number;
  annual: number;
  blurb: string;
  features: { text: string; included: boolean }[];
}[] = [
  {
    key: "FREE",
    name: "Free",
    monthly: 0,
    annual: 0,
    blurb: "For testing and one-off audits.",
    features: [
      { text: "3 audits per month", included: true },
      { text: "On-Page + Technical pillars", included: true },
      { text: "Findings list with severity", included: true },
      { text: "PDF export", included: false },
      { text: "Competitor gap analysis", included: false },
      { text: "Team seats", included: false },
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    monthly: 49,
    annual: 39,
    blurb: "For freelancers and growing agencies.",
    features: [
      { text: "Unlimited audits", included: true },
      { text: "All 5 audit pillars", included: true },
      { text: "White-label PDF reports", included: true },
      { text: "Competitor gap analysis", included: true },
      { text: "Priority streaming results", included: true },
      { text: "Email + chat support", included: true },
    ],
  },
  {
    key: "AGENCY",
    name: "Agency",
    monthly: 149,
    annual: 119,
    blurb: "For teams managing many client sites.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 10 team seats", included: true },
      { text: "Client portal access", included: true },
      { text: "Scheduled auto re-audits", included: true },
      { text: "API access + webhooks", included: true },
      { text: "Dedicated CSM", included: true },
    ],
  },
];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await requireUser();
  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
  });
  const plan = resolvePlan(sub).toUpperCase() as TierKey;

  return (
    <>
      <AppTopbar title="Billing" />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors"
          >
            <ArrowLeft size={12} weight="bold" />
            All settings
          </Link>

          <div className="mt-7">
            <span className="eyebrow">
              <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
              Settings · Billing
            </span>
            <h2 className="font-display font-extrabold mt-4 text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.025em]">
              Plan & billing.
            </h2>
          </div>

          {status === "success" && (
            <FlashBanner kind="success" title="Welcome to Pro." body="Your subscription is active. New benefits unlocked immediately." />
          )}
          {status === "cancelled" && (
            <FlashBanner kind="info" title="Checkout cancelled." body="No charges. You can upgrade anytime." />
          )}

          {/* current plan card */}
          <section className="mt-10 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-7">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <span className="eyebrow">
                  <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                  Current plan
                </span>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-display font-extrabold text-[40px] leading-none">
                    {TIERS.find((t) => t.key === plan)?.name ?? "Free"}
                  </span>
                  {sub?.billingCycle && (
                    <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-accent)]">
                      {sub.billingCycle.toLowerCase()}
                    </span>
                  )}
                </div>
                <div className="mt-3 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-muted">
                  Status:{" "}
                  <span
                    style={{
                      color:
                        sub?.status === "ACTIVE" || sub?.status === "TRIALING"
                          ? "var(--color-pass)"
                          : sub?.status === "PAST_DUE"
                            ? "var(--color-warn)"
                            : "var(--color-fg-muted)",
                    }}
                  >
                    {sub?.status?.toLowerCase().replace("_", " ") ?? "no subscription"}
                  </span>
                  {sub?.currentPeriodEnd && (
                    <>
                      <span className="mx-2 text-fg-faint">·</span>
                      Renews{" "}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </>
                  )}
                  {sub?.cancelAtPeriodEnd && (
                    <span className="ml-2 text-[color:var(--color-warn)]">
                      (cancels at period end)
                    </span>
                  )}
                </div>
              </div>

              {sub?.stripeCustomerId && plan !== "FREE" && (
                <ManageBillingButton />
              )}
            </div>
          </section>

          {/* upgrade tiles */}
          {plan !== "AGENCY" && (
            <section className="mt-10">
              <span className="eyebrow">
                <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                {plan === "FREE" ? "Upgrade" : "Switch plan"}
              </span>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {TIERS.map((t) => (
                  <PlanCard
                    key={t.key}
                    tier={t}
                    currentPlan={plan}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function PlanCard({
  tier,
  currentPlan,
}: {
  tier: typeof TIERS[number];
  currentPlan: TierKey;
}) {
  const isCurrent = tier.key === currentPlan;
  const featured = tier.key === "PRO";

  return (
    <article
      className={cn(
        "relative h-full rounded-xl p-7 flex flex-col",
        featured
          ? "border border-[color:var(--color-accent)] bg-[color:var(--color-surface)] shadow-[0_24px_48px_-24px_rgb(0_102_255/_0.2)]"
          : "border border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-7 inline-block bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1 rounded-full">
          Most popular
        </span>
      )}
      {isCurrent && (
        <span className="absolute -top-3 right-7 inline-block bg-[color:var(--color-fg)] text-[color:var(--color-bg)] font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1 rounded-full">
          Current
        </span>
      )}

      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-fg-muted mb-5">
        {tier.name}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display font-extrabold text-[44px] leading-none tabular-nums">
          ${tier.monthly}
        </span>
        <span className="text-fg-muted text-[14px]">/mo</span>
      </div>
      {tier.monthly > 0 && (
        <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint mb-5">
          ${tier.annual}/mo billed yearly
        </div>
      )}

      <p className="text-[14px] text-fg-muted leading-[1.6] pb-7 mb-7 border-b border-[color:var(--color-border)]">
        {tier.blurb}
      </p>

      <ul className="flex flex-col gap-2.5 mb-7 flex-1">
        {tier.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-[13.5px]">
            {f.included ? (
              <Check size={14} weight="bold" className="text-[color:var(--color-accent)] shrink-0 mt-1" />
            ) : (
              <Minus size={14} weight="bold" className="text-fg-faint shrink-0 mt-1" />
            )}
            <span className={cn(f.included ? "text-fg" : "text-fg-faint line-through")}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <span className="text-center font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted py-3">
          Current plan
        </span>
      ) : tier.key === "FREE" ? (
        <span className="text-center font-mono text-[11px] tracking-[0.16em] uppercase text-fg-faint py-3">
          —
        </span>
      ) : (
        <div className="flex flex-col gap-2">
          <UpgradeButton
            plan={tier.key === "PRO" ? "PRO_ANNUAL" : "AGENCY_ANNUAL"}
            variant={featured ? "primary" : "ghost"}
          >
            {currentPlan === "FREE" ? "Upgrade" : "Switch"} · annual
          </UpgradeButton>
          <UpgradeButton
            plan={tier.key === "PRO" ? "PRO_MONTHLY" : "AGENCY_MONTHLY"}
            variant="ghost"
          >
            Pay monthly
          </UpgradeButton>
        </div>
      )}
    </article>
  );
}

function FlashBanner({
  kind,
  title,
  body,
}: {
  kind: "success" | "info";
  title: string;
  body: string;
}) {
  const color = kind === "success" ? "var(--color-pass)" : "var(--color-accent)";
  const bg = kind === "success" ? "var(--color-pass-bg)" : "var(--color-accent-soft)";
  return (
    <div
      className="mt-8 rounded-lg p-5 flex items-start gap-3 border"
      style={{ backgroundColor: bg, borderColor: "var(--color-border)" }}
    >
      <Sparkle size={18} weight="fill" style={{ color }} />
      <div>
        <div className="font-display font-bold text-[14.5px]" style={{ color }}>
          {title}
        </div>
        <p className="mt-1 text-[13.5px] text-fg-muted leading-[1.55]">{body}</p>
      </div>
    </div>
  );
}
