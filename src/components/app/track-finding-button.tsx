"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "@phosphor-icons/react";
import type { Severity } from "@prisma/client";

const SEVERITY_TO_PRIORITY = {
  CRITICAL: "CRITICAL" as const,
  WARNING: "HIGH" as const,
  PASS: "MEDIUM" as const,
};

export function TrackFindingButton({
  auditId,
  projectId,
  findingTitle,
  findingDetail,
  severity,
}: {
  auditId: string;
  projectId: string | null;
  findingTitle: string;
  findingDetail: string;
  severity: Severity;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const create = async () => {
    if (state !== "idle") return;
    setState("saving");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: findingTitle,
          description: findingDetail,
          priority: SEVERITY_TO_PRIORITY[severity],
          auditId,
          projectId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      type="button"
      onClick={create}
      disabled={state !== "idle"}
      className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-muted hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors disabled:opacity-60"
    >
      {state === "saved" ? (
        <>
          <Check size={11} weight="bold" />
          tracked
        </>
      ) : state === "saving" ? (
        "creating…"
      ) : (
        <>
          <Plus size={11} weight="bold" />
          track this
        </>
      )}
    </button>
  );
}
