type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Bucket key (e.g. IP, email, or composite). */
  key: string;
  /** Window length in seconds. */
  windowSec: number;
  /** Max requests in window. */
  max: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(opts.key);

  if (!bucket || bucket.resetAt < now) {
    const fresh: Bucket = {
      count: 1,
      resetAt: now + opts.windowSec * 1000,
    };
    buckets.set(opts.key, fresh);
    return { ok: true, remaining: opts.max - 1, resetAt: fresh.resetAt };
  }

  if (bucket.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return {
    ok: true,
    remaining: opts.max - bucket.count,
    resetAt: bucket.resetAt,
  };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
