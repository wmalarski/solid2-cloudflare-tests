import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus/test/config";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

/**
 * Browser-mode tests.
 *
 * Kept in `vitest.config.ts` (not `vite.config.ts`) so the app's Cloudflare
 * dev/build config stays untouched. Two projects run here:
 *
 * - `ui`: unit + screenshot tests for the `src/ui` component library.
 * - `storybook`: Storybook story tests (see `pnpm test-storybook`).
 *
 * The Playwright Chromium browser must be installed once
 * (`pnpm exec playwright install chromium`).
 */
export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    projects: [
      {
        extends: true,
        plugins: [solid()],
        resolve: {
          // Mirror the app-wide `~/*` -> `./src/*` alias from `tsconfig.app.json`.
          alias: { "~": srcDir },
          // Avoid duplicate Solid instances when the optimizer races on cold
          // starts, which otherwise breaks the reactive owner chain in dev.
          dedupe: ["solid-js", "@solidjs/web"],
        },
        test: {
          name: "ui",
          include: ["src/ui/**/*.test.{ts,tsx}"],
          setupFiles: ["./src/ui/test-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
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
