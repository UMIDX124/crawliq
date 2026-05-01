"use client";

import { useEffect } from "react";

/**
 * Lenis smooth scroll. Disables itself when the user prefers reduced motion.
 * Lazy-imported so it never blocks the initial bundle.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    let cleanup = () => {};

    let cancelled = false;
    void (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;

      const lenis = new Lenis({
        // Tighter lerp gives a responsive feel; long duration was causing 1+ sec
        // scroll lag. 0.1 lerp is what Linear/Vercel use.
        lerp: 0.1,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.5,
        smoothWheel: true,
      });

      const tick = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
