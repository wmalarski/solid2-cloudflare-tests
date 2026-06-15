import { authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyCurrentlyPlayingTrack } from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";

export const playerRoute = factory
  .createApp()
  .use(authorizedMiddleware)
  .get("/currently-playing", async (context) => {
    const session = context.get("authorizedSession");
    const accessToken = context.get("accessToken");
    const response = await getSpotifyCurrentlyPlayingTrack({ session, accessToken });
    return context.json(response);
  });
