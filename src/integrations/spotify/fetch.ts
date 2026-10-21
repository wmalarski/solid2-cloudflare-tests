import { buildSearchParams } from "~/utils/search-params";
import {
  type Album,
  type Artist,
  type Artists,
  type Page,
  type PlaybackState,
  type SimplifiedAlbum,
} from "@spotify/web-api-ts-sdk";
import type { AccessTokens } from "../better-auth/init";
import { SpotifyError } from "./errors";

type FetchSpotifyArgs = {
  accessTokens: AccessTokens;
  cacheTtlSeconds?: number;
  init?: RequestInit;
  path: string;
  query?: Record<string, unknown>;
};

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
const SPOTIFY_TIMEOUT_MS = 8_000;
const SPOTIFY_MAX_ATTEMPTS = 3;
const SPOTIFY_MAX_RETRY_DELAY_MS = 2_000;
const SPOTIFY_DEFAULT_CACHE_TTL_SECONDS = 300;

/** Spotify's related-artists endpoint returns up to 20 artists; cap the fan-out. */
const MAX_RELATED_ARTISTS = 10;

const getCache = (): Cache | undefined => {
  try {
    const storage = (globalThis as typeof globalThis & { caches?: { default?: Cache } }).caches;

    return storage?.default;
  } catch {
    // The Cache API is not available in every runtime (e.g. plain Node tests).
    return undefined;
  }
};

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { error?: { message?: string } };

    return body.error?.message ?? response.statusText ?? "Spotify request failed";
  } catch {
    return response.statusText || "Spotify request failed";
  }
};

const parseRetryAfter = (response: Response): number | undefined => {
  const value = response.headers.get("retry-after");

  if (!value) {
    return undefined;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds);
  }

  const date = Date.parse(value);

  return Number.isNaN(date) ? undefined : Math.max(0, Math.ceil((date - Date.now()) / 1_000));
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status: number) => status === 429 || (status >= 500 && status !== 501);

/**
 * Builds a per-attempt timeout signal and forwards an optional caller signal
 * so a cancelled request also cancels the Spotify fetch.
 */
const createTimeoutSignal = (externalSignal?: AbortSignal) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SPOTIFY_TIMEOUT_MS);
  const onAbort = () => controller.abort(externalSignal?.reason);

  if (externalSignal) {
    if (externalSignal.aborted) {
      onAbort();
    } else {
      externalSignal.addEventListener("abort", onAbort, { once: true });
    }
  }

  return {
    cleanup: () => {
      clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", onAbort);
    },
    signal: controller.signal,
  };
};

export const fetchSpotify = async <T = unknown>({
  accessTokens,
  cacheTtlSeconds,
  init,
  path,
  query,
}: FetchSpotifyArgs): Promise<T | null> => {
  const searchParams = buildSearchParams(query);
  const suffix = searchParams.size > 0 ? `?${searchParams}` : "";
  const url = `${SPOTIFY_BASE_URL}${path}${suffix}`;
  const method = (init?.method ?? "GET").toUpperCase();
  const canCache = method === "GET" && (cacheTtlSeconds ?? 0) > 0;
  const cache = canCache ? getCache() : undefined;

  if (cache) {
    const cached = await cache.match(url);

    if (cached) {
      try {
        return (await cached.json()) as T;
      } catch {
        // A corrupt cache entry is a miss; fall through to the network.
      }
    }
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessTokens.accessToken}`);

  let lastError: unknown;

  for (let attempt = 0; attempt < SPOTIFY_MAX_ATTEMPTS; attempt += 1) {
    const { cleanup, signal } = createTimeoutSignal(init?.signal ?? undefined);
    let response: Response;

    try {
      response = await fetch(url, { ...init, headers, signal });
    } catch (error) {
      cleanup();
      lastError = error;

      if (attempt < SPOTIFY_MAX_ATTEMPTS - 1) {
        await sleep(200 * 2 ** attempt);
        continue;
      }

      const isTimeout =
        error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");

      throw new SpotifyError(
        isTimeout ? "Spotify request timed out" : "Unable to reach Spotify",
        isTimeout ? 504 : 502,
        { cause: error },
      );
    }

    cleanup();

    if (!response.ok) {
      const retryAfterSeconds = parseRetryAfter(response);
      const message = await readErrorMessage(response);

      if (isRetryableStatus(response.status) && attempt < SPOTIFY_MAX_ATTEMPTS - 1) {
        const delaySeconds = retryAfterSeconds ?? 0.2 * 2 ** attempt;
        const delayMs = Math.min(delaySeconds * 1_000, SPOTIFY_MAX_RETRY_DELAY_MS);

        await sleep(delayMs);
        continue;
      }

      throw new SpotifyError(message, response.status, { retryAfterSeconds });
    }

    if (response.status === 204) {
      return null;
    }

    let json: T;

    try {
      json = (await response.json()) as T;
    } catch (error) {
      throw new SpotifyError("Spotify returned an invalid response", 502, { cause: error });
    }

    if (cache) {
      const ttl = cacheTtlSeconds ?? SPOTIFY_DEFAULT_CACHE_TTL_SECONDS;

      try {
        await cache.put(
          url,
          new Response(JSON.stringify(json), {
            headers: {
              "cache-control": `public, max-age=${ttl}`,
              "content-type": "application/json",
            },
          }),
        );
      } catch {
        // Cache writes are best-effort; never fail a request because of them.
      }
    }

    return json;
  }

  throw lastError instanceof SpotifyError
    ? lastError
    : new SpotifyError("Spotify request failed", 502, { cause: lastError });
};

type WithAccessTokens<T = {}> = T & { accessTokens: AccessTokens };

type GetSpotifyAlbumArgs = WithAccessTokens<{
  albumId: string;
}>;

export const getSpotifyAlbum = ({ albumId, accessTokens }: GetSpotifyAlbumArgs) => {
  return fetchSpotify<Album>({
    accessTokens,
    cacheTtlSeconds: SPOTIFY_DEFAULT_CACHE_TTL_SECONDS,
    path: `/albums/${encodeURIComponent(albumId)}`,
  });
};

type GetSpotifyAlbumsArgs = WithAccessTokens<{
  albumIds: string[];
}>;

export const getSpotifyAlbums = ({ albumIds, accessTokens }: GetSpotifyAlbumsArgs) => {
  return fetchSpotify<Album[]>({
    accessTokens,
    cacheTtlSeconds: SPOTIFY_DEFAULT_CACHE_TTL_SECONDS,
    path: "/albums",
    query: { ids: albumIds.join(",") },
  });
};

type GetSpotifyArtistArgs = WithAccessTokens<{
  artistId: string;
}>;

export const getSpotifyArtist = ({ artistId, accessTokens }: GetSpotifyArtistArgs) => {
  return fetchSpotify<Artist>({
    accessTokens,
    cacheTtlSeconds: SPOTIFY_DEFAULT_CACHE_TTL_SECONDS,
    path: `/artists/${encodeURIComponent(artistId)}`,
  });
};

type GetSpotifyArtistsArgs = WithAccessTokens<{
  artistIds: string[];
}>;

export const getSpotifyArtists = ({ artistIds, accessTokens }: GetSpotifyArtistsArgs) => {
  return fetchSpotify<Artist[]>({
    accessTokens,
    cacheTtlSeconds: SPOTIFY_DEFAULT_CACHE_TTL_SECONDS,
    path: "/artists",
    query: { ids: artistIds.join(",") },
  });
};

type GetSpotifyArtistAlbumsArgs = WithAccessTokens<{
  artistId: string;
}>;

export const getSpotifyArtistAlbums = ({ artistId, accessTokens }: GetSpotifyArtistAlbumsArgs) => {
  return fetchSpotify<Page<SimplifiedAlbum>>({
    accessTokens,
    cacheTtlSeconds: 60,
    path: `/artists/${encodeURIComponent(artistId)}/albums`,
  });
};

type GetSpotifyRelatedArtistsArgs = WithAccessTokens<{
  artistId: string;
}>;

export const getSpotifyRelatedArtists = ({
  artistId,
  accessTokens,
}: GetSpotifyRelatedArtistsArgs) => {
  return fetchSpotify<Artists>({
    accessTokens,
    cacheTtlSeconds: SPOTIFY_DEFAULT_CACHE_TTL_SECONDS,
    path: `/artists/${encodeURIComponent(artistId)}/related-artists`,
  });
};

type GetSpotifyRelatedAlbumsArgs = WithAccessTokens<{
  artistIds: string[];
}>;

export const getSpotifyRelatedAlbums = async ({
  accessTokens,
  artistIds,
}: GetSpotifyRelatedAlbumsArgs) => {
  const relatedArtistsResults = await Promise.allSettled(
    artistIds.map((artistId) => getSpotifyRelatedArtists({ accessTokens, artistId })),
  );

  if (relatedArtistsResults.every((result) => result.status === "rejected")) {
    const firstRejection = relatedArtistsResults[0];

    if (firstRejection?.status === "rejected") {
      throw firstRejection.reason;
    }
  }

  const allRelatedArtists = relatedArtistsResults
    .flatMap((result) => (result.status === "fulfilled" ? (result.value?.artists ?? []) : []))
    .filter((artist) => !artistIds.includes(artist.id));

  const relatedArtistMap = new Map(allRelatedArtists.map((artist) => [artist.id, artist] as const));
  const relatedArtistIds = [...relatedArtistMap.keys()].slice(0, MAX_RELATED_ARTISTS);

  if (relatedArtistIds.length === 0) {
    return [];
  }

  const albumsResults = await Promise.allSettled(
    relatedArtistIds.map((artistId) => getSpotifyArtistAlbums({ accessTokens, artistId })),
  );

  return albumsResults.flatMap((result, index) => {
    if (result.status !== "fulfilled" || !result.value) {
      return [];
    }

    const artist = relatedArtistMap.get(relatedArtistIds[index]);

    return artist ? [{ albums: result.value.items ?? [], artist }] : [];
  });
};

type GetSpotifyCurrentlyPlayingTrackArgs = WithAccessTokens;

export const getSpotifyCurrentlyPlayingTrack = ({
  accessTokens,
}: GetSpotifyCurrentlyPlayingTrackArgs) => {
  return fetchSpotify<PlaybackState>({
    accessTokens,
    path: "/me/player/currently-playing",
  });
};

type StartResumeCurrentPlayerArgs = WithAccessTokens<{
  contextUri: string;
}>;

export const startResumeCurrentPlayer = ({
  accessTokens,
  contextUri,
}: StartResumeCurrentPlayerArgs) => {
  return fetchSpotify({
    accessTokens,
    init: {
      body: JSON.stringify({ context_uri: contextUri }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
    path: "/me/player/play",
  });
};
