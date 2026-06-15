import { accessTokenMiddleware, authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyCurrentlyPlayingTrack } from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";

export const playerRoute = factory
  .createApp()
  .use(authorizedMiddleware, accessTokenMiddleware)
  .get("/currently-playing", async (context) => {
    const accessTokens = context.get("accessTokens");
    const response = await getSpotifyCurrentlyPlayingTrack({ accessTokens });
    return context.json(response);
  });
