"use client";

import { useState } from "react";
import { Share, Copy, Check, X } from "@phosphor-icons/react";

export function ShareAuditButton({
  auditId,
  initialToken,
  siteUrl,
}: {
  auditId: string;
  initialToken: string | null;
  siteUrl: string;
}) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = token ? `${siteUrl}/r/${token}` : "";

  const generate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/audit/${auditId}/share`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.token) setToken(json.token);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!confirm("Revoke this share link? Anyone with the URL will lose access.")) return;
    setBusy(true);
    try {
      await fetch(`/api/audit/${auditId}/share`, { method: "DELETE" });
      setToken(null);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) {
    return (
      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="btn-tactile inline-flex items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:opacity-50"
      >
        <Share size={13} weight="bold" />
        {busy ? "Generating…" : "Share publicly"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="inline-flex items-center gap-2 rounded-md border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] pl-3 pr-1 py-1 font-mono text-[11px] text-[color:var(--color-accent)]">
        <span className="truncate max-w-[260px]">{shareUrl}</span>
        <button
          type="button"
          onClick={copy}
          className="px-2 py-1.5 hover:bg-[color:var(--color-accent)]/15 rounded inline-flex items-center gap-1.5"
          aria-label="Copy share URL"
        >
          {copied ? <Check size={12} weight="bold" /> : <Copy size={12} weight="bold" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <button
        type="button"
        onClick={revoke}
        disabled={busy}
        className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted hover:text-[color:var(--color-crit)] transition-colors px-2 py-2"
      >
        <X size={11} weight="bold" />
        Revoke
      </button>
    </div>
  );
}
