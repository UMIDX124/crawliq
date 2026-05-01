"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type Cadence = "off" | "weekly" | "monthly";

const OPTIONS: { value: Cadence; label: string; sub: string }[] = [
  { value: "off", label: "Off", sub: "Manual only" },
  { value: "weekly", label: "Weekly", sub: "Every 7 days" },
  { value: "monthly", label: "Monthly", sub: "Every 30 days" },
];

export function CadencePicker({
  projectId,
  initialCadence,
  initialNextRunAt,
}: {
  projectId: string;
  initialCadence: string;
  initialNextRunAt: string | null;
}) {
  const router = useRouter();
  const [cadence, setCadence] = useState<Cadence>(
    (initialCadence as Cadence) || "off",
  );
  const [nextRunAt, setNextRunAt] = useState<string | null>(initialNextRunAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (next: Cadence) => {
    if (saving) return;
    const previous = cadence;
    setCadence(next); // optimistic
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/cadence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cadence: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to update cadence");
      setNextRunAt(json.project?.nextRunAt ?? null);
      router.refresh();
    } catch (err) {
      setCadence(previous);
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow">
          <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
          Auto re-audit cadence
        </span>
        {cadence !== "off" && nextRunAt && (
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
            <Calendar
              size={11}
              weight="bold"
              className="inline -mt-0.5 mr-1.5"
            />
            Next: {new Date(nextRunAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const active = cadence === o.value;
          return (
            <button
              key={o.value}
              type="button"
              disabled={saving}
              onClick={() => update(o.value)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors disabled:opacity-50",
                active
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-accent)]",
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "font-display font-bold text-[14px]",
                    active && "text-[color:var(--color-accent)]",
                  )}
                >
                  {o.label}
                </span>
                {active &&
                  (o.value === "off" ? (
                    <X
                      size={13}
                      weight="bold"
                      className="text-[color:var(--color-accent)]"
                    />
                  ) : (
                    <CheckCircle
                      size={13}
                      weight="fill"
                      className="text-[color:var(--color-accent)]"
                    />
                  ))}
              </div>
              <div className="text-[12px] text-fg-muted">{o.sub}</div>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-3 text-[12.5px] text-[color:var(--color-crit)]">
          {error}
        </p>
      )}
    </div>
  );
}
