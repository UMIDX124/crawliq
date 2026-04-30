/**
 * Pure-SVG sparkline / line chart for audit score trend.
 * No Recharts dep — keeps the bundle small and the look on-brand.
 */

type Point = { date: Date; score: number };

export function AuditTrendChart({
  points,
  height = 140,
}: {
  points: Point[];
  height?: number;
}) {
  if (points.length === 0) {
    return (
      <div className="h-[140px] grid place-items-center">
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-faint">
          No data yet
        </span>
      </div>
    );
  }

  const W = 600;
  const H = height;
  const PAD_X = 18;
  const PAD_Y = 22;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  const xs = points.map((_, i) =>
    points.length === 1
      ? PAD_X + innerW / 2
      : PAD_X + (i / (points.length - 1)) * innerW,
  );
  const ys = points.map((p) => PAD_Y + innerH * (1 - p.score / 100));

  const path = points
    .map((_, i) => `${i === 0 ? "M" : "L"}${xs[i].toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M${xs[0].toFixed(1)},${(PAD_Y + innerH).toFixed(1)} ` +
    points.map((_, i) => `L${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(" ") +
    ` L${xs[xs.length - 1].toFixed(1)},${(PAD_Y + innerH).toFixed(1)} Z`;

  // grid: 0 / 50 / 100
  const gridYs = [0, 50, 100].map((v) => PAD_Y + innerH * (1 - v / 100));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      role="img"
      aria-label="Audit score trend"
    >
      {/* gridlines */}
      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={y}
          y2={y}
          stroke="rgb(29 29 31 / 0.08)"
          strokeDasharray="2 4"
        />
      ))}
      {/* y-axis labels */}
      {[0, 50, 100].map((v, i) => (
        <text
          key={i}
          x={PAD_X - 4}
          y={gridYs[i] + 3}
          textAnchor="end"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize="9"
          fill="rgb(29 29 31 / 0.32)"
        >
          {v}
        </text>
      ))}
      {/* area fill */}
      <path d={areaPath} fill="rgb(0 102 255 / 0.08)" />
      {/* line */}
      <path
        d={path}
        fill="none"
        stroke="var(--color-accent, #0066ff)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={xs[i]}
            cy={ys[i]}
            r="3.5"
            fill="var(--color-accent, #0066ff)"
            stroke="white"
            strokeWidth="1.5"
          />
          <title>
            {p.date.toLocaleDateString()} · {p.score}/100
          </title>
        </g>
      ))}
    </svg>
  );
}
