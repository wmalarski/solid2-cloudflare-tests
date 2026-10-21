import { dbMiddleware } from "~/integrations/drizzle/middleware";
import { factory } from "./factory";
import { authMiddleware, sessionMiddleware } from "~/integrations/better-auth/middleware";
import { albumsRoute } from "~/modules/dashboard/routes/albums";
import { artistsRoute } from "~/modules/dashboard/routes/artists";
import { playerRoute } from "~/modules/dashboard/routes/player";
import { tasksRoute } from "~/modules/dashboard/routes/tasks";
import { envMiddleware } from "./env/middleware";
import { SpotifyError, onSpotifyError } from "~/integrations/spotify/errors";
import { onEnvValidationError, EnvValidationError } from "./env/errors";
import { onErrorFallback } from "./errors";
import { requestLogger } from "./request-logger";

const app = factory.createApp();

const routes = app
  .use("*", requestLogger)
  .use("/api/*", envMiddleware, dbMiddleware, authMiddleware)
  .all("/api/auth/*", async (context) => {
    const auth = context.get("auth");
    return auth.handler(context.req.raw);
  })
  .use("/api/*", sessionMiddleware)
  .route("/api/albums", albumsRoute)
  .route("/api/artists", artistsRoute)
  .route("/api/player", playerRoute)
  .route("/api/tasks", tasksRoute)
  .notFound((context) => {
    if (context.req.path.startsWith("/api/")) {
      return context.json({ message: "Not found", requestId: context.get("requestId") }, 404);
    }
    return context.env.ASSETS.fetch(context.req.raw);
  })
  .onError((error, context) => {
    switch (true) {
      case error instanceof EnvValidationError:
        return onEnvValidationError(error, context);
      case error instanceof SpotifyError:
        return onSpotifyError(error, context);
      default:
        return onErrorFallback(error, context);
    }
  });

export default routes;

export type AppType = typeof routes;
