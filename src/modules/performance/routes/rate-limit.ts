import { createRateLimit } from "~/worker/rate-limit";

/**
 * Beacons are unauthenticated and fire-and-forget: a page view sends one or two
 * requests, so a generous per-IP limit keeps logs bounded without dropping real
 * traffic.
 */
export const webVitalsRateLimit = createRateLimit({ name: "web-vitals", limit: 120 });
