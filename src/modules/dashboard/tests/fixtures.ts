import type {
  Artist,
  Image,
  Page,
  PlaybackState,
  SimplifiedAlbum,
  SimplifiedArtist,
  SimplifiedTrack,
  Track,
} from "@spotify/web-api-ts-sdk";
import type { TaskStatus } from "~/modules/dashboard/validation";
import { STATUS_NEW } from "~/modules/dashboard/constansts";

/**
 * A `task` row as it crosses the wire: the Worker serialises Drizzle's
 * `Date` columns to ISO strings, so timestamps are `string | null` here.
 */
export type MockTask = {
  createdAt: string | null;
  doneAt: string | null;
  id: string;
  note: string | null;
  preview: string;
  rate: number | null;
  releaseDate: string | null;
  spotifyArtists: string;
  spotifyId: string;
  spotifyUri: string;
  status: TaskStatus;
  title: string;
  updatedAt: string | null;
  url: string | null;
  userId: string;
};

/**
 * Inline SVG as a `data:` URI. Keeps fixtures (and therefore screenshots)
 * offline and deterministic: no external image request is ever made.
 */
export const imageDataUri = (color: string, label = "cover", size = 300): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="${Math.round(size / 8)}" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const createImage = (overrides: Partial<Image> = {}): Image => ({
  height: 300,
  url: imageDataUri("#1db954", "cover"),
  width: 300,
  ...overrides,
});

/** Spotify returns the same cover at 64/300/640px; several components look up by height. */
export const createImages = (seed = "cover"): Image[] => [
  createImage({ height: 64, url: imageDataUri("#1db954", seed, 64), width: 64 }),
  createImage({ height: 300, url: imageDataUri("#1db954", seed, 300), width: 300 }),
  createImage({ height: 640, url: imageDataUri("#1db954", seed, 640), width: 640 }),
];

export const createSimplifiedArtist = (
  overrides: Partial<SimplifiedArtist> = {},
): SimplifiedArtist => ({
  external_urls: { spotify: "https://open.spotify.com/artist/artist-1" },
  href: "https://api.spotify.com/v1/artists/artist-1",
  id: "artist-1",
  name: "Radiohead",
  type: "artist",
  uri: "spotify:artist:artist-1",
  ...overrides,
});

export const createArtist = (overrides: Partial<Artist> = {}): Artist => ({
  ...createSimplifiedArtist(),
  followers: { href: null, total: 1_000_000 },
  genres: ["art rock"],
  images: createImages("artist"),
  popularity: 80,
  ...overrides,
});

export const createSimplifiedAlbum = (
  overrides: Partial<SimplifiedAlbum> = {},
): SimplifiedAlbum => ({
  album_group: "album",
  album_type: "album",
  artists: [createSimplifiedArtist()],
  available_markets: ["US"],
  copyrights: [{ text: "2007 XL Recordings", type: "C" }],
  external_ids: { ean: "", isrc: "", upc: "634904032362" },
  external_urls: { spotify: "https://open.spotify.com/album/album-1" },
  genres: ["art rock"],
  href: "https://api.spotify.com/v1/albums/album-1",
  id: "album-1",
  images: createImages("album-1"),
  label: "XL Recordings",
  name: "In Rainbows",
  popularity: 90,
  release_date: "2007-10-10",
  release_date_precision: "day",
  total_tracks: 10,
  type: "album",
  uri: "spotify:album:album-1",
  ...overrides,
});

export const createSimplifiedTrack = (
  overrides: Partial<SimplifiedTrack> = {},
): SimplifiedTrack => ({
  artists: [createSimplifiedArtist()],
  available_markets: ["US"],
  disc_number: 1,
  duration_ms: 240_000,
  episode: false,
  explicit: false,
  external_urls: { spotify: "https://open.spotify.com/track/track-1" },
  href: "https://api.spotify.com/v1/tracks/track-1",
  id: "track-1",
  is_local: false,
  name: "Nude",
  preview_url: null,
  track: true,
  track_number: 3,
  type: "track",
  uri: "spotify:track:track-1",
  ...overrides,
});

export const createTrack = (overrides: Partial<Track> = {}): Track => ({
  ...createSimplifiedTrack(),
  album: createSimplifiedAlbum(),
  external_ids: { ean: "", isrc: "GBAYE0700535", upc: "" },
  popularity: 80,
  ...overrides,
});

export const createPage = <T>(items: T[], overrides: Partial<Page<T>> = {}): Page<T> => ({
  href: "https://api.spotify.com/v1/albums",
  items,
  limit: items.length,
  next: null,
  offset: 0,
  previous: null,
  total: items.length,
  ...overrides,
});

export const createPlaybackState = (overrides: Partial<PlaybackState> = {}): PlaybackState => ({
  actions: {},
  context: {
    external_urls: { spotify: "https://open.spotify.com/album/album-1" },
    href: "https://api.spotify.com/v1/albums/album-1",
    type: "album",
    uri: "spotify:album:album-1",
  },
  currently_playing_type: "track",
  device: {
    id: "device-1",
    is_active: true,
    is_private_session: false,
    is_restricted: false,
    name: "Browser",
    type: "Computer",
    volume_percent: 100,
  },
  is_playing: true,
  item: createTrack(),
  progress_ms: 30_000,
  repeat_state: "off",
  shuffle_state: false,
  timestamp: Date.parse("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

/**
 * Builds a task row from a Spotify album, mirroring what the Worker stores in
 * `POST /api/tasks` (artist/image JSON blobs live on the row).
 */
export const createTaskFromAlbum = (
  album: SimplifiedAlbum,
  overrides: Partial<MockTask> = {},
): MockTask => ({
  createdAt: "2026-01-01T00:00:00.000Z",
  doneAt: null,
  id: `task-${album.id}`,
  note: null,
  preview: JSON.stringify(album.images),
  rate: null,
  releaseDate: album.release_date,
  spotifyArtists: JSON.stringify(album.artists),
  spotifyId: album.id,
  spotifyUri: album.uri,
  status: STATUS_NEW,
  title: album.name,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: album.external_urls.spotify,
  userId: "user-1",
  ...overrides,
});

export const createTask = (overrides: Partial<MockTask> = {}): MockTask =>
  createTaskFromAlbum(createSimplifiedAlbum(), overrides);
