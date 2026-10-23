import type { task } from "~/integrations/drizzle/schema";
import type { TaskStatus } from "./primitives/validation";

type TaskRow = typeof task.$inferSelect;

/**
 * The wire shape of a task. JSON cannot carry `Date`, so timestamps are
 * serialized here instead of relying on `c.json()` to stringify Drizzle rows.
 * `userId` is intentionally not exposed to the client.
 */
export type TaskDto = Omit<
  TaskRow,
  "createdAt" | "doneAt" | "releaseDate" | "updatedAt" | "userId"
> & {
  createdAt: string | null;
  doneAt: string | null;
  releaseDate: string | null;
  updatedAt: string | null;
  status: TaskStatus;
};

export const toTaskDto = (row: TaskRow): TaskDto => ({
  createdAt: row.createdAt?.toISOString() ?? null,
  doneAt: row.doneAt?.toISOString() ?? null,
  id: row.id,
  note: row.note,
  preview: row.preview,
  rate: row.rate,
  releaseDate: row.releaseDate?.toISOString() ?? null,
  spotifyArtists: row.spotifyArtists,
  spotifyId: row.spotifyId,
  spotifyUri: row.spotifyUri,
  status: row.status as TaskStatus,
  title: row.title,
  updatedAt: row.updatedAt?.toISOString() ?? null,
  url: row.url,
});

/**
 * One page of a board column. The client needs `hasNext` up front so the
 * column can disable its "next page" control without probing for an empty
 * page first.
 */
export type TasksPageDto = {
  hasNext: boolean;
  items: TaskDto[];
};
