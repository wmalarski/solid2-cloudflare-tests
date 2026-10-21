import { HTTPException } from "hono/http-exception";
import { logError, logWarn, serializeError } from "~/integrations/logger";
import type { Context } from "hono";

export const getSharedErrorRequest = (context: Context) => {
  const requestId = context.get("requestId") ?? "unknown";
  return {
    method: context.req.method,
    path: context.req.path,
    requestId,
  };
};

export const onErrorFallback = (error: Error, context: Context) => {
  const request = getSharedErrorRequest(context);

  if (error instanceof HTTPException) {
    const fields = {
      ...request,
      status: error.status,
      error: error.status >= 500 ? serializeError(error) : error.message,
    };

    if (error.status >= 500) {
      logError("request_failed", fields);
    } else {
      logWarn("request_failed", fields);
    }

    return context.json(
      { message: error.message || "Request failed", requestId: request.requestId },
      error.status,
    );
  }

  logError("unhandled_error", { ...request, error: serializeError(error) });

  return context.json({ message: "Internal Server Error", requestId: request.requestId }, 500);
};
