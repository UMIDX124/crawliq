"use client";

import { useState } from "react";
import { ArrowRight, Sparkle, ArrowSquareOut } from "@phosphor-icons/react";

export type CheckoutPlan =
  | "PRO_MONTHLY"
  | "PRO_ANNUAL"
  | "AGENCY_MONTHLY"
  | "AGENCY_ANNUAL";

export function UpgradeButton({
  plan,
  variant = "primary",
  children,
}: {
  plan: CheckoutPlan;
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json?.url) {
        window.location.href = json.url;
        return;
      }
      alert(json?.error ?? "Checkout failed");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cls =
    variant === "primary"
      ? "btn-tactile inline-flex items-center justify-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] disabled:opacity-50"
      : "btn-tactile inline-flex items-center justify-center gap-2 rounded-md border border-[color:var(--color-border-strong)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:opacity-50";

  return (
    <button type="button" onClick={onClick} disabled={loading} className={cls}>
      <Sparkle size={13} weight="fill" />
      {loading ? "Redirecting…" : children}
      <ArrowRight size={13} weight="bold" />
    </button>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (json?.url) {
        window.location.href = json.url;
        return;
      }
      alert(json?.error ?? "Portal failed");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="btn-tactile inline-flex items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:opacity-50"
    >
      {loading ? "Opening…" : "Manage subscription"}
      <ArrowSquareOut size={12} weight="bold" />
    </button>
  );
}
