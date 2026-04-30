"use client";

import { ArrowClockwise, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        <span className="eyebrow">
          <span className="inline-block w-1 h-1 rounded-full bg-[color:var(--color-accent)]" />
          Error
        </span>
        <h1 className="font-display font-extrabold mt-5 text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-0.025em]">
          Something broke{" "}
          <span className="italic font-light text-fg-muted">
            on our end.
          </span>
        </h1>
        <p className="mt-5 text-fg-muted text-[16px] leading-[1.65]">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] tracking-[0.14em] uppercase text-fg-faint">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-10 flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="btn-tactile inline-flex items-center gap-2 rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em]"
          >
            <ArrowClockwise size={14} weight="bold" />
            Try again
          </button>
          <Link
            href="/"
            className="btn-tactile inline-flex items-center gap-2 rounded-md border border-[color:var(--color-border-strong)] px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-fg hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
