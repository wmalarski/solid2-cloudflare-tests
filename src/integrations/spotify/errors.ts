import type { ContentfulStatusCode } from "hono/utils/http-status";
import { logError, logWarn, serializeError } from "../logger";
import type { Context } from "hono";
import { getSharedErrorRequest } from "~/worker/errors";

export class SpotifyError extends Error {
  readonly retryAfterSeconds?: number;
  readonly status: number;

  constructor(
    message: string,
    status: number,
    options?: { cause?: unknown; retryAfterSeconds?: number },
  ) {
    super(message, { cause: options?.cause });
    this.name = "SpotifyError";
    this.status = status;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

const mapSpotifyError = (
  error: SpotifyError,
): { message: string; status: ContentfulStatusCode } => {
  switch (error.status) {
    case 401:
      return { message: "Spotify authorization failed. Please sign in again.", status: 401 };
    case 403:
      return { message: "Spotify denied access to this resource.", status: 403 };
    case 404:
      return { message: "Spotify resource not found.", status: 404 };
    case 429:
      return { message: "Spotify rate limit reached. Please try again later.", status: 429 };
    case 504:
      return { message: "Spotify request timed out.", status: 504 };
    default:
      return { message: "Spotify request failed.", status: 502 };
  }
};

export const onSpotifyError = (error: SpotifyError, context: Context) => {
  const request = getSharedErrorRequest(context);

  const mapped = mapSpotifyError(error);
  const fields = {
    ...request,
    upstreamStatus: error.status,
    error: error.status >= 500 ? serializeError(error) : error.message,
  };

  if (error.status >= 500) {
    logError("spotify_request_failed", fields);
  } else {
    logWarn("spotify_request_failed", fields);
  }

  if (error.retryAfterSeconds !== undefined) {
    context.header("Retry-After", String(error.retryAfterSeconds));
  }

  return context.json({ message: mapped.message, requestId: request.requestId }, mapped.status);
};
