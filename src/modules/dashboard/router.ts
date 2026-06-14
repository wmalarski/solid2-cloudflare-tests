import { authorizedMiddleware } from "~/integrations/better-auth/middleware";
import {
  getSpotifyAlbum,
  getSpotifyAlbums,
  getSpotifyArtist,
  getSpotifyArtistAlbums,
  getSpotifyArtists,
  getSpotifyCurrentlyPlayingTrack,
  getSpotifyRelatedArtists,
} from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

const albumIdSchema = v.object({ albumId: v.string() });
const albumIdsSchema = v.object({ albumIds: v.array(v.string()) });
const artistIdSchema = v.object({ artistId: v.string() });
const artistIdsSchema = v.object({ artistIds: v.array(v.string()) });

export const dashboardApp = factory
  .createApp()
  .use(authorizedMiddleware)
  .get("/album/:albumId", sValidator("param", albumIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const albumId = context.req.valid("param").albumId;
    const response = await getSpotifyAlbum({ albumId, session });
    return context.json(response);
  })
  .get("/albums", sValidator("query", albumIdsSchema), async (context) => {
    const session = context.get("authorizedSession");
    const albumIds = context.req.valid("query").albumIds;
    const response = await getSpotifyAlbums({ albumIds, session });
    return context.json(response);
  })
  .get("/artists/:artistId", sValidator("param", artistIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyArtist({ artistId, session });
    return context.json(response);
  })
  .get("/artists", sValidator("query", artistIdsSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistIds = context.req.valid("query").artistIds;
    const response = await getSpotifyArtists({ artistIds, session });
    return context.json(response);
  })
  .get("/artists/:artistId/albums", sValidator("param", artistIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyArtistAlbums({ artistId, session });
    return context.json(response);
  })
  .get("/artists/:artistId/related", sValidator("param", artistIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const artistId = context.req.valid("param").artistId;
    const response = await getSpotifyRelatedArtists({ artistId, session });
    return context.json(response);
  })
  .get("/currently-playing", async (context) => {
    const session = context.get("authorizedSession");
    const response = await getSpotifyCurrentlyPlayingTrack({ session });
    return context.json(response);
  });
