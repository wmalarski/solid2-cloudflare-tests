import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { msw } from "msw/vite";
import { fileURLToPath } from "node:url";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus/test/config";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

/** Shared browser-mode settings for the DOM test projects. */
const browser = () => ({
  enabled: true,
  headless: true,
  provider: playwright(),
  instances: [{ browser: "chromium" as const }],
});

/**
 * Browser-mode tests.
 *
 * Kept in `vitest.config.ts` (not `vite.config.ts`) so the app's Cloudflare
 * dev/build config stays untouched. Three projects run here:
 *
 * - `ui`: unit + screenshot tests for the `src/ui` component library.
 * - `integration`: tests for composed UI (`src/modules`, `src/integrations`)
 *   that talk to the Hono API through MSW.
 * - `worker`: Node-environment tests for Worker routes and shared server code.
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
        plugins: [solid(), msw({ mode: "worker-only" })],
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
          setupFiles: ["./src/testing/test-setup.ts"],
          browser: browser(),
        },
      },
      {
        extends: true,
        plugins: [solid(), msw({ mode: "worker-only" })],
        resolve: {
          alias: { "~": srcDir },
          dedupe: ["solid-js", "@solidjs/web"],
        },
        test: {
          name: "integration",
          include: ["src/modules/**/*.test.{ts,tsx}", "src/integrations/**/*.test.{ts,tsx}"],
          setupFiles: ["./src/testing/test-setup.ts"],
          browser: browser(),
        },
      },
      {
        extends: true,
        resolve: {
          alias: { "~": srcDir },
        },
        test: {
          name: "worker",
          include: ["src/worker/**/*.test.ts", "src/performance/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: ".storybook" })],
        test: {
          name: "storybook",
          browser: browser(),
        },
      },
    ],
  },
});
