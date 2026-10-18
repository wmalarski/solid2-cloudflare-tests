import { afterAll, afterEach, beforeAll } from "vite-plus/test";
import { worker } from "./browser";
import { resetMockDb } from "./db";

/**
 * MSW life-cycle for Vitest browser mode.
 *
 * Imported for its side effects by the test setup files: it starts request
 * interception once per test file, resets handlers and the in-memory Hono
 * database between tests, and stops the worker afterwards.
 *
 * Vitest's own asset/module requests are passed through silently; a request to
 * an unmocked `/api/*` route is still reported as a warning so missing
 * handlers are easy to spot.
 */
beforeAll(async () => {
  await worker.start({
    quiet: true,
    onUnhandledFrame({ frame, defaults }) {
      if (frame.protocol !== "http") {
        return;
      }

      const { request } = frame.data as { request: Request };
      if (new URL(request.url).pathname.startsWith("/api/")) {
        defaults.warn();
      }
    },
  });
});

afterEach(() => {
  worker.resetHandlers();
  resetMockDb();
});

afterAll(async () => {
  await worker.stop();
});
