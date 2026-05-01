import { cn } from "@/lib/cn";

/**
 * CrawlIQ animated reticle mark.
 *
 * Geometric precision tool. NO face, NO cartoon. Five layered animations
 * that all signal "active scan / found insight":
 *   1. Outer dashed ring slowly rotates clockwise (8s) — radar idle
 *   2. Inner solid 3/4 arc pulses opacity slightly — focal lock
 *   3. Core dot scales 1.0 → 1.15 → 1.0 (2.4s) — heartbeat
 *   4. NE "found" dot fades in/out (3.6s) — discovery cycle
 *   5. Connecting hairline draws in sync with the NE dot — link reveal
 *
 * Pure SVG + SMIL. Works in static contexts (PDF, OG images).
 */
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CrawlIQ"
      className={cn("shrink-0", className)}
    >
      {/* container — rounded square in accent */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="var(--color-accent, #FF5E1A)"
      />

      {/* outer dashed ring — slowly rotating */}
      <g>
        <circle
          cx="32"
          cy="32"
          r="18"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="2 6"
          opacity="0.45"
        />
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 32 32"
          to="360 32 32"
          dur="8s"
          repeatCount="indefinite"
        />
      </g>

      {/* inner solid 3/4 arc — gentle opacity pulse */}
      <path
        d="M 32 14
           A 18 18 0 1 1 14 32"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      >
        <animate
          attributeName="opacity"
          values="1;0.75;1"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </path>

      {/* core dot — heartbeat */}
      <circle cx="32" cy="32" r="3.5" fill="#ffffff">
        <animate
          attributeName="r"
          values="3.5;4.0;3.5"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* NE found dot — discovery cycle (fade + scale) */}
      <circle cx="48.5" cy="22" r="2.5" fill="#ffffff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;0;1;1;0;0"
          keyTimes="0;0.25;0.4;0.7;0.85;1"
          dur="3.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values="2;2;2.5;3;2.5;2"
          keyTimes="0;0.25;0.4;0.55;0.7;1"
          dur="3.6s"
          repeatCount="indefinite"
        />
      </circle>

      {/* connecting hairline — draws in sync with the NE dot */}
      <line
        x1="32"
        y1="32"
        x2="48.5"
        y2="22"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0"
        strokeDasharray="20"
        strokeDashoffset="20"
      >
        <animate
          attributeName="opacity"
          values="0;0;0.55;0.55;0;0"
          keyTimes="0;0.3;0.45;0.7;0.85;1"
          dur="3.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="20;20;0;0;20;20"
          keyTimes="0;0.3;0.55;0.7;0.85;1"
          dur="3.6s"
          repeatCount="indefinite"
        />
      </line>
    </svg>
  );
}
