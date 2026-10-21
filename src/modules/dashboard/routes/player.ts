import { accessTokenMiddleware, authorizedMiddleware } from "~/integrations/better-auth/middleware";
import {
  getSpotifyCurrentlyPlayingTrack,
  startResumeCurrentPlayer,
} from "~/integrations/spotify/fetch";
import { spotifyContextUriSchema } from "~/integrations/spotify/validation";
import { factory } from "~/worker/factory";
import { spotifyPlayerRateLimit } from "./rate-limit";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";

const startResumeSchema = v.object({
  contextUri: spotifyContextUriSchema,
});

export const playerRoute = factory
  .createApp()
  .use(authorizedMiddleware, accessTokenMiddleware, spotifyPlayerRateLimit)
  .get("/currently-playing", async (context) => {
    const accessTokens = context.get("accessTokens");
    const response = await getSpotifyCurrentlyPlayingTrack({ accessTokens });
    return context.json(response);
  })
  .put("/start-resume", sValidator("json", startResumeSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const json = context.req.valid("json");
    await startResumeCurrentPlayer({ accessTokens, contextUri: json.contextUri });
    return context.json({});
  });
