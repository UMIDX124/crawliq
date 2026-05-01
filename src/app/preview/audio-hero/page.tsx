"use client";

/**
 * /preview/audio-hero — audio-reactive hero (no audio file).
 *
 * Uses Web Audio API to:
 *  - Generate a low-volume hum via two detuned oscillators (drone)
 *  - Each user keystroke in URL input triggers a brief amplitude bump
 *  - A second LFO modulates the master gain for ambient breath
 *  - Visualizer bar shows current audio level (AnalyserNode)
 *  - Toggle on/off via footer button (default OFF — ambient audio is opt-in)
 *
 * Zero audio assets. All synthesized in-browser.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SpeakerHigh, SpeakerSlash, Sparkle, ArrowRight } from "@phosphor-icons/react";

export default function AudioHeroPreview() {
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState(0);
  const [url, setUrl] = useState("");

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bumpGainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Initialize / teardown audio graph when toggled
  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close();
      ctxRef.current = null;
      setLevel(0);
      return;
    }

    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;

    // Master gain — kept low (ambient hum, not foreground audio)
    const master = ctx.createGain();
    master.gain.value = 0.04;
    masterGainRef.current = master;

    // Two detuned sine oscillators for a soft drone
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 110;
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 110.6; // slight detune

    // LFO for ambient amplitude breath
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(master.gain);

    // Bump gain — for keystroke-triggered amplitude bumps
    const bump = ctx.createGain();
    bump.gain.value = 0;
    bumpGainRef.current = bump;

    // Filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 0.4;

    // Analyser for visualizer
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Wire it up
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(bump);
    bump.connect(master);
    master.connect(analyser);
    analyser.connect(ctx.destination);

    osc1.start();
    osc2.start();
    lfo.start();

    // Visualizer loop
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = (buffer[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buffer.length);
      setLevel(rms);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        osc1.stop();
        osc2.stop();
        lfo.stop();
      } catch {}
      ctx.close();
    };
  }, [enabled]);

  // Trigger a small amplitude bump when user types
  const triggerBump = () => {
    const bump = bumpGainRef.current;
    const ctx = ctxRef.current;
    if (!bump || !ctx) return;
    const now = ctx.currentTime;
    bump.gain.cancelScheduledValues(now);
    bump.gain.setValueAtTime(bump.gain.value, now);
    bump.gain.linearRampToValueAtTime(2.5, now + 0.04);
    bump.gain.exponentialRampToValueAtTime(1, now + 0.5);
  };

  return (
    <main className="min-h-[100dvh] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] flex flex-col">
      <Link
        href="/preview"
        className="btn-tactile fixed top-4 left-4 z-50 px-3.5 py-2 backdrop-blur-md font-mono text-[10px] tracking-[0.22em] uppercase border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/70 rounded-full text-fg-muted hover:text-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]"
      >
        ← preview index
      </Link>

      <section className="flex-1 flex items-center justify-center px-6 md:px-10 py-32">
        <div className="max-w-[820px] mx-auto text-center w-full">
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] mb-4">
            &lt; 09 / 12 · AUDIO-REACTIVE HERO &gt;
          </div>
          <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[color:var(--color-accent)] mb-6 inline-flex items-center gap-2">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${enabled ? "bg-[color:var(--color-accent)] pulse-dot" : "bg-[color:var(--color-fg-faint)]"}`} />
            Phase 9 · audio-reactive (synthesized)
          </div>
          <h1 className="font-display font-black text-balance text-[clamp(36px,6vw,80px)] leading-[0.92] tracking-[-0.035em] mb-8">
            Hear the audit{" "}
            <span className="italic font-light text-[color:var(--color-fg-muted)]">begin.</span>
          </h1>

          {/* Visualizer bar with overlay hint when muted */}
          <div className="mx-auto max-w-[480px] mb-7 relative">
            <div className="flex items-end gap-1 h-14 px-3 py-2 rounded-md bg-[color:var(--color-bg-2)] border border-[color:var(--color-border)]">
              {Array.from({ length: 40 }).map((_, i) => {
                const phase = i / 40;
                const heightPct =
                  10 +
                  Math.min(100, level * 320) * (0.4 + Math.sin(phase * Math.PI) * 0.6) +
                  (enabled ? Math.sin((Date.now() / 600) + phase * 6) * 4 : 0);
                return (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.08, ease: "linear" }}
                    style={{
                      background:
                        i < 4 || i > 35
                          ? "rgb(255 94 26 / 0.25)"
                          : "var(--color-accent)",
                      opacity: enabled ? 1 : 0.2,
                    }}
                  />
                );
              })}
            </div>
            {!enabled && (
              <button
                type="button"
                onClick={() => setEnabled(true)}
                className="btn-tactile absolute inset-0 flex items-center justify-center rounded-md bg-[color:var(--color-bg)]/55 backdrop-blur-[2px] hover:bg-[color:var(--color-bg)]/35 transition-colors"
              >
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]/90 font-mono text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]">
                  <SpeakerSlash size={11} weight="fill" />
                  muted · tap to hear
                </span>
              </button>
            )}
          </div>

          {/* URL input — keystrokes trigger bumps */}
          <form
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
              onChange={(e) => {
                setUrl(e.target.value.replace(/^https?:\/\//, ""));
                if (enabled) triggerBump();
              }}
              placeholder="type to hear the hum react"
              className="flex-1 min-w-0 bg-transparent px-3 py-3 outline-none text-[14px] sm:text-[15px] placeholder:text-[color:var(--color-fg-faint)]"
            />
            <button
              type="submit"
              className="btn-tactile shrink-0 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.22em] font-bold hover:bg-[color:var(--color-accent-hover)]"
            >
              <Sparkle size={13} weight="fill" />
              <span className="hidden sm:inline">Run audit</span>
              <ArrowRight size={13} weight="bold" />
            </button>
          </form>

          <p className="mt-8 text-balance text-[color:var(--color-fg-muted)] text-[14px] leading-[1.6] max-w-[60ch] mx-auto">
            Audio default: <span className="text-[color:var(--color-fg)]">muted</span>. Toggle below to enable a barely-audible hum that reacts to typing.
            <br />
            All audio synthesized in-browser via Web Audio API. Zero assets shipped.
          </p>
        </div>
      </section>

      {/* Footer audio toggle */}
      <footer className="border-t border-[color:var(--color-border)] py-5 px-6 md:px-10">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[color:var(--color-fg-faint)]">
            &lt; 09 / 12 · END OF PHASE &gt;
          </div>
          <button
            onClick={() => setEnabled((v) => !v)}
            className="btn-tactile inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)] transition-colors font-mono text-[10.5px] tracking-[0.22em] uppercase"
          >
            {enabled ? (
              <>
                <SpeakerHigh size={14} weight="fill" className="text-[color:var(--color-accent)]" />
                <span>Sound on</span>
              </>
            ) : (
              <>
                <SpeakerSlash size={14} weight="fill" className="text-[color:var(--color-fg-muted)]" />
                <span>Sound off</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </main>
  );
}
