/**
 * Security headers check.
 * Each header has a known-good baseline; missing/weak = real finding.
 */

export type HeaderFinding = {
  header: string;
  status: "pass" | "warning" | "critical";
  present: boolean;
  value: string | null;
  message: string;
  recommendation: string;
};

export type SecurityHeadersReport = {
  url: string;
  /** 0-100 score = (passing / total) × 100 */
  score: number;
  findings: HeaderFinding[];
};

export async function checkSecurityHeaders(
  url: string,
): Promise<SecurityHeadersReport> {
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "CrawlIQ/1.0 (+https://crawliq.ai; security check)",
    },
    signal: AbortSignal.timeout(15_000),
  });

  const get = (h: string): string | null => res.headers.get(h);

  const findings: HeaderFinding[] = [];

  // HSTS
  const hsts = get("strict-transport-security");
  findings.push({
    header: "Strict-Transport-Security",
    present: !!hsts,
    value: hsts,
    status: !hsts
      ? "critical"
      : /max-age=(\d+)/.test(hsts) && Number(/max-age=(\d+)/.exec(hsts)?.[1]) >= 15552000
        ? "pass"
        : "warning",
    message: !hsts
      ? "HSTS header missing — browsers can be downgraded to HTTP."
      : "HSTS present.",
    recommendation:
      "Set: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
  });

  // CSP
  const csp = get("content-security-policy");
  findings.push({
    header: "Content-Security-Policy",
    present: !!csp,
    value: csp,
    status: !csp ? "warning" : "pass",
    message: !csp
      ? "No Content Security Policy — XSS protection minimal."
      : "CSP present.",
    recommendation:
      "Define a CSP with at least: default-src 'self'; script-src 'self' (loosen as needed).",
  });

  // X-Frame-Options
  const xfo = get("x-frame-options");
  const cspFrameAncestors = csp?.toLowerCase().includes("frame-ancestors");
  findings.push({
    header: "X-Frame-Options",
    present: !!xfo || !!cspFrameAncestors,
    value: xfo,
    status: !xfo && !cspFrameAncestors ? "warning" : "pass",
    message:
      !xfo && !cspFrameAncestors
        ? "Site can be framed by other origins — clickjacking risk."
        : "Frame protection in place.",
    recommendation:
      "Set: X-Frame-Options: DENY (or use frame-ancestors directive in CSP).",
  });

  // X-Content-Type-Options
  const xcto = get("x-content-type-options");
  findings.push({
    header: "X-Content-Type-Options",
    present: !!xcto,
    value: xcto,
    status: !xcto || xcto.toLowerCase() !== "nosniff" ? "warning" : "pass",
    message:
      !xcto || xcto.toLowerCase() !== "nosniff"
        ? "Browsers may MIME-sniff — opens XSS vectors via content-type confusion."
        : "MIME sniffing disabled.",
    recommendation: "Set: X-Content-Type-Options: nosniff",
  });

  // Referrer-Policy
  const ref = get("referrer-policy");
  findings.push({
    header: "Referrer-Policy",
    present: !!ref,
    value: ref,
    status: !ref ? "warning" : "pass",
    message: !ref
      ? "No Referrer-Policy — full URL leaks to third-party requests."
      : "Referrer policy declared.",
    recommendation:
      "Set: Referrer-Policy: strict-origin-when-cross-origin (or stricter).",
  });

  // Permissions-Policy
  const pp = get("permissions-policy");
  findings.push({
    header: "Permissions-Policy",
    present: !!pp,
    value: pp,
    status: !pp ? "warning" : "pass",
    message: !pp
      ? "No Permissions-Policy — third-party scripts can request camera, mic, geolocation by default."
      : "Permissions policy declared.",
    recommendation:
      "Lock down sensitive features: camera=(), microphone=(), geolocation=(), interest-cohort=()",
  });

  const passing = findings.filter((f) => f.status === "pass").length;
  const score = Math.round((passing / findings.length) * 100);

  return { url, score, findings };
}
