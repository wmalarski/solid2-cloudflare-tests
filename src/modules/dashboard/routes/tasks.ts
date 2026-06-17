import { factory } from "~/worker/factory";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import { accessTokenMiddleware, authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyAlbum } from "~/integrations/spotify/fetch";
import { schema } from "~/integrations/drizzle/schema";
import { STATUS_IN_PROGRESS, STATUS_REVIEWED } from "../constansts";
import { and, eq } from "drizzle-orm";
import { taskStatusSchema } from "../validation";

export const SELECT_TASKS_DEFAULT_LIMIT = 10;

const taskIdSchema = v.object({ taskId: v.string() });

const insertTaskSchema = v.object({
  albumId: v.string(),
  note: v.optional(v.string()),
  rate: v.optional(v.number()),
});

const updateTaskSchema = v.object({
  note: v.optional(v.string()),
  rate: v.optional(v.number()),
  status: taskStatusSchema,
});

const selectTasksSchema = v.object({
  page: v.optional(v.number()),
  status: taskStatusSchema,
});

export const tasksRoute = factory
  .createApp()
  .use(authorizedMiddleware, accessTokenMiddleware)
  .post("/", sValidator("json", insertTaskSchema), async (context) => {
    const session = context.get("authorizedSession");
    const accessTokens = context.get("accessTokens");
    const json = context.req.valid("json");
    const db = context.get("db");

    const album = await getSpotifyAlbum({ albumId: json.albumId, accessTokens });

    if (!album) {
      return context.status(400);
    }

    const taskId = crypto.randomUUID();

    const response = await db.insert(schema.task).values({
      id: taskId,
      spotifyArtists: JSON.stringify(album.artists),
      spotifyId: album.id,
      status: json.note && json.rate !== undefined ? STATUS_REVIEWED : STATUS_IN_PROGRESS,
      title: album.name,
      userId: session.userId,
      preview: JSON.stringify(album.images),
      url: album.external_urls.spotify,
      releaseDate: new Date(album.release_date),
      note: json.note,
      rate: json.rate,
    });

    return context.json(response.results);
  })
  .put(
    "/:taskId",
    sValidator("param", taskIdSchema),
    sValidator("json", updateTaskSchema),
    async (context) => {
      const session = context.get("authorizedSession");
      const taskId = context.req.valid("param").taskId;
      const json = context.req.valid("json");
      const db = context.get("db");

      const response = await db
        .update(schema.task)
        .set(json)
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
      .offset(SELECT_TASKS_DEFAULT_LIMIT * (query.page ?? 0));

    return context.json(response);
  });
