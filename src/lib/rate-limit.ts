/**
 * Small in-memory token bucket keyed by IP. Good enough for a single Node instance;
 * swap for Upstash/Redis when there is more than one.
 */
const buckets = new Map<string, { tokens: number; updated: number }>();
const CAPACITY = 20;
const REFILL_PER_SEC = 0.5; // 30/min sustained

export function rateLimit(key: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: CAPACITY, updated: now };
  b.tokens = Math.min(CAPACITY, b.tokens + ((now - b.updated) / 1000) * REFILL_PER_SEC);
  b.updated = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return { ok: false, retryAfter: Math.ceil((1 - b.tokens) / REFILL_PER_SEC) };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  if (buckets.size > 10000) {
    for (const [k, v] of buckets) if (now - v.updated > 600000) buckets.delete(k);
  }
  return { ok: true };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim();
}
