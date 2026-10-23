#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

/**
 * Enforces the byte budgets in `performance-budget.json` against a finished
 * build. Run `pnpm build` first, or use `pnpm budget` after a build.
 *
 * Sourcemaps are ignored: they are only emitted by `pnpm analyze` and are not
 * served to browsers. Sizes are gzip level 9 in kB (1000 bytes), matching Vite.
 */

const root = fileURLToPath(new URL("..", import.meta.url));
const distDir = join(root, "dist");

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (!entry.name.endsWith(".map")) {
      files.push(path);
    }
  }

  return files;
};

const readIfPresent = async (dir) => {
  try {
    return await walk(dir);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

const budget = JSON.parse(await readFile(join(root, "performance-budget.json"), "utf8"));

const clientFiles = await readIfPresent(join(distDir, "client"));

if (clientFiles === null) {
  console.error("No `dist/client` build found. Run `pnpm build` before checking the budget.");
  process.exit(1);
}

const workerDirs = (await readdir(distDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name !== "client")
  .map((entry) => join(distDir, entry.name));
const workerFiles = (await Promise.all(workerDirs.map(walk))).flat();

if (workerFiles.length === 0) {
  console.error("No Worker build found in `dist/`. Run `pnpm build` before checking the budget.");
  process.exit(1);
}

const sizes = new Map();

for (const file of [...clientFiles, ...workerFiles]) {
  sizes.set(file, gzipSync(await readFile(file), { level: 9 }).length);
}

const sum = (files) => files.reduce((total, file) => total + (sizes.get(file) ?? 0), 0);
const bytes = (kilobytes) => kilobytes * 1_000;
const format = (value) => `${(value / 1_000).toFixed(1)} kB`;

const clientJs = clientFiles.filter((file) => file.endsWith(".js"));
const clientCss = clientFiles.filter((file) => file.endsWith(".css"));
const workerJs = workerFiles.filter((file) => file.endsWith(".js"));

// Wrangler bundles `src/worker/index.ts` to `<worker>/index.js`; that entry is
// what a cold start evaluates. The remaining chunks are lazy dialect imports,
// which still count toward the uploaded script size.
const workerEntry = workerDirs.map((dir) => join(dir, "index.js")).find((file) => sizes.has(file));

if (workerEntry === undefined) {
  console.error("No Worker entry (`dist/<worker>/index.js`) found. Run `pnpm build` first.");
  process.exit(1);
}

const largestChunk = clientJs.reduce((largest, file) => Math.max(largest, sizes.get(file) ?? 0), 0);

const checks = [
  {
    label: "client JS",
    actual: sum(clientJs),
    limit: bytes(budget.client.javascriptKb),
    note: `${clientJs.length} file(s)`,
  },
  {
    label: "client CSS",
    actual: sum(clientCss),
    limit: bytes(budget.client.cssKb),
    note: `${clientCss.length} file(s)`,
  },
  {
    label: "largest client chunk",
    actual: largestChunk,
    limit: bytes(budget.client.largestChunkKb),
    note: "single .js file",
  },
  {
    label: "worker entry",
    actual: sizes.get(workerEntry) ?? 0,
    limit: bytes(budget.worker.entryKb),
    note: "cold start",
  },
  {
    label: "worker JS total",
    actual: sum(workerJs),
    limit: bytes(budget.worker.javascriptKb),
    note: `${workerJs.length} file(s)`,
  },
];

const width = Math.max(...checks.map((check) => check.label.length));
const failures = checks.filter((check) => check.actual > check.limit);

console.log("Performance budget (gzip, kB = 1000 bytes)\n");

for (const check of checks) {
  const status = check.actual > check.limit ? "OVER" : "ok";
  const actual = format(check.actual).padStart(9);
  const limit = format(check.limit).padStart(9);

  console.log(
    `  ${status.padEnd(4)} ${check.label.padEnd(width)} ${actual} / ${limit}   ${check.note}`,
  );
}

if (failures.length > 0) {
  console.error(`\n${failures.length} budget(s) exceeded:`);

  for (const failure of failures) {
    console.error(
      `  ${failure.label}: ${format(failure.actual)} > ${format(failure.limit)} ` +
        `(+${format(failure.actual - failure.limit)})`,
    );
  }

  console.error(
    "\nShrink the change, or raise the budget in `performance-budget.json` on purpose.",
  );
  process.exit(1);
}

console.log(`\nAll ${checks.length} budgets met.`);
