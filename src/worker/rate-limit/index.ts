import { factory } from "~/worker/factory";

type RateLimitOptions = {
  limit: number;
  name: string;
  windowMs?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * Per-isolate fixed-window rate limiter.
 *
 * This is deliberately cheap and dependency-free: it protects a single Worker
 * isolate from runaway clients, but it is not a global quota (each isolate has
 * its own counters, and they reset when the isolate is recycled). Keep
 * Cloudflare's Rate Limiting rules in front of the Spotify-backed routes for
 * enforcement across the edge.
 */
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5_000;

const evictExpired = (now: number) => {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const createRateLimit = ({ limit, name, windowMs = 60_000 }: RateLimitOptions) => {
  return factory.createMiddleware(async (context, next) => {
    const now = Date.now();

    if (buckets.size >= MAX_TRACKED_KEYS) {
      evictExpired(now);
    }

    const identity =
      context.get("session")?.userId ?? context.req.header("cf-connecting-ip") ?? "anonymous";

    const key = `${name}:${identity}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
    } else if (bucket.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000));

      context.header("Retry-After", String(retryAfter));

      return context.json({ message: "Too many requests. Please try again later." }, 429);
    } else {
      bucket.count += 1;
    }

    return next();
  });
};
