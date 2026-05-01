"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "@phosphor-icons/react";

export function BrandEditor({
  projectId,
  initial,
}: {
  projectId: string;
  initial: {
    brandName: string | null;
    brandColor: string | null;
    brandLogoUrl: string | null;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.brandName ?? "");
  const [color, setColor] = useState(initial.brandColor ?? "#FF1A6E");
  const [logoUrl, setLogoUrl] = useState(initial.brandLogoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: name || null,
          brandColor: color || null,
          brandLogoUrl: logoUrl || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to save");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <span className="eyebrow">
          <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
          White-label · PDF + shareable reports
        </span>
        <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
          Pro feature
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Field label="Brand name">
          <input
            type="text"
            placeholder="Your agency name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 120))}
            className="w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[color:var(--color-accent)] transition-all"
          />
        </Field>

        <Field label="Accent color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] cursor-pointer"
            />
            <input
              type="text"
              placeholder="#FF1A6E"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2.5 text-[13.5px] font-mono outline-none focus:border-[color:var(--color-accent)] transition-all"
            />
          </div>
        </Field>

        <Field label="Logo URL (PNG/SVG)">
          <input
            type="text"
            placeholder="https://yoursite.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[color:var(--color-accent)] transition-all"
          />
        </Field>
      </div>

      {error && (
        <p className="text-[12.5px] text-[color:var(--color-crit)] mb-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check size={12} weight="bold" />
              Saved
            </>
          ) : saving ? (
            "Saving…"
          ) : (
            "Save brand"
          )}
        </button>
        <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-faint">
          Applies to PDF exports + /r/{"<"}token{">"} shareable reports
        </span>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}
