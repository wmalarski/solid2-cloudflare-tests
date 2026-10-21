import { factory } from "~/worker/factory";
import { logInfo } from "~/integrations/logger";

export const requestLogger = factory.createMiddleware(async (context, next) => {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();

  context.set("requestId", requestId);
  context.header("x-request-id", requestId);

  try {
    await next();
  } finally {
    logInfo("request_completed", {
      requestId,
      method: context.req.method,
      path: context.req.path,
      status: context.res.status,
      durationMs: Math.round(performance.now() - startedAt),
    });
  }
});
