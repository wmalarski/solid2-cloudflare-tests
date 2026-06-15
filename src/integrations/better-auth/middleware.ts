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
  const user = context.get("user");
  const auth = context.get("auth");

  if (!auth || !session || !user) {
    return context.text("Unauthorized", 401);
  }

  try {
    const accessToken = await auth.api.getAccessToken({
      headers: context.req.raw.headers,
      body: { providerId: "spotify", userId: session.userId },
    });
    context.set("accessToken", accessToken.accessToken);
    console.log("[accessToken]", accessToken);
  } catch (error) {
    console.log("[access-token-ERROR]", error);
  }

  // context.set("accessToken", accessToken.accessToken);
  context.set("authorizedSession", session);

  return next();
});
