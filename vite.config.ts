import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["worker-configuration.d.ts"],
  },
  plugins: [solid(), tailwindcss(), cloudflare()],
  build: {
    sourcemap: false,
    target: "esnext",
  },
  resolve: {
    tsconfigPaths: true,
  },
});
