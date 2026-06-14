import { authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyAlbum, getSpotifyAlbums } from "~/integrations/spotify/fetch";
import { factory } from "~/worker/factory";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

const albumIdSchema = v.object({ albumId: v.string() });
const albumIdsSchema = v.object({ albumIds: v.array(v.string()) });

export const albumsRoute = factory
  .createApp()
  .use(authorizedMiddleware)
  .get("/", sValidator("query", albumIdsSchema), async (context) => {
    const session = context.get("authorizedSession");
    const albumIds = context.req.valid("query").albumIds;
    const response = await getSpotifyAlbums({ albumIds, session });
    return context.json(response);
  })
  .get("/:albumId", sValidator("param", albumIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const albumId = context.req.valid("param").albumId;
    const response = await getSpotifyAlbum({ albumId, session });
    return context.json(response);
  });
