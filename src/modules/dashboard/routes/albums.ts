import { accessTokenMiddleware, authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyAlbum, getSpotifyAlbums } from "~/integrations/spotify/fetch";
import { spotifyIdSchema, spotifyIdsQuerySchema } from "~/integrations/spotify/validation";
import { factory } from "~/worker/factory";
import { spotifyReadRateLimit } from "./rate-limit";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

const albumIdSchema = v.object({ albumId: spotifyIdSchema });
const albumIdsSchema = v.object({ albumIds: spotifyIdsQuerySchema });

export const albumsRoute = factory
  .createApp()
  .use(authorizedMiddleware, accessTokenMiddleware, spotifyReadRateLimit)
  .get("/", sValidator("query", albumIdsSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const albumIds = context.req.valid("query").albumIds;
    const response = await getSpotifyAlbums({ albumIds, accessTokens });
    return context.json(response);
  })
  .get("/:albumId", sValidator("param", albumIdSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const albumId = context.req.valid("param").albumId;
    const response = await getSpotifyAlbum({ albumId, accessTokens });
    return context.json(response);
  });
