"use client";

/**
 * WebGPU plasma backdrop — premium hero atmosphere.
 *
 * Renders a single full-viewport quad with a TSL fragment node that produces
 * a slow-drifting tangerine cloud field over the cream body background. The
 * effect is purely additive at low alpha and sits behind everything in the
 * hero — feels like a printed ink wash, not a SaaS gradient.
 *
 * Behaviour:
 *  - WebGPU only. If `navigator.gpu` is missing (Safari < 18, older browsers)
 *    the component renders nothing and the hero falls back to its existing
 *    radial-gradient backdrop. No flash, no fallback canvas.
 *  - Honors `prefers-reduced-motion` (renders nothing, static fallback wins).
 *  - Pauses when off-screen via IntersectionObserver — zero GPU when scrolled
 *    past the hero.
 *  - Capped at devicePixelRatio 1.25 so it stays cheap on retina laptops.
 */

import { useEffect, useRef } from "react";

interface PlasmaProps {
  className?: string;
}

export function WebGPUPlasma({ className }: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("gpu" in navigator)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup = () => {};

    void (async () => {
      try {
        const THREE = await import("three/webgpu");
        const tsl = await import("three/tsl");

        if (cancelled) return;

        const {
          color,
          float,
          uv,
          time,
          sin,
          cos,
          length: tslLength,
        } = tsl;

        const renderer = new THREE.WebGPURenderer({
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        });
        await renderer.init();

        if (cancelled) {
          renderer.dispose();
          return;
        }

        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);

        const dom = renderer.domElement;
        dom.style.position = "absolute";
        dom.style.inset = "0";
        dom.style.width = "100%";
        dom.style.height = "100%";
        dom.style.pointerEvents = "none";
        container.appendChild(dom);

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const scene = new THREE.Scene();

        // Tangerine cloud over cream — drifts across two layered sine fields,
        // masked by a soft radial vignette so the edges fall to nothing.
        const tangerine = color(0xff5e1a);
        const t = time.mul(0.07);

        const p = uv().sub(0.5);
        const r = tslLength(p);

        const drift1 = sin(p.x.mul(2.6).add(t)).mul(
          cos(p.y.mul(3.0).sub(t.mul(0.8))),
        );
        const drift2 = sin(p.x.mul(5.1).sub(t.mul(0.6))).mul(
          cos(p.y.mul(4.4).add(t.mul(1.1))),
        );
        const drift = drift1.mul(0.55).add(drift2.mul(0.45));

        const vignette = float(1).sub(r.mul(1.55)).clamp();
        const intensity = drift.add(0.18).mul(vignette).clamp();

        const material = new THREE.MeshBasicNodeMaterial({ transparent: true });
        material.colorNode = tangerine;
        material.opacityNode = intensity.mul(0.32);

        const geometry = new THREE.PlaneGeometry(2, 2);
        const quad = new THREE.Mesh(geometry, material);
        scene.add(quad);

        let inView = true;
        let raf = 0;

        const tick = () => {
          if (cancelled) return;
          renderer.render(scene, camera);
          if (inView) raf = requestAnimationFrame(tick);
        };
        tick();

        const io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              const becameVisible = e.isIntersecting;
              if (becameVisible && !inView) {
                inView = true;
                raf = requestAnimationFrame(tick);
              } else if (!becameVisible) {
                inView = false;
                cancelAnimationFrame(raf);
              }
            }
          },
          { rootMargin: "120px" },
        );
        io.observe(container);

        const onResize = () => {
          const W = container.clientWidth || window.innerWidth;
          const H = container.clientHeight || window.innerHeight;
          renderer.setSize(W, H);
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          window.removeEventListener("resize", onResize);
          if (dom.parentNode === container) container.removeChild(dom);
          material.dispose();
          geometry.dispose();
          renderer.dispose();
        };
      } catch (err) {
        // WebGPU unavailable / device lost / TSL import failure —
        // silently leave the container empty so the static gradient stays.
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[WebGPUPlasma] disabled:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
