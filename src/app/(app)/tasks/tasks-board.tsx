"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type ClientTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectName: string | null;
  auditUrl: string | null;
};

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "DONE", label: "Done" },
];

const NEXT: Record<TaskStatus, TaskStatus | null> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: null,
  CANCELLED: null,
};
const PREV: Record<TaskStatus, TaskStatus | null> = {
  TODO: null,
  IN_PROGRESS: "TODO",
  DONE: "IN_PROGRESS",
  CANCELLED: null,
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: "var(--color-fg-faint)",
  MEDIUM: "var(--color-fg-muted)",
  HIGH: "var(--color-warn)",
  CRITICAL: "var(--color-crit)",
};

export function TasksBoard({ tasks: initial }: { tasks: ClientTask[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initial);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const move = async (id: string, to: TaskStatus) => {
    setPending((p) => new Set(p).add(id));
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: to } : t)),
    );
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      // revert on failure
      setTasks(initial);
      router.refresh();
    } finally {
      setPending((p) => {
        const n = new Set(p);
        n.delete(id);
        return n;
      });
    }
  };

  const cancel = async (id: string) => {
    if (!confirm("Cancel this task?")) return;
    setPending((p) => new Set(p).add(id));
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
    } finally {
      setPending((p) => {
        const n = new Set(p);
        n.delete(id);
        return n;
      });
    }
  };

  const visible = tasks.filter((t) => t.status !== "CANCELLED");

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = visible.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted">
                {col.label}
              </span>
              <span className="font-mono text-[10.5px] tracking-[0.14em] text-fg-faint tabular-nums">
                {colTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 min-h-[80px]">
              <AnimatePresence initial={false}>
                {colTasks.map((t) => (
                  <motion.article
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: pending.has(t.id) ? 0.5 : 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: PRIORITY_COLOR[t.priority],
                          }}
                          title={t.priority}
                        />
                        <span className="text-[13px] font-medium leading-snug">
                          {t.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => cancel(t.id)}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-fg-faint hover:text-fg shrink-0 p-1"
                        aria-label="Cancel task"
                      >
                        <X size={11} weight="bold" />
                      </button>
                    </div>

                    {(t.projectName || t.auditUrl) && (
                      <div className="mt-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint truncate">
                        {t.projectName ?? t.auditUrl?.replace(/^https?:\/\//, "")}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-[color:var(--color-border)] flex items-center justify-between gap-2">
                      {PREV[t.status] && (
                        <button
                          type="button"
                          onClick={() => move(t.id, PREV[t.status]!)}
                          disabled={pending.has(t.id)}
                          className={cn(
                            "inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] transition-colors disabled:opacity-50",
                          )}
                        >
                          <CaretLeft size={10} weight="bold" />
                          back
                        </button>
                      )}
                      <span className="flex-1" />
                      {NEXT[t.status] && (
                        <button
                          type="button"
                          onClick={() => move(t.id, NEXT[t.status]!)}
                          disabled={pending.has(t.id)}
                          className={cn(
                            "inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] uppercase text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)] transition-colors disabled:opacity-50",
                          )}
                        >
                          {NEXT[t.status] === "DONE" ? "complete" : "advance"}
                          <CaretRight size={10} weight="bold" />
                        </button>
                      )}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>

              {colTasks.length === 0 && (
                <div className="rounded-md border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg)]/50 py-6 grid place-items-center">
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                    empty
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
