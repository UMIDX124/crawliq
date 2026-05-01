/**
 * Unicode/ASCII glyph set for audit-report aesthetic.
 * Cheaper than icon imports, distinct from generic SaaS, on-message
 * for engineering/terminal/document feel.
 */

type GlyphKind =
  | "section" //  ◇  — section marker
  | "play"    //  ▷  — directive / start
  | "star"    //  ✱  — critical / asterisk note
  | "rule"    //  ─  — divider piece
  | "section-mark" // §
  | "para"    //  ¶
  | "dagger"  //  †
  | "doubledagger" // ‡
  | "diamond-fill" // ◆
  | "circle"  //  ◯
  | "circle-fill"; // ●

const TABLE: Record<GlyphKind, string> = {
  section: "◇",
  play: "▷",
  star: "✱",
  rule: "─",
  "section-mark": "§",
  para: "¶",
  dagger: "†",
  doubledagger: "‡",
  "diamond-fill": "◆",
  circle: "◯",
  "circle-fill": "●",
};

export function Glyph({
  k,
  className = "",
}: {
  k: GlyphKind;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`font-mono inline-block leading-none select-none ${className}`}
    >
      {TABLE[k]}
    </span>
  );
}

/** Pre-composed eyebrow: "◇ section / 03" style — replaces the dot+text pattern */
export function ReportEyebrow({
  children,
  num,
  total = "12",
}: {
  children: React.ReactNode;
  num: string;
  total?: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10.5px] tracking-[0.18em] uppercase text-fg-muted leading-none">
      <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
        <Glyph k="section" className="text-[color:var(--color-accent)] text-[10px]" />
        <span className="text-fg-faint tabular-nums">§&nbsp;{num}&nbsp;/&nbsp;{total}</span>
      </span>
      <span className="text-fg-faint hidden sm:inline">·</span>
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
