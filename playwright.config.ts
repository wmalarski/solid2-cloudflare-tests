import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end (E2E) tests.
 *
 * These drive the *real* app through a browser — Solid client, Hono Worker and
 * its Cloudflare bindings (D1 via `wrangler.jsonc`) all run together. They are
 * deliberately separate from the Vitest projects in `vitest.config.ts`, which
 * mock the API with MSW and never touch the Worker.
 *
 * The `webServer` block below boots `pnpm dev` (Vite + `@cloudflare/vite-plugin`)
 * and waits for it before the first test runs, so there is nothing to start by
 * hand:
 *
 *   pnpm test-e2e            # run the suite
 *   pnpm test-e2e --ui       # interactive UI mode
 *   pnpm test-e2e --headed   # watch it in a real browser window
 *
 * The Chromium browser must be installed once:
 * `pnpm exec playwright install chromium`.
 */
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
    baseURL: "http://127.0.0.1:5173",
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
    command: "pnpm dev",
    url: "http://127.0.0.1:5173",
    // Reuse a dev server you already have running locally; never reuse in CI.
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    // The Cloudflare plugin connects to the remote D1 binding on cold start,
    // which can take a little while.
    timeout: 120_000,
  },
});
