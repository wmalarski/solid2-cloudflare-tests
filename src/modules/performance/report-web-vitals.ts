import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

/**
 * Field data (RUM) for Core Web Vitals.
 *
 * Samples are batched and posted to `/api/rum`, where the Worker logs them and
 * flags anything over the budgets in `performance-budget.json`. Reporting is
 * best-effort: it never blocks rendering, and a failed request is swallowed.
 *
 * Enabled by `src/index.tsx` in production builds, or in development with
 * `?vitals` in the URL.
 */

const ENDPOINT = "/api/rum";
const FLUSH_DELAY_MS = 1_000;
const MAX_BATCH = 10;

/** The subset of a `web-vitals` metric that leaves the browser. */
type WebVitalSample = Pick<Metric, "name" | "value" | "delta" | "id" | "navigationType">;

let batch: WebVitalSample[] = [];
let timer: number | undefined;

/** Coarse connection class, so a poor LCP can be blamed on the network. */
const connectionType = () => {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } })
    .connection;

  return connection?.effectiveType;
};

const send = (samples: WebVitalSample[]) => {
  const body = JSON.stringify({
    path: location.pathname,
    connection: connectionType(),
    metrics: samples,
  });

  // A beacon survives page teardown, which is when the final LCP/CLS land.
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) {
    return;
  }

  void fetch(ENDPOINT, {
    method: "POST",
    body,
    keepalive: true,
    headers: { "content-type": "application/json" },
  }).catch(() => {
    // Metrics are diagnostics, never user-facing: drop failed reports.
  });
};

const flush = () => {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }

  if (batch.length === 0) {
    return;
  }

  const samples = batch;
  batch = [];
  send(samples);
};

const enqueue = (metric: Metric) => {
  batch.push({
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  if (batch.length >= MAX_BATCH) {
    flush();
    return;
  }

  timer ??= window.setTimeout(flush, FLUSH_DELAY_MS);
};

export const reportWebVitals = () => {
  onCLS(enqueue);
  onFCP(enqueue);
  onINP(enqueue);
  onLCP(enqueue);
  onTTFB(enqueue);

  addEventListener("pagehide", flush, { capture: true });
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush();
    }
  });
};
