import { factory } from "~/worker/factory";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import { authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyAlbum } from "~/integrations/spotify/fetch";
import { schema } from "~/integrations/drizzle/schema";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED, STATUS_REWATCH } from "../constansts";
import { and, eq } from "drizzle-orm";

export const SELECT_TASKS_DEFAULT_LIMIT = 10;

const taskIdSchema = v.object({ taskId: v.string() });

const bookmarkStatusSchema = v.union([
  v.literal(STATUS_NEW),
  v.literal(STATUS_IN_PROGRESS),
  v.literal(STATUS_REVIEWED),
  v.literal(STATUS_REWATCH),
]);

const insertTaskSchema = v.object({
  albumId: v.string(),
});

const updateTaskSchema = v.object({
  note: v.optional(v.string()),
  rate: v.optional(v.number()),
  status: bookmarkStatusSchema,
});

const selectTasksSchema = v.object({
  page: v.number(),
  status: bookmarkStatusSchema,
});

export const tasksRoute = factory
  .createApp()
  .use(authorizedMiddleware)
  .post("/", sValidator("form", insertTaskSchema), async (context) => {
    const session = context.get("authorizedSession");
    const albumId = context.req.valid("form").albumId;
    const album = await getSpotifyAlbum({ albumId, session });

    const db = context.get("db");
    const taskId = crypto.randomUUID();
    const artists = album.artists.map((artist) => artist.name).join(",");
    const response = await db.insert(schema.task).values({
      id: taskId,
      spotifyArtists: JSON.stringify(album.artists),
      spotifyId: album.id,
      status: "ready",
      title: album.name,
      userId: session.userId,
      preview: JSON.stringify(album.images),
      url: album.uri,
      text: `${artists} - ${album.release_date}`,
    });

    return context.json(response.results);
  })
  .put(
    "/:taskId",
    sValidator("param", taskIdSchema),
    sValidator("form", updateTaskSchema),
    async (context) => {
      const session = context.get("authorizedSession");
      const taskId = context.req.valid("param").taskId;
      const form = context.req.valid("form");
      const db = context.get("db");

      const response = await db
        .update(schema.task)
        .set(form)
        .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, session.userId)));

      return context.json(response.results);
    },
  )
  .delete("/:taskId", sValidator("param", taskIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const taskId = context.req.valid("param").taskId;
    const db = context.get("db");

    const response = await db
      .delete(schema.task)
      .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, session.userId)));

    return context.json(response.results);
  })
  .get("/", sValidator("query", selectTasksSchema), async (context) => {
    const session = context.get("authorizedSession");
    const query = context.req.valid("query");
    const db = context.get("db");

    const response = await db
      .select()
      .from(schema.task)
      .where(and(eq(schema.task.status, query.status), eq(schema.task.userId, session.userId)))
      .limit(SELECT_TASKS_DEFAULT_LIMIT)
      .offset(SELECT_TASKS_DEFAULT_LIMIT * query.page);

    return context.json(response);
  });
