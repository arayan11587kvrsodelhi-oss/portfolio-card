/**
 * In-memory sliding-window rate limiter.
 *
 * Suitable for a single Node/serverless instance — enough to blunt public-form
 * abuse. For multi-instance production, swap the Map for a shared store
 * (Upstash Redis, Vercel KV, etc.) behind the same `rateLimit` API.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt, limit };
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;

  return {
    allowed,
    remaining: Math.max(limit - bucket.count, 0),
    resetAt: bucket.resetAt,
    limit,
  };
}

/** Best-effort client identifier from proxy headers (never stores raw IP). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}

/** One-way hash so we never persist a raw visitor IP. */
export function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return `ip_${(hash >>> 0).toString(16)}`;
}

/** Periodically drop expired buckets so the Map cannot grow unbounded. */
export function pruneRateLimitBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

if (typeof setInterval !== 'undefined') {
  const timer = setInterval(pruneRateLimitBuckets, 60_000);
  // Don't keep the process alive just for pruning.
  if (typeof timer.unref === 'function') timer.unref();
}
