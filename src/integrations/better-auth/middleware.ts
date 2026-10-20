import { and, eq } from "drizzle-orm";
import { factory } from "~/worker/factory";
import { account } from "~/integrations/drizzle/schema";
import { initBetterAuth } from "./init";

export const authMiddleware = factory.createMiddleware(async (context, next) => {
  const db = context.get("db");

  context.set("auth", initBetterAuth({ env: context.env, db }));

  return next();
});

export const sessionMiddleware = factory.createMiddleware(async (context, next) => {
  const auth = context.get("auth");

  try {
    const response = await auth.api.getSession({ headers: context.req.raw.headers });

    const session = response?.session ?? null;
    const user = response?.user ?? null;

    context.set("session", session);
    context.set("user", user);
  } catch {
    //
  }

  return next();
});

export const authorizedMiddleware = factory.createMiddleware(async (context, next) => {
  const session = context.get("session");
  const auth = context.get("auth");

  if (!auth || !session) {
    return context.text("Unauthorized", 401);
  }

  context.set("authorizedSession", session);

  return next();
});

export const accessTokenMiddleware = factory.createMiddleware(async (context, next) => {
  const db = context.get("db");
  const session = context.get("session");
  const auth = context.get("auth");

  if (!auth || !session) {
    return context.text("Unauthorized", 401);
  }

  // `/get-access-token` needs an explicit account. `useAccountCookie` only
  // works when `account.storeAccountCookie` is enabled, which is off whenever
  // a database adapter is configured (the default for this app).
  const linkedAccount = await db.query.account.findFirst({
    columns: { id: true },
    where: and(eq(account.userId, session.userId), eq(account.providerId, "spotify")),
  });

  if (!linkedAccount) {
    return context.json({ message: "Spotify account is not linked" }, 403);
  }

  const accessToken = await auth.api.getAccessToken({
    headers: context.req.raw.headers,
    body: { accountId: linkedAccount.id },
  });

  context.set("accessTokens", accessToken);

  return next();
});
