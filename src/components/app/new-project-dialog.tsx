"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ArrowRight } from "@phosphor-icons/react";

export function NewProjectDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setName("");
    setUrl("");
    setDescription("");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          url: url.replace(/^https?:\/\//, "").trim(),
          description: description.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to create project");
        setSubmitting(false);
        return;
      }
      setOpen(false);
      setSubmitting(false);
      router.refresh();
      if (json?.project?.id) {
        router.push(`/projects/${json.project.id}`);
      }
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
        >
          <Plus size={14} weight="bold" />
          New project
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 grid place-items-center p-4"
            style={{ backgroundColor: "rgb(29 29 31 / 0.4)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[520px] rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_24px_56px_-24px_rgb(29_29_31/_0.32)]"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-[color:var(--color-border)]">
                <div>
                  <span className="eyebrow">
                    <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
                    New project
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-md grid place-items-center hover:bg-[color:var(--color-bg-2)]"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>

              <form onSubmit={submit} className="p-7">
                <Field label="Name">
                  <input
                    type="text"
                    placeholder="Northwood agency site"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3.5 py-2.5 text-[14px] outline-none focus:border-[color:var(--color-accent)] focus:shadow-[0_0_0_4px_var(--color-accent-soft)] transition-all"
                  />
                </Field>
                <Field label="URL">
                  <div className="flex items-center rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] focus-within:border-[color:var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)] transition-all">
                    <span className="pl-3.5 pr-2 text-fg-faint font-mono text-[12px]">
                      https://
                    </span>
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="northwood.studio"
                      value={url}
                      onChange={(e) =>
                        setUrl(e.target.value.replace(/^https?:\/\//, ""))
                      }
                      required
                      className="flex-1 min-w-0 bg-transparent py-2.5 pr-3 text-[14px] outline-none placeholder:text-fg-faint"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </Field>
                <Field label="Description (optional)">
                  <textarea
                    rows={3}
                    placeholder="What's this project for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3.5 py-2.5 text-[14px] outline-none focus:border-[color:var(--color-accent)] focus:shadow-[0_0_0_4px_var(--color-accent-soft)] transition-all resize-none"
                  />
                </Field>

                {error && (
                  <p className="text-[13px] text-[color:var(--color-crit)] mb-3">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-muted hover:text-fg transition-colors px-3 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || !url.trim() || submitting}
                    className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] disabled:opacity-50"
                  >
                    {submitting ? "Creating…" : "Create project"}
                    <ArrowRight size={13} weight="bold" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
    <label className="block mb-5">
      <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-muted mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}
