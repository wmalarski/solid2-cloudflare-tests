import { factory } from "~/worker/factory";
import { initBetterAuth } from "./init";

export const betterAuthMiddleware = factory.createMiddleware(async (context, next) => {
  const db = context.get("db");

  const auth = initBetterAuth({ env: context.env, db });
  context.set("auth", auth);

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
  const session = context.get("session");
  const auth = context.get("auth");

  try {
    const accessToken = await auth.api.getAccessToken({
      headers: context.req.raw.headers,
      body: { providerId: "spotify", userId: session?.userId },
    });
    context.set("accessTokens", accessToken);
  } catch (error) {
    console.log("[EEERRROR]", error);
    return next();
  }

  return next();
});
