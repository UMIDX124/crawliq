import { cn } from "@/lib/cn";

/**
 * CrawlIQ animated mascot mark.
 * A minimal abstract face — two scanning eyes + a mouth that cycles
 * through four expressions: idle → scanning → thinking → done.
 * Pure SVG + SMIL animations (no JS, no CSS keyframes — works in static
 * email PDFs too).
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
      {/* container badge — rounded square in accent */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="var(--color-accent, #0066ff)"
      />

      {/* subtle scan-line sweep — under everything */}
      <rect x="6" y="6" width="52" height="52" rx="11" fill="none" />
      <line
        x1="6"
        y1="14"
        x2="58"
        y2="14"
        stroke="rgb(255 255 255 / 0.45)"
        strokeWidth="0.6"
        strokeDasharray="2 3"
      >
        <animate
          attributeName="y1"
          values="14;50;14"
          dur="3.6s"
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          calcMode="linear"
        />
        <animate
          attributeName="y2"
          values="14;50;14"
          dur="3.6s"
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          calcMode="linear"
        />
        <animate
          attributeName="opacity"
          values="0;0.7;0;0.7;0"
          dur="3.6s"
          repeatCount="indefinite"
        />
      </line>

      {/* === LEFT EYE === */}
      <circle cx="22" cy="28" r="6" fill="rgb(255 255 255 / 0.18)" />
      {/* pupil — looks around + blinks */}
      <circle cx="22" cy="28" r="2.6" fill="#ffffff">
        <animate
          attributeName="cx"
          values="22;24;20;22;22;22"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.18;0.36;0.54;0.78;1"
        />
        <animate
          attributeName="cy"
          values="28;26;30;26;28;28"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.18;0.36;0.54;0.78;1"
        />
        {/* blink — pupil hides briefly */}
        <animate
          attributeName="r"
          values="2.6;2.6;2.6;2.6;2.6;0.4;2.6"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.6;0.85;0.88;0.92;0.94;1"
        />
      </circle>
      {/* eyelid for blink — sweeps across the eye */}
      <rect x="16" y="22" width="12" height="0" rx="6" fill="var(--color-accent, #0066ff)">
        <animate
          attributeName="height"
          values="0;0;12;0"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.92;0.95;0.98"
        />
      </rect>

      {/* === RIGHT EYE === */}
      <circle cx="42" cy="28" r="6" fill="rgb(255 255 255 / 0.18)" />
      <circle cx="42" cy="28" r="2.6" fill="#ffffff">
        <animate
          attributeName="cx"
          values="42;44;40;42;42;42"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.18;0.36;0.54;0.78;1"
        />
        <animate
          attributeName="cy"
          values="28;26;30;26;28;28"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.18;0.36;0.54;0.78;1"
        />
        <animate
          attributeName="r"
          values="2.6;2.6;2.6;2.6;2.6;0.4;2.6"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.6;0.85;0.88;0.92;0.94;1"
        />
      </circle>
      <rect x="36" y="22" width="12" height="0" rx="6" fill="var(--color-accent, #0066ff)">
        <animate
          attributeName="height"
          values="0;0;12;0"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.92;0.95;0.98"
        />
      </rect>

      {/* === MOUTH === overlapping paths, opacity-cycled.
           Order: 0–25%   neutral line
                  25–45%  small "o" (scanning/thinking)
                  45–70%  concerned curve (issue found)
                  70–95%  smile (audit complete)
                  95–100% idle reset (neutral) */}

      {/* neutral */}
      <path
        d="M24 46 L40 46"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      >
        <animate
          attributeName="opacity"
          values="1;1;0;0;0;1;1"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.22;0.27;0.45;0.92;0.96;1"
        />
      </path>

      {/* o (small ellipse) */}
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="#ffffff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;0;1;1;0;0"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.27;0.32;0.42;0.45;1"
        />
      </ellipse>

      {/* concerned curve */}
      <path
        d="M24 47 Q32 42 40 47"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0"
      >
        <animate
          attributeName="opacity"
          values="0;0;1;1;0;0"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.45;0.5;0.65;0.7;1"
        />
      </path>

      {/* smile */}
      <path
        d="M24 45 Q32 51 40 45"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0"
      >
        <animate
          attributeName="opacity"
          values="0;0;1;1;0;0"
          dur="7s"
          repeatCount="indefinite"
          keyTimes="0;0.7;0.75;0.92;0.96;1"
        />
      </path>
    </svg>
  );
}
