import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";
import { factory } from "~/worker/factory";
import { accessTokenMiddleware, authorizedMiddleware } from "~/integrations/better-auth/middleware";
import { getSpotifyAlbum } from "~/integrations/spotify/fetch";
import { spotifyIdSchema } from "~/integrations/spotify/validation";
import { schema } from "~/integrations/drizzle/schema";
import { taskInsertRateLimit } from "./rate-limit";
import { STATUS_REVIEWED } from "../constansts";
import { toTaskDto } from "../task-dto";
import { taskStatusSchema } from "../validation";

export const SELECT_TASKS_DEFAULT_LIMIT = 10;

const taskIdSchema = v.object({ taskId: v.pipe(v.string(), v.minLength(1)) });

const taskFieldsSchema = {
  note: v.optional(v.pipe(v.string(), v.maxLength(2_000))),
  rate: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(10))),
  status: taskStatusSchema,
};

const insertTaskSchema = v.object({
  albumId: spotifyIdSchema,
  ...taskFieldsSchema,
});

const updateTaskSchema = v.object(taskFieldsSchema);

const selectTasksSchema = v.object({
  page: v.optional(v.number()),
  status: taskStatusSchema,
});

export const tasksRoute = factory
  .createApp()
  .use(authorizedMiddleware, accessTokenMiddleware)
  .post("/", taskInsertRateLimit, sValidator("json", insertTaskSchema), async (context) => {
    const session = context.get("authorizedSession");
    const accessTokens = context.get("accessTokens");
    const json = context.req.valid("json");
    const db = context.get("db");

    const album = await getSpotifyAlbum({ albumId: json.albumId, accessTokens });

    if (!album) {
      throw new HTTPException(404, { message: "Album not found" });
    }

    const now = new Date();
    const [created] = await db
      .insert(schema.task)
      .values({
        createdAt: now,
        id: crypto.randomUUID(),
        note: json.note,
        preview: JSON.stringify(album.images),
        rate: json.rate,
        releaseDate: new Date(album.release_date),
        spotifyArtists: JSON.stringify(album.artists),
        spotifyId: album.id,
        spotifyUri: album.uri,
        status: json.status,
        title: album.name,
        updatedAt: now,
        url: album.external_urls.spotify,
        userId: session.userId,
      })
      .onConflictDoNothing()
      .returning();

    if (!created) {
      throw new HTTPException(409, { message: "This album is already in your tasks" });
    }

    return context.json(toTaskDto(created), 201);
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

      const [existing] = await db
        .select()
        .from(schema.task)
        .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, session.userId)))
        .limit(1);

      if (!existing) {
        throw new HTTPException(404, { message: "Task not found" });
      }

      const [updated] = await db
        .update(schema.task)
        .set({
          doneAt: json.status === STATUS_REVIEWED ? (existing.doneAt ?? new Date()) : null,
          note: json.note,
          rate: json.rate,
          status: json.status,
          updatedAt: new Date(),
        })
        .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, session.userId)))
        .returning();

      if (!updated) {
        throw new HTTPException(404, { message: "Task not found" });
      }

      return context.json(toTaskDto(updated));
    },
  )
  .delete("/:taskId", sValidator("param", taskIdSchema), async (context) => {
    const session = context.get("authorizedSession");
    const taskId = context.req.valid("param").taskId;
    const db = context.get("db");

    const [deleted] = await db
      .delete(schema.task)
      .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, session.userId)))
      .returning({ id: schema.task.id });

    if (!deleted) {
      throw new HTTPException(404, { message: "Task not found" });
    }

    return context.body(null, 204);
  })
  .get("/", sValidator("query", selectTasksSchema), async (context) => {
    const session = context.get("authorizedSession");
    const query = context.req.valid("query");
    const db = context.get("db");

    const rows = await db
      .select()
      .from(schema.task)
      .where(and(eq(schema.task.status, query.status), eq(schema.task.userId, session.userId)))
      .limit(SELECT_TASKS_DEFAULT_LIMIT)
      .offset(SELECT_TASKS_DEFAULT_LIMIT * (query.page ?? 0));

    return context.json(rows.map(toTaskDto));
  });
