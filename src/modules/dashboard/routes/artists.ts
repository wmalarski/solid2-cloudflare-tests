import { accessTokenMiddleware, authorizedMiddleware } from "~/integrations/better-auth/middleware";
import {
  getSpotifyArtist,
  getSpotifyArtistAlbums,
  getSpotifyArtists,
  getSpotifyRelatedAlbums,
  getSpotifyRelatedArtists,
} from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

const artistIdSchema = v.object({ artistId: v.string() });
const artistIdsSchema = v.object({
  artistIds: v.pipe(
    v.string(),
    v.transform((value) => value.split(",")),
  ),
});

export const artistsRoute = factory
  .createApp()
  .use(authorizedMiddleware, accessTokenMiddleware)
  .get("/", sValidator("query", artistIdsSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const artistIds = context.req.valid("query").artistIds;
    const response = await getSpotifyArtists({ artistIds, accessTokens });
    return context.json(response);
  })
  .get("/related", sValidator("query", artistIdsSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const artistIds = context.req.valid("query").artistIds;
    const response = await getSpotifyRelatedAlbums({ artistIds, accessTokens });
    return context.json(response);
  })
  .get("/:artistId", sValidator("param", artistIdSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyArtist({ artistId, accessTokens });
    return context.json(response);
  })
  .get("/:artistId/albums", sValidator("param", artistIdSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyArtistAlbums({ artistId, accessTokens });
    return context.json(response);
  })
  .get("/:artistId/related", sValidator("param", artistIdSchema), async (context) => {
    const accessTokens = context.get("accessTokens");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyRelatedArtists({ artistId, accessTokens });
    return context.json(response);
  });
