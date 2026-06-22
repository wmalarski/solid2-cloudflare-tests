import { accessTokenMiddleware, authorizedMiddleware } from "~/integrations/better-auth/middleware";
import {
  getSpotifyCurrentlyPlayingTrack,
  startResumeCurrentPlayer,
} from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";

const startResumeSchema = v.object({
  contextUri: v.string(),
});

export const playerRoute = factory
  .createApp()
  .use(authorizedMiddleware, accessTokenMiddleware)
  .get("/currently-playing", async (context) => {
    const accessTokens = context.get("accessTokens");
    const response = await getSpotifyCurrentlyPlayingTrack({ accessTokens });
    return context.json(response);
  })
  .put("/start-resume", sValidator("json", startResumeSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const json = context.req.valid("json");
    const contextUri = json.contextUri;
    await startResumeCurrentPlayer({ accessTokens, contextUri });
    return context.json({});
  });
