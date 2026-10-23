import { readFileSync } from "node:fs";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { test as base, expect, type Page } from "@playwright/test";
import { collectPerformance, readPerformance, type PerformanceSnapshot } from "./performance";

/**
 * Performance-aware E2E `test`.
 *
 * Every test gets an auto fixture that installs the collector before the app
 * boots, then attaches a `performance` JSON to the report and appends the same
 * record to `test-results/performance.jsonl` when the test ends.
 *
 * Opt-in modes:
 *
 *   PERF_THROTTLE=1  Slow 4G (150 ms RTT, 1.6/0.75 Mbps) and 4x CPU throttling.
 *   PERF_BUDGET=1    assert the `lab` budgets in `performance-budget.json`.
 *                    Calibrated for the production preview (the default E2E
 *                    target); skipped when E2E_TARGET=dev is set.
 *
 * The suite runs against `pnpm preview` by default, so these numbers reflect the
 * production build. With `E2E_TARGET=dev` they come from the dev server, whose
 * unbundled modules make throttled runs meaningless. Field data comes from the
 * `web-vitals` RUM setup.
 */

const RESULTS_FILE = "test-results/performance.jsonl";

// Playwright loads test files as native ESM, where JSON imports need an import
// attribute; read the shared budget file instead so both loaders agree.
const budget = JSON.parse(
  readFileSync(new URL("../performance-budget.json", import.meta.url), "utf8"),
) as { lab: { cls: number; inpMs: number; lcpMs: number; tbtMs: number } };

const THROTTLE = {
  cpuRate: 4,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  latency: 150,
  uploadThroughput: (750 * 1024) / 8,
};

export type PerformanceRecord = PerformanceSnapshot & {
  project: string;
  test: string;
  throttled: boolean;
  url: string;
};

/** Chromium-only: CDP is the only way to emulate the network and CPU here. */
const applyThrottle = async (page: Page) => {
  const session = await page.context().newCDPSession(page);

  await session.send("Network.enable");
  await session.send("Network.emulateNetworkConditions", {
    downloadThroughput: THROTTLE.downloadThroughput,
    latency: THROTTLE.latency,
    offline: false,
    uploadThroughput: THROTTLE.uploadThroughput,
  });
  await session.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE.cpuRate });
};

/** A test may close or navigate the page itself; that is not a perf failure. */
const snapshotOf = async (page: Page): Promise<PerformanceSnapshot | null> => {
  try {
    return await page.evaluate(readPerformance);
  } catch (error) {
    if (!page.isClosed()) {
      console.warn(`[perf] could not read metrics: ${String(error)}`);
    }

    return null;
  }
};

/**
 * Lets the last paint land so LCP/FCP are not missed by a fast test. Two frames
 * flush pending observer callbacks without a fixed sleep.
 */
const settle = async (page: Page) => {
  await page.waitForLoadState("load", { timeout: 2_000 }).catch(() => {});

  await page
    .evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    )
    .catch(() => {});
};

const format = (record: PerformanceRecord) => {
  const value = (metric: number | null) => (metric === null ? "-" : `${metric}ms`);

  return (
    `[perf] ${record.test} · LCP ${value(record.lcp)} · CLS ${record.cls} · ` +
    `INP ${value(record.inp)} · TBT ${record.longTasks.totalBlockingTime}ms · ` +
    `${record.resources.count} requests${record.throttled ? " · throttled" : ""}`
  );
};

const assertBudget = (record: PerformanceRecord) => {
  const { lab } = budget;

  if (record.lcp !== null) {
    expect.soft(record.lcp, "LCP (ms)").toBeLessThanOrEqual(lab.lcpMs);
  }

  expect.soft(record.cls, "CLS").toBeLessThanOrEqual(lab.cls);

  if (record.inp !== null) {
    expect.soft(record.inp, "INP proxy (ms)").toBeLessThanOrEqual(lab.inpMs);
  }

  expect
    .soft(record.longTasks.totalBlockingTime, "total blocking time (ms)")
    .toBeLessThanOrEqual(lab.tbtMs);
};

export const test = base.extend<{ performance: void }>({
  performance: [
    async ({ browserName, page }, use, testInfo) => {
      await page.addInitScript(collectPerformance);

      const throttled = process.env.PERF_THROTTLE === "1" && browserName === "chromium";

      if (throttled) {
        await applyThrottle(page);
      }

      await use();

      await settle(page);

      const snapshot = await snapshotOf(page);

      if (snapshot === null) {
        return;
      }

      const record: PerformanceRecord = {
        ...snapshot,
        project: testInfo.project.name,
        test: testInfo.titlePath.join(" › "),
        throttled,
        url: page.url(),
      };

      await testInfo.attach("performance", {
        body: JSON.stringify(record, null, 2),
        contentType: "application/json",
      });

      await mkdir(dirname(RESULTS_FILE), { recursive: true });
      await appendFile(RESULTS_FILE, `${JSON.stringify(record)}\n`);

      console.log(format(record));

      if (process.env.PERF_BUDGET === "1") {
        if (process.env.E2E_TARGET === "dev") {
          console.warn(
            "[perf] PERF_BUDGET is calibrated for the production preview; " +
              "skipping budget assertions while E2E_TARGET=dev is set.",
          );
        } else {
          assertBudget(record);
        }
      }
    },
    { auto: true },
  ],
});

export { expect };
