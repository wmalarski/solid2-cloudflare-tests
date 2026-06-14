import { dbMiddleware } from "~/integrations/drizzle/middleware";
import { factory } from "./factory";
import { betterAuthMiddleware } from "~/integrations/better-auth/middleware";
import { cors } from "hono/cors";

const app = factory.createApp();

app.use(
  "/api/*",
  cors({
    origin: "http://127.0.0.1:5173", // replace with your origin
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
  dbMiddleware,
  betterAuthMiddleware,
);

app.on(["POST", "GET"], "/api/auth/*", async (context) => {
  console.log("[context]", context.req.url);
  const auth = context.get("auth");
  const response = await auth.handler(context.req.raw);
  console.log("[response]", response);
  return response;
});

app.get("*", (context) => context.env.ASSETS.fetch(context.req.raw));

export default app;

export type AppType = typeof app;
