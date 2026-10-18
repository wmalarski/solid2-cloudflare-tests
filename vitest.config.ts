import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus/test/config";

/**
 * Storybook interaction/story tests.
 *
 * Kept in `vitest.config.ts` (not `vite.config.ts`) so the app's Cloudflare
 * dev/build config stays untouched. Run with `pnpm test-storybook`; the
 * Playwright Chromium browser must be installed (`pnpm exec playwright install
 * chromium`).
 */
export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: ".storybook" })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
