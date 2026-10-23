/**
 * In-page performance collection for Playwright E2E tests.
 *
 * `collectPerformance` is handed to `page.addInitScript`, so Playwright
 * serialises its source and runs it before any page script. It must therefore
 * be self-contained (no imports, no outer references). `readPerformance` runs
 * at the end of a test and snapshots whatever the observers saw.
 *
 * These are lab numbers from the Playwright browser, not field data. CLS is a
 * plain sum (web-vitals uses session windows) and INP is the worst event
 * duration, which is enough to spot regressions in the flows under test.
 */

export type PerformanceSnapshot = {
  lcp: number | null;
  cls: number;
  fcp: number | null;
  inp: number | null;
  ttfb: number | null;
  domContentLoaded: number | null;
  load: number | null;
  longTasks: { count: number; max: number; totalBlockingTime: number };
  resources: {
    count: number;
    transferSize: number;
    byType: Record<string, { count: number; transferSize: number }>;
  };
};

type Collected = {
  cls: number;
  fcp: number | null;
  inp: number | null;
  lcp: number | null;
  longTasks: { duration: number; start: number }[];
};

declare global {
  interface Window {
    __perf?: Collected;
  }
}

/** Installed with `page.addInitScript`; runs before the application boots. */
export const collectPerformance = () => {
  const state: Collected = { cls: 0, fcp: null, inp: null, lcp: null, longTasks: [] };

  window.__perf = state;

  const observe = (
    type: string,
    handle: (entry: PerformanceEntry) => void,
    extra?: Record<string, unknown>,
  ) => {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          handle(entry);
        }
      });

      observer.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
    } catch {
      // Unsupported entry types leave the metric null instead of failing the test.
    }
  };

  observe("paint", (entry) => {
    if (entry.name === "first-contentful-paint") {
      state.fcp = entry.startTime;
    }
  });

  observe("largest-contentful-paint", (entry) => {
    state.lcp = Math.max(state.lcp ?? 0, entry.startTime);
  });

  observe("layout-shift", (entry) => {
    const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };

    if (!shift.hadRecentInput) {
      state.cls += shift.value;
    }
  });

  observe(
    "event",
    (entry) => {
      state.inp = Math.max(state.inp ?? 0, entry.duration);
    },
    { durationThreshold: 16 },
  );

  observe("longtask", (entry) => {
    state.longTasks.push({ duration: entry.duration, start: entry.startTime });
  });
};

/** Runs in the page at the end of a test. */
export const readPerformance = (): PerformanceSnapshot => {
  // Self-contained: Playwright serialises this function, so module-level
  // helpers are not available inside it.
  const normalize = (value: number | null, digits = 0) => {
    if (value === null || value <= 0) {
      return null;
    }

    const factor = 10 ** digits;

    return Math.round(value * factor) / factor;
  };

  const state = window.__perf ?? { cls: 0, fcp: null, inp: null, lcp: null, longTasks: [] };
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];

  const byType: PerformanceSnapshot["resources"]["byType"] = {};
  let transferSize = 0;

  for (const resource of resources) {
    const type = resource.initiatorType || "other";
    const summary = (byType[type] ??= { count: 0, transferSize: 0 });

    summary.count += 1;
    summary.transferSize += resource.transferSize;
    transferSize += resource.transferSize;
  }

  const totalBlockingTime = state.longTasks.reduce(
    (total, task) => total + Math.max(0, task.duration - 50),
    0,
  );

  return {
    cls: normalize(state.cls, 3) ?? 0,
    domContentLoaded: normalize(navigation?.domContentLoadedEventEnd ?? null),
    fcp: normalize(state.fcp),
    inp: normalize(state.inp),
    lcp: normalize(state.lcp),
    load: normalize(navigation?.loadEventEnd ?? null),
    longTasks: {
      count: state.longTasks.length,
      max: normalize(Math.max(0, ...state.longTasks.map((task) => task.duration))) ?? 0,
      totalBlockingTime: normalize(totalBlockingTime) ?? 0,
    },
    resources: { count: resources.length, transferSize, byType },
    ttfb: normalize(navigation?.responseStart ?? null),
  };
};
