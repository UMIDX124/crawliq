"use client";

/**
 * MascotHost — corner-pinned home for the Q mascot + speech bubble.
 *
 * Behaviour:
 *  - Fixed bottom-right, 156×156 canvas + speech bubble to the upper-left.
 *  - Speech bubble cycles 4 messages, types in, holds 4.5s, types out.
 *  - One-time auto-greeting after 1.4s on first page load (per session).
 *  - Re-prompts when the user reaches scroll 65% (mid-page) — friendly
 *    "want me to audit?" nudge.
 *  - Dismiss with × — hides for the session, persists in sessionStorage.
 *  - Honors prefers-reduced-motion: shows the mascot static, no wave/bubble.
 *  - On md+ screens only — too crowded on mobile.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "@phosphor-icons/react";

const MascotQ = dynamic(
  () => import("@/components/mascot-q").then((m) => m.MascotQ),
  { ssr: false },
);

const MESSAGES = [
  {
    text: "Hi — type crawliq anywhere.",
    cta: { label: "Show me how", href: "#surfaces" },
  },
  {
    text: "Want me to audit your site? Paste a URL above.",
    cta: { label: "See pricing", href: "#pricing" },
  },
  {
    text: "Founder-led demos take 30 minutes. Coffee on you.",
    cta: { label: "Book Umer", href: "/talk-to-umer" },
  },
  {
    text: "Reading the FAQ? I&rsquo;m happy to clarify in person.",
    cta: { label: "Talk to Umer", href: "/talk-to-umer" },
  },
] as const;

const SS_KEY = "crawliq.mascot.dismissed";
const TYPE_MS = 22;
const HOLD_MS = 4800;

export function MascotHost() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "holding" | "erasing">("idle");
  const triggeredOnce = useRef(false);
  const triggeredMid = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isNarrow = window.innerWidth < 900;
    if (isNarrow) return;
    if (sessionStorage.getItem(SS_KEY) === "1") {
      setDismissed(true);
      return;
    }
    setEnabled(true);
  }, []);

  // First greeting after 1.4s
  useEffect(() => {
    if (!enabled || dismissed || reduce || triggeredOnce.current) return;
    triggeredOnce.current = true;
    const t = setTimeout(() => {
      setMsgIdx(0);
      setBubbleOpen(true);
      setPhase("typing");
    }, 1400);
    return () => clearTimeout(t);
  }, [enabled, dismissed, reduce]);

  // Mid-page nudge at scroll 65%
  useEffect(() => {
    if (!enabled || dismissed || reduce) return;
    const onScroll = () => {
      if (triggeredMid.current) return;
      const max = document.body.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = window.scrollY / max;
      if (pct > 0.55) {
        triggeredMid.current = true;
        setMsgIdx(1);
        setBubbleOpen(true);
        setTyped("");
        setPhase("typing");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, dismissed, reduce]);

  // Bubble animation FSM
  useEffect(() => {
    if (!bubbleOpen) return;
    const target = stripHtml(MESSAGES[msgIdx].text);
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (phase === "typing") {
      if (typed.length >= target.length) {
        timer = setTimeout(() => setPhase("holding"), HOLD_MS);
      } else {
        timer = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), TYPE_MS);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), 0);
    } else if (phase === "erasing") {
      if (typed.length === 0) {
        setBubbleOpen(false);
        setPhase("idle");
      } else {
        timer = setTimeout(() => setTyped(typed.slice(0, -1)), 9);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [bubbleOpen, phase, typed, msgIdx]);

  if (!enabled || dismissed) return null;

  const onDismiss = () => {
    sessionStorage.setItem(SS_KEY, "1");
    setDismissed(true);
  };

  const onPing = () => {
    if (bubbleOpen) return;
    setMsgIdx((i) => (i + 1) % MESSAGES.length);
    setTyped("");
    setBubbleOpen(true);
    setPhase("typing");
  };

  const message = MESSAGES[msgIdx];

  return (
    <div
      aria-hidden={!bubbleOpen}
      className="hidden md:block fixed bottom-5 right-5 z-[80] pointer-events-none"
    >
      <div className="relative pointer-events-auto">
        {/* speech bubble */}
        <AnimatePresence>
          {bubbleOpen && (
            <motion.div
              key={msgIdx}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-[140px] bottom-[88px] w-[260px]"
            >
              <div className="rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] shadow-layered-lg p-4">
                <div className="text-[13.5px] leading-[1.55] text-fg min-h-[3.5em]">
                  {typed}
                  {phase !== "idle" && phase !== "erasing" && (
                    <span className="terminal-caret bg-[color:var(--color-accent)] shadow-[0_0_10px_rgb(255_94_26/_0.5)]" aria-hidden />
                  )}
                </div>
                {message.cta && phase !== "erasing" && phase !== "typing" && (
                  <div className="mt-3 pt-3 border-t border-[color:var(--color-border)] flex items-center justify-between gap-3">
                    <Link
                      href={message.cta.href}
                      className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)] transition-colors"
                    >
                      {message.cta.label} →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPhase("erasing")}
                      className="font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint hover:text-fg transition-colors"
                    >
                      thanks
                    </button>
                  </div>
                )}
              </div>
              {/* tail pointing toward Q */}
              <div
                className="absolute -right-2 bottom-6 w-3 h-3 rotate-45 border-r border-b border-[color:var(--color-border-strong)]"
                style={{ background: "var(--color-surface)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* dismiss */}
        <button
          type="button"
          aria-label="Dismiss CrawlIQ mascot"
          onClick={onDismiss}
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-[color:var(--color-bg)] border border-[color:var(--color-border-strong)] grid place-items-center text-fg-muted hover:text-fg hover:border-[color:var(--color-accent)] transition-colors shadow-layered-sm"
        >
          <X size={11} weight="bold" />
        </button>

        {/* mascot canvas */}
        <button
          type="button"
          onClick={onPing}
          aria-label="Tap CrawlIQ Q for a tip"
          className="block w-[140px] h-[140px] rounded-2xl bg-transparent focus-ring"
        >
          <MascotQ />
        </button>
      </div>
    </div>
  );
}

function stripHtml(s: string): string {
  return s.replace(/&rsquo;/g, "’").replace(/<[^>]+>/g, "");
}
