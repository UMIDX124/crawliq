/**
 * Stacked horizontal bar showing critical / warning / pass distribution.
 * Pure CSS — no SVG, no chart lib.
 */

export function SeverityBreakdown({
  critical,
  warning,
  pass,
}: {
  critical: number;
  warning: number;
  pass: number;
}) {
  const total = critical + warning + pass;
  if (total === 0) {
    return (
      <div className="grid place-items-center py-8">
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-fg-faint">
          No findings yet
        </span>
      </div>
    );
  }

  const pctCrit = (critical / total) * 100;
  const pctWarn = (warning / total) * 100;
  const pctPass = (pass / total) * 100;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-[color:var(--color-bg-3)]">
        {pctCrit > 0 && (
          <div
            className="h-full"
            style={{
              width: `${pctCrit}%`,
              backgroundColor: "var(--color-crit)",
            }}
          />
        )}
        {pctWarn > 0 && (
          <div
            className="h-full"
            style={{
              width: `${pctWarn}%`,
              backgroundColor: "var(--color-warn)",
            }}
          />
        )}
        {pctPass > 0 && (
          <div
            className="h-full"
            style={{
              width: `${pctPass}%`,
              backgroundColor: "var(--color-pass)",
            }}
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Tile label="Critical" value={critical} color="var(--color-crit)" />
        <Tile label="Warning" value={warning} color="var(--color-warn)" />
        <Tile label="Passing" value={pass} color="var(--color-pass)" />
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-muted">
          {label}
        </span>
      </div>
      <div
        className="mt-2 font-display font-extrabold text-[26px] leading-none tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
