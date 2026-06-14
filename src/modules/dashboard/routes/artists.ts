import { authorizedMiddleware } from "~/integrations/better-auth/middleware";
import {
  getSpotifyArtist,
  getSpotifyArtistAlbums,
  getSpotifyArtists,
  getSpotifyRelatedArtists,
} from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

const artistIdSchema = v.object({ artistId: v.string() });
const artistIdsSchema = v.object({ artistIds: v.array(v.string()) });

export const artistsRouter = factory
  .createApp()
  .use(authorizedMiddleware)
  .get("/:artistId", sValidator("param", artistIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyArtist({ artistId, session });
    return context.json(response);
  })
  .get("/", sValidator("query", artistIdsSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistIds = context.req.valid("query").artistIds;
    const response = await getSpotifyArtists({ artistIds, session });
    return context.json(response);
  })
  .get("/:artistId/albums", sValidator("param", artistIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyArtistAlbums({ artistId, session });
    return context.json(response);
  })
  .get("/:artistId/related", sValidator("param", artistIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyRelatedArtists({ artistId, session });
    return context.json(response);
  });
