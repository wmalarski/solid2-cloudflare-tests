import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { factory } from "~/worker/factory";
import { account } from "~/integrations/drizzle/schema";
import { logError, logWarn, serializeError } from "~/integrations/logger";
import { initBetterAuth } from "./init";

export const authMiddleware = factory.createMiddleware(async (context, next) => {
  const db = context.get("db");
  const config = context.get("config");

  context.set("auth", initBetterAuth({ config, db }));

  return next();
});

export const sessionMiddleware = factory.createMiddleware(async (context, next) => {
  const auth = context.get("auth");

  try {
    const response = await auth.api.getSession({ headers: context.req.raw.headers });

    context.set("session", response?.session ?? null);
    context.set("user", response?.user ?? null);
  } catch (error) {
    logError("session_lookup_failed", {
      requestId: context.get("requestId"),
      error: serializeError(error),
    });

    throw error;
  }

  return next();
});

export const authorizedMiddleware = factory.createMiddleware(async (context, next) => {
  const session = context.get("session");

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  context.set("authorizedSession", session);

  return next();
});

export const accessTokenMiddleware = factory.createMiddleware(async (context, next) => {
  const db = context.get("db");
  const session = context.get("session");
  const auth = context.get("auth");

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const linkedAccount = await db.query.account.findFirst({
    columns: { id: true },
    where: and(eq(account.userId, session.userId), eq(account.providerId, "spotify")),
  });

  if (!linkedAccount) {
    throw new HTTPException(403, { message: "Spotify account is not linked" });
  }

  try {
    const accessToken = await auth.api.getAccessToken({
      headers: context.req.raw.headers,
      body: { accountId: linkedAccount.id },
    });

    context.set("accessTokens", accessToken);
  } catch (error) {
    logWarn("spotify_access_token_failed", {
      requestId: context.get("requestId"),
      error: serializeError(error),
    });

    const status = (error as { status?: number }).status;

    // A 5xx here is a better-auth/D1 failure, not an expired Spotify grant.
    if (typeof status === "number" && status >= 500) {
      throw error;
    }

    throw new HTTPException(401, {
      message: "Spotify authorization expired. Please sign in again.",
    });
  }

  return next();
});
