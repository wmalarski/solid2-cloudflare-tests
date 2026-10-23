import type { PlaybackState, SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import {
  STATUS_IN_PROGRESS,
  STATUS_NEW,
  STATUS_REVIEWED,
} from "~/modules/dashboard/primitives/constansts";
import {
  createImages,
  createSimplifiedAlbum,
  createSimplifiedArtist,
  createTaskFromAlbum,
  type MockTask,
} from "../../modules/dashboard/tests/fixtures";

/**
 * A tiny in-memory stand-in for the Worker's D1 database. Handlers read and
 * mutate it so mutations (insert/update/delete) are visible to the follow-up
 * `GET` the UI makes when it refreshes a column.
 */
export type MockDb = {
  albums: SimplifiedAlbum[];
  currentlyPlaying: PlaybackState | null;
  tasks: MockTask[];
};

const createAlbum = (id: string, name: string, seed: string): SimplifiedAlbum => {
  return createSimplifiedAlbum({
    artists: [createSimplifiedArtist({ id: "artist-radiohead", name: "Radiohead" })],
    external_urls: { spotify: `https://open.spotify.com/album/${id}` },
    id,
    images: createImages(seed),
    name,
    uri: `spotify:album:${id}`,
  });
};

/** The default "happy path" dataset every test starts from. */
const createSeed = (): MockDb => {
  const inRainbows = createAlbum("album-in-rainbows", "In Rainbows", "in-rainbows");
  const kidA = createAlbum("album-kid-a", "Kid A", "kid-a");
  const amnesiac = createAlbum("album-amnesiac", "Amnesiac", "amnesiac");

  return {
    albums: [inRainbows, kidA, amnesiac],
    currentlyPlaying: null,
    tasks: [
      createTaskFromAlbum(inRainbows, { id: "task-in-rainbows", status: STATUS_NEW }),
      createTaskFromAlbum(kidA, { id: "task-kid-a", status: STATUS_IN_PROGRESS }),
      createTaskFromAlbum(amnesiac, { id: "task-amnesiac", status: STATUS_REVIEWED }),
    ],
  };
};

let db: MockDb = createSeed();

/** Mutable handle used by request handlers. */
export const getMockDb = (): MockDb => {
  return db;
};

/** Restores the default dataset. Called after every test. */
export const resetMockDb = (): void => {
  db = createSeed();
};

/**
 * Replaces the dataset for a single test. Pass only the parts you care about;
 * everything else keeps the default seed.
 */
export const seedMockDb = (partial: Partial<MockDb>): MockDb => {
  db = { ...createSeed(), ...partial };
  return db;
};
