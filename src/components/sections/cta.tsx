"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { Reveal } from "@/components/reveal";

export function FinalCta() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/audit?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <section id="cta" className="relative py-20 sm:py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border-accent)] bg-[color:var(--color-bg-2)]">
            {/* faint accent corner */}
            <div
              className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full opacity-[0.06] pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, var(--color-accent), transparent 70%)",
                transform: "translate(35%, -35%)",
              }}
            />

            <div className="relative p-10 md:p-16 lg:p-20 text-center max-w-3xl mx-auto">
              <span className="eyebrow eyebrow-accent">
                <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent)]" />
                Ready to audit
              </span>

              <h2 className="font-display font-extrabold mt-5 text-balance text-[clamp(36px,5.5vw,72px)] leading-[1.02] tracking-tight">
                See what's actually{" "}
                <span className="text-fg-muted italic font-normal">
                  broken on your site.
                </span>
              </h2>

              <p className="mt-7 text-fg-muted text-[16px] md:text-[18px] leading-[1.65] max-w-xl mx-auto">
                Paste your URL. Five AI auditors will hand you a ranked action
                plan in under ten seconds. No signup, no card, no fluff.
              </p>

              <form
                onSubmit={submit}
                className="mt-10 max-w-[560px] mx-auto"
              >
                <div className="flex items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] focus-within:border-[color:var(--color-accent)] transition-colors">
                  <span className="pl-4 pr-2 text-fg-faint font-mono text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    placeholder="yourwebsite.com"
                    value={url}
                    onChange={(e) =>
                      setUrl(e.target.value.replace(/^https?:\/\//, ""))
                    }
                    className="flex-1 bg-transparent py-4 pr-3 text-[15px] outline-none placeholder:text-fg-faint"
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Website URL"
                  />
                  <button
                    type="submit"
                    className="btn-tactile m-1.5 inline-flex items-center gap-2 rounded-[6px] bg-[color:var(--color-accent)] px-5 py-3 font-display text-[13px] font-bold uppercase tracking-wide text-[color:var(--color-accent-fg)] hover:bg-[color:var(--color-accent-hover)] focus-ring"
                  >
                    <Sparkle size={14} weight="fill" />
                    Run audit
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </div>
              </form>

              <div className="mt-10 flex items-center justify-center gap-x-8 gap-y-2 flex-wrap font-mono text-[10.5px] tracking-[0.16em] uppercase text-fg-faint">
                <span>● No signup</span>
                <span>● No credit card</span>
                <span>● Results in &lt;10s</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
