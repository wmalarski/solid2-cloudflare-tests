import { authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyCurrentlyPlayingTrack } from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";

export const playerRoute = factory
  .createApp()
  .use(authorizedMiddleware)
  .get("/currently-playing", async (context) => {
    const session = context.get("authorizedSession");
    const response = await getSpotifyCurrentlyPlayingTrack({ session });
    return context.json(response);
  });
