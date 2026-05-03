"use client";

/**
 * TypewriterTerminal — the verb-as-product hero centerpiece.
 *
 * Cycles through real CrawlIQ surface commands (Slack, GitHub, Notion, Email,
 * SMS, Browser) typed character-by-character into a brutalist black terminal
 * that sits on the cream paper backdrop. The "crawliq" token always renders
 * in electric lime so the verb itself becomes the visual anchor, never the
 * surrounding syntax.
 *
 * Pacing:
 *   typing   — 28-42ms per char (slight jitter for realism)
 *   hold     — 1700ms after the line completes
 *   deleting — 16ms per char (faster than typing)
 *   pause    — 380ms between commands
 */

import { useEffect, useRef, useState } from "react";

type Surface = {
  // Pre-verb prompt fragment — rendered in a muted prompt color.
  prompt: string;
  // The verb itself — always rendered in --color-term.
  verb: string;
  // Post-verb argument fragment — rendered in default terminal text color.
  args: string;
  // Surface label rendered above the line as a dim caption.
  label: string;
};

const SURFACES: Surface[] = [
  { label: "slack",   prompt: "/",            verb: "crawliq",  args: " audit acme.com" },
  { label: "github",  prompt: "@",            verb: "crawliq",  args: " review this PR" },
  { label: "notion",  prompt: "/",            verb: "crawliq",  args: " block · clients/northwood" },
  { label: "email",   prompt: "→ ",           verb: "crawl",     args: "@crawliq.ai  · forward any URL" },
  { label: "sms",     prompt: "+1·555·",      verb: "CRAWLIQ",   args: "  · text any URL" },
  { label: "browser", prompt: "$ ",           verb: "crawliq",  args: "(this.tab)" },
];

const TYPE_MS_BASE = 32;
const TYPE_MS_JITTER = 16;
const HOLD_MS = 1700;
const ERASE_MS = 14;
const SWITCH_PAUSE_MS = 380;

type Phase = "typing" | "holding" | "erasing";

export function TypewriterTerminal() {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState({ prompt: "", verb: "", args: "" });
  const [phase, setPhase] = useState<Phase>("typing");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const surface = SURFACES[idx];
    const total = surface.prompt + surface.verb + surface.args;

    const typedSoFar = shown.prompt + shown.verb + shown.args;

    if (phase === "typing") {
      if (typedSoFar.length >= total.length) {
        timer.current = setTimeout(() => setPhase("holding"), HOLD_MS);
        return;
      }
      timer.current = setTimeout(
        () => {
          setShown(buildShown(surface, typedSoFar.length + 1));
        },
        TYPE_MS_BASE + Math.random() * TYPE_MS_JITTER,
      );
    } else if (phase === "holding") {
      timer.current = setTimeout(() => setPhase("erasing"), 0);
    } else {
      // erasing
      if (typedSoFar.length === 0) {
        timer.current = setTimeout(() => {
          setIdx((i) => (i + 1) % SURFACES.length);
          setPhase("typing");
        }, SWITCH_PAUSE_MS);
        return;
      }
      timer.current = setTimeout(() => {
        setShown(buildShown(surface, typedSoFar.length - 1));
      }, ERASE_MS);
    }
  }, [shown, phase, idx]);

  const surface = SURFACES[idx];

  return (
    <div className="terminal w-full overflow-hidden">
      {/* chrome bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="terminal-chrome-dot bg-[#FF5F57]" />
          <span className="terminal-chrome-dot bg-[#FEBC2E]" />
          <span className="terminal-chrome-dot bg-[#28C840]" />
          <span className="ml-3 text-[10.5px] tracking-[0.18em] uppercase text-white/35">
            crawliq · {surface.label}
          </span>
        </div>
        <span className="text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-term)]/60">
          live · 0.{((idx + 1) * 17) % 100}s
        </span>
      </div>

      {/* command body */}
      <div className="px-5 sm:px-7 py-7 sm:py-9">
        <div className="text-[clamp(20px,3.4vw,40px)] leading-[1.35] tracking-[-0.01em] tabular-nums whitespace-pre-wrap break-words">
          <span className="terminal-prompt">{shown.prompt}</span>
          <span className="terminal-verb">{shown.verb}</span>
          <span className="text-white/85">{shown.args}</span>
          <span className="terminal-caret" aria-hidden />
        </div>

        {/* response hint — appears once command is fully typed */}
        <div
          className={`mt-6 flex items-center gap-3 text-[12px] tracking-[0.16em] uppercase transition-opacity duration-300 ${
            phase === "holding" ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-term)] shadow-[0_0_12px_rgb(57_255_106/_0.55)]" />
          <span className="text-white/55">audit running</span>
          <span className="text-[color:var(--color-term)]/70">8s</span>
        </div>
      </div>
    </div>
  );
}

function buildShown(s: Surface, n: number) {
  const promptLen = s.prompt.length;
  const verbLen = s.verb.length;
  const out = { prompt: "", verb: "", args: "" };
  let remaining = n;

  if (remaining > 0) {
    const take = Math.min(remaining, promptLen);
    out.prompt = s.prompt.slice(0, take);
    remaining -= take;
  }
  if (remaining > 0) {
    const take = Math.min(remaining, verbLen);
    out.verb = s.verb.slice(0, take);
    remaining -= take;
  }
  if (remaining > 0) {
    out.args = s.args.slice(0, remaining);
  }
  return out;
}
