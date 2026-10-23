import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end (E2E) tests.
 *
 * These drive the *real* app through a browser — Solid client, Hono Worker and
 * its Cloudflare bindings (D1 via `wrangler.jsonc`) all run together. They are
 * deliberately separate from the Vitest projects in `vitest.config.ts`, which
 * mock the API with MSW and never touch the Worker.
 *
 * By default the suite runs against the **production build** served by
 * `pnpm preview`, so bundle sizes and performance numbers reflect what ships.
 * The `webServer` block builds first and waits for the preview before the first
 * test runs:
 *
 *   pnpm test-e2e            # build + preview + run the suite
 *   pnpm test-e2e --ui       # interactive UI mode
 *   pnpm test-e2e --headed   # watch it in a real browser window
 *
 * For fast iteration, `E2E_TARGET=dev` runs against `pnpm dev` instead. The dev
 * server serves unbundled modules, so it is not representative for performance.
 *
 * The Chromium browser must be installed once:
 * `pnpm exec playwright install chromium`.
 */

const PREVIEW_PORT = 4173;
const DEV_PORT = 5173;

const target = process.env.E2E_TARGET === "dev" ? "dev" : "preview";
const baseURL = `http://127.0.0.1:${target === "dev" ? DEV_PORT : PREVIEW_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      target === "dev"
        ? `pnpm dev --port ${DEV_PORT} --strictPort`
        : `pnpm build && pnpm preview --port ${PREVIEW_PORT} --strictPort`,
    url: baseURL,
    // Reuse a server you already have running locally; never reuse in CI.
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    // A production build plus the Worker's remote D1 cold start can take a
    // little while.
    timeout: 180_000,
  },
});
