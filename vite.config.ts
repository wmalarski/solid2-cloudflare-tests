import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";
import Sonda from "sonda/vite";

const ANALYZE_MODE = "analyze";

export default defineConfig(({ command, mode }) => {
  const analyze = command === "build" && mode === ANALYZE_MODE;

  return {
    staged: {
      "*": "vp check --fix",
    },
    fmt: {
      ignorePatterns: ["worker-configuration.d.ts", ".agents/**"],
    },
    lint: {
      jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
      rules: { "vite-plus/prefer-vite-plus-imports": "error" },
      options: { typeAware: true, typeCheck: true },
      ignorePatterns: ["worker-configuration.d.ts", ".agents/**"],
    },
    plugins: [
      solid(),
      tailwindcss(),
      cloudflare(),
      ...(analyze ? [Sonda({ open: false }) as any] : []),
    ],
    build: {
      sourcemap: analyze,
      target: "esnext",
    },
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      host: "127.0.0.1",
    },
  };
});
