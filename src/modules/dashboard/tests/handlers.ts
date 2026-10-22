import { HttpResponse, http } from "msw/http";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { STATUS_REVIEWED, TASKS_PAGE_SIZE } from "~/modules/dashboard/constansts";
import type { TaskStatus } from "~/modules/dashboard/validation";
import { getMockDb } from "~/testing/msw/db";
import {
  createArtist,
  createPage,
  createSimplifiedAlbum,
  createTaskFromAlbum,
  type MockTask,
} from "./fixtures";

const now = () => new Date().toISOString();

const asStringList = (value: string | null): string[] =>
  value ? value.split(",").filter(Boolean) : [];

/** MSW types path params as `string | string[] | undefined`; these routes are single-segment. */
const pathParam = (value: string | readonly string[] | undefined): string => String(value ?? "");

const findAlbum = (albumId: string): SimplifiedAlbum =>
  getMockDb().albums.find((album) => album.id === albumId) ??
  createSimplifiedAlbum({
    external_urls: { spotify: `https://open.spotify.com/album/${albumId}` },
    id: albumId,
    images: createSimplifiedAlbum().images,
    name: `Album ${albumId}`,
    uri: `spotify:album:${albumId}`,
  });

const createArtistFor = (artistId: string) =>
  createArtist({
    external_urls: { spotify: `https://open.spotify.com/artist/${artistId}` },
    href: `https://api.spotify.com/v1/artists/${artistId}`,
    id: artistId,
    name: `Artist ${artistId}`,
    uri: `spotify:artist:${artistId}`,
  });

// --- Tasks ---------------------------------------------------------------

const getTasks = () =>
  http.get("/api/tasks", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") as TaskStatus | null;
    const page = Number(url.searchParams.get("page") ?? 0);

    const tasks = getMockDb().tasks.filter((task) => !status || task.status === status);
    const start = page * TASKS_PAGE_SIZE;

    return HttpResponse.json({
      hasNext: start + TASKS_PAGE_SIZE < tasks.length,
      items: tasks.slice(start, start + TASKS_PAGE_SIZE),
    });
  });

const insertTask = () =>
  http.post("/api/tasks", async ({ request }) => {
    const json = (await request.json()) as {
      albumId: string;
      taskId: string;
      note?: string;
      rate?: number;
      status: TaskStatus;
    };

    const task: MockTask = createTaskFromAlbum(findAlbum(json.albumId), {
      createdAt: now(),
      id: json.taskId,
      note: json.note ?? null,
      rate: json.rate ?? null,
      status: json.status,
      updatedAt: now(),
    });

    getMockDb().tasks.push(task);

    return HttpResponse.json(task, { status: 201 });
  });

const updateTask = () =>
  http.put("/api/tasks/:taskId", async ({ params, request }) => {
    const json = (await request.json()) as {
      note?: string;
      rate?: number;
      status?: TaskStatus;
    };

    const task = getMockDb().tasks.find((candidate) => candidate.id === params.taskId);
    if (!task) {
      return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (json.note !== undefined) task.note = json.note;
    if (json.rate !== undefined) task.rate = json.rate;
    if (json.status !== undefined) {
      task.status = json.status;
      task.doneAt = json.status === STATUS_REVIEWED ? (task.doneAt ?? now()) : null;
    }
    task.updatedAt = now();

    return HttpResponse.json(task);
  });

const removeTask = () =>
  http.delete("/api/tasks/:taskId", ({ params }) => {
    const db = getMockDb();
    const index = db.tasks.findIndex((candidate) => candidate.id === params.taskId);

    if (index === -1) {
      return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    }

    db.tasks.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  });

// --- Albums --------------------------------------------------------------

const getAlbums = () =>
  http.get("/api/albums", ({ request }) => {
    const url = new URL(request.url);
    const albumIds = asStringList(url.searchParams.get("albumIds"));

    return HttpResponse.json(albumIds.map(findAlbum));
  });

const getAlbum = () =>
  http.get("/api/albums/:albumId", ({ params }) =>
    HttpResponse.json(findAlbum(pathParam(params.albumId))),
  );

// --- Artists -------------------------------------------------------------

const getRelatedArtists = () =>
  http.get("/api/artists/related", ({ request }) => {
    const url = new URL(request.url);
    const artistIds = asStringList(url.searchParams.get("artistIds"));

    return HttpResponse.json(
      artistIds.map((artistId) => ({
        albums: getMockDb().albums,
        artist: createArtistFor(artistId),
      })),
    );
  });

const getArtists = () =>
  http.get("/api/artists", ({ request }) => {
    const url = new URL(request.url);
    const artistIds = asStringList(url.searchParams.get("artistIds"));

    return HttpResponse.json(artistIds.map(createArtistFor));
  });

const getArtistAlbums = () =>
  http.get("/api/artists/:artistId/albums", () =>
    HttpResponse.json(createPage(getMockDb().albums)),
  );

const getArtistRelatedArtists = () =>
  http.get("/api/artists/:artistId/related", () =>
    HttpResponse.json({ artists: [createArtistFor("artist-related")] }),
  );

const getArtist = () =>
  http.get("/api/artists/:artistId", ({ params }) =>
    HttpResponse.json(createArtistFor(pathParam(params.artistId))),
  );

// --- Player --------------------------------------------------------------

const getCurrentlyPlaying = () =>
  http.get("/api/player/currently-playing", () => HttpResponse.json(getMockDb().currentlyPlaying));

const startResumePlayer = () => http.put("/api/player/start-resume", () => HttpResponse.json({}));

/**
 * Default, happy-path handlers for the Hono (`/api/*`) layer.
 *
 * Requests hit the relative URLs built by the `hc` client, so paths are
 * prefix-less (`/api/tasks`) rather than absolute.
 *
 * Ordering note: MSW returns the first matching handler, so the literal
 * `/api/artists/related` must be registered before `/api/artists/:artistId`.
 */
export const dashboardHandlers = [
  // Tasks
  getTasks(),
  insertTask(),
  updateTask(),
  removeTask(),

  // Albums
  getAlbums(),
  getAlbum(),

  // Artists (literal `/related` before the `:artistId` wildcard)
  getRelatedArtists(),
  getArtists(),
  getArtistAlbums(),
  getArtistRelatedArtists(),
  getArtist(),

  // Player
  getCurrentlyPlaying(),
  startResumePlayer(),
];
