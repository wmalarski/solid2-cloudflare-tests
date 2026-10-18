import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "storybook-solidjs-vite";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "storybook-solidjs-vite",
    options: {
      // Keep the Cloudflare plugin out of Storybook: the app's root `vite.config.ts`
      // runs the Worker/dev-server integration, which Storybook does not need.
      builder: { viteConfigPath: ".storybook/vite.config.ts" },
    },
  },
  viteFinal(config) {
    // Resolve the app-wide `~/*` -> `./src/*` alias from `tsconfig.app.json` for
    // both the browser build and the Vitest story runner.
    config.resolve ??= {};
    const { alias } = config.resolve;
    config.resolve.alias = Array.isArray(alias)
      ? [...alias, { find: "~", replacement: srcDir }]
      : // `Array.isArray` does not narrow `readonly Alias[]` out of the union.
        { ...(alias as Record<string, string> | undefined), "~": srcDir };
    return config;
  },
};

export default config;
