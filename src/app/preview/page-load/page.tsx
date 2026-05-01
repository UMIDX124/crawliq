"use client";

/**
 * /preview/page-load — film-opening orchestration.
 * Four acts over ~1.6s:
 *   1. Brand mark draws itself (SVG stroke-dashoffset reveal)
 *   2. Wordmark assembles letter-by-letter
 *   3. Hero copy appears (kinetic line-by-line)
 *   4. URL input becomes interactive (scale + glow)
 *
 * Subsequent visits skip the sequence (sessionStorage flag).
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, ArrowRight } from "@phosphor-icons/react";

const FLAG = "crawliq-page-load-seen";
const WORD = "CrawlIQ".split("");

export default function PageLoadPreview() {
  const [stage, setStage] = useState(0); // 0..4
  const [skip, setSkip] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(FLAG);
    if (seen) {
      setSkip(true);
      setStage(4);
      return;
    }
    // run the sequence
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 800);
    const t3 = setTimeout(() => setStage(3), 1500);
    const t4 = setTimeout(() => {
      setStage(4);
      sessionStorage.setItem(FLAG, "1");
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const replay = () => {
    sessionStorage.removeItem(FLAG);
    setStage(0);
    setSkip(false);
    setTimeout(() => {
      const t1 = setTimeout(() => setStage(1), 100);
      const t2 = setTimeout(() => setStage(2), 800);
      const t3 = setTimeout(() => setStage(3), 1500);
      const t4 = setTimeout(() => {
        setStage(4);
        sessionStorage.setItem(FLAG, "1");
      }, 2200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }, 50);
  };

  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] flex flex-col items-center justify-center px-6">
      <Link
        href="/preview"
        className="fixed top-4 left-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted/70 hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border)] rounded backdrop-blur"
      >
        ← preview index
      </Link>
      <button
        onClick={replay}
        className="fixed top-4 right-4 z-50 font-mono text-[10px] tracking-[0.2em] uppercase text-fg-muted hover:text-[color:var(--color-accent)] px-3 py-1.5 border border-[color:var(--color-border-strong)] rounded backdrop-blur"
      >
        replay sequence ↺
      </button>

      <div className="max-w-[820px] mx-auto text-center">
        {/* Act 1 — Brand mark */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={skip ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 inline-block"
            >
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <motion.circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="var(--color-accent)"
                  strokeWidth="2"
                  strokeDasharray="3 5"
                  initial={skip ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
                <motion.path
                  d="M 40 12 A 28 28 0 1 1 12 40"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  fill="none"
                  initial={skip ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="6"
                  fill="var(--color-accent)"
                  initial={skip ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.55, ease: "backOut" }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Act 2 — Wordmark assembly */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div className="mb-12 inline-flex items-baseline">
              {WORD.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={skip ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.4,
                    delay: skip ? 0 : i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="font-display font-black text-[clamp(48px,9vw,120px)] tracking-[-0.04em] leading-none"
                  style={{ color: i >= 5 ? "var(--color-accent)" : "var(--color-fg)" }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Act 3 — Hero copy */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={skip ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10"
            >
              <p className="text-fg-muted text-[clamp(15px,1.5vw,19px)] leading-[1.55] max-w-[600px] mx-auto">
                Five AI auditors. Eight named data sources. One ranked action plan in under ten seconds.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Act 4 — URL input becomes interactive */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.form
              initial={skip ? false : { opacity: 0, scale: 0.92 }}
              animate={{
                opacity: 1,
                scale: 1,
                boxShadow: [
                  "0 0 0 0 rgb(255 94 26 / 0)",
                  "0 0 40px 4px rgb(255 94 26 / 0.4)",
                  "0 0 0 0 rgb(255 94 26 / 0)",
                ],
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                boxShadow: { duration: 1.2, ease: "easeOut" },
              }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!url.trim()) return;
                window.location.href = `/audit?url=${encodeURIComponent(url)}`;
              }}
              className="inline-flex items-center bg-[color:var(--color-surface)] border border-[color:var(--color-border-strong)] rounded-full p-1.5 max-w-[480px] w-full"
            >
              <span className="px-4 font-mono text-[12px] text-fg-faint shrink-0 hidden sm:inline">
                https://
              </span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//, ""))}
                placeholder="yourwebsite.com"
                className="flex-1 min-w-0 bg-transparent px-3 py-3 outline-none text-[14px] sm:text-[15px] placeholder:text-fg-faint"
              />
              <button
                type="submit"
                className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] font-bold hover:bg-[color:var(--color-accent-hover)]"
              >
                <Sparkle size={13} weight="fill" />
                <span className="hidden sm:inline">Run audit</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.22em] uppercase text-fg-faint">
        ◇ Phase 8 · stage {stage} / 4
      </div>
    </main>
  );
}
