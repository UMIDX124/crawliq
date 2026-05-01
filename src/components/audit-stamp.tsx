/**
 * Hand-pressed audit stamps. Uses the .stamp utility from globals.css.
 * - <Stamp severity="critical" /> → angled red CRITICAL
 * - <Stamp severity="passed" /> → angled green PASSED
 * - <AuditedSeal /> → larger circular "AUDITED" wax-seal style for hero corners
 */

export function Stamp({
  severity = "critical",
  children,
  className = "",
}: {
  severity?: "critical" | "passed";
  children?: React.ReactNode;
  className?: string;
}) {
  const cls = severity === "passed" ? "stamp stamp-passed" : "stamp";
  const label = children ?? (severity === "passed" ? "Verified" : "Critical");
  return <span className={`${cls} ${className}`}>{label}</span>;
}

export function AuditedSeal({
  date = new Date(),
  className = "",
}: {
  date?: Date;
  className?: string;
}) {
  const stamp = date.toISOString().slice(0, 10);
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      aria-hidden
      style={{ transform: "rotate(-8deg)" }}
    >
      <svg viewBox="0 0 120 120" width="100" height="100" fill="none">
        {/* outer broken ring */}
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeDasharray="3 5"
          opacity="0.85"
        />
        {/* inner solid ring */}
        <circle
          cx="60"
          cy="60"
          r="42"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          opacity="0.65"
        />
        {/* Curved label top: AUDITED */}
        <defs>
          <path
            id="topcurve"
            d="M 18 60 a 42 42 0 0 1 84 0"
            fill="none"
          />
          <path
            id="botcurve"
            d="M 18 60 a 42 42 0 0 0 84 0"
            fill="none"
          />
        </defs>
        <text
          fill="var(--color-accent)"
          fontFamily="var(--font-mono), ui-monospace, Menlo, monospace"
          fontSize="9.5"
          letterSpacing="3"
          fontWeight="700"
        >
          <textPath href="#topcurve" startOffset="50%" textAnchor="middle">
            · CRAWLIQ ·
          </textPath>
        </text>
        <text
          fill="var(--color-accent)"
          fontFamily="var(--font-mono), ui-monospace, Menlo, monospace"
          fontSize="8"
          letterSpacing="2.5"
          opacity="0.7"
        >
          <textPath href="#botcurve" startOffset="50%" textAnchor="middle">
            {stamp}
          </textPath>
        </text>
        {/* Center text */}
        <text
          x="60"
          y="58"
          textAnchor="middle"
          fill="var(--color-accent)"
          fontFamily="var(--font-mono), ui-monospace, Menlo, monospace"
          fontSize="13"
          fontWeight="900"
          letterSpacing="1.5"
        >
          AUDITED
        </text>
        <text
          x="60"
          y="74"
          textAnchor="middle"
          fill="var(--color-accent)"
          fontFamily="var(--font-mono), ui-monospace, Menlo, monospace"
          fontSize="8"
          opacity="0.7"
          letterSpacing="2"
        >
          rev 04
        </text>
        {/* register-cross */}
        <line x1="60" y1="20" x2="60" y2="28" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
        <line x1="60" y1="92" x2="60" y2="100" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="60" x2="28" y2="60" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
        <line x1="92" y1="60" x2="100" y2="60" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}
