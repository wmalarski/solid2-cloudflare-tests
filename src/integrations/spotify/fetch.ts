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

type FetchSpotifyArgs = {
  accessTokens: AccessTokens;
  init?: RequestInit;
  path: string;
  query?: Record<string, unknown>;
};

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

export const fetchSpotify = async <T = unknown>({
  accessTokens,
  init,
  path,
  query,
}: FetchSpotifyArgs): Promise<T> => {
  const searchParams = buildSearchParams(query);

  const url = `${SPOTIFY_BASE_URL}${path}?${searchParams}`;

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessTokens.accessToken}`);

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  return json as T;
};

type WithAccessTokens<T = {}> = T & { accessTokens: AccessTokens };

type GetSpotifyAlbumArgs = WithAccessTokens<{
  albumId: string;
}>;

export const getSpotifyAlbum = ({ albumId, accessTokens }: GetSpotifyAlbumArgs) => {
  return fetchSpotify<Album>({
    path: `/albums/${albumId}`,
    accessTokens,
  });
};

type GetSpotifyAlbumsArgs = WithAccessTokens<{
  albumIds: string[];
}>;

export const getSpotifyAlbums = ({ albumIds, accessTokens }: GetSpotifyAlbumsArgs) => {
  return fetchSpotify<Album[]>({
    path: "/albums",
    query: { ids: albumIds.join(",") },
    accessTokens,
  });
};

type GetSpotifyArtistArgs = WithAccessTokens<{
  artistId: string;
}>;

export const getSpotifyArtist = ({ artistId, accessTokens }: GetSpotifyArtistArgs) => {
  return fetchSpotify<Artist>({
    path: `/artists/${artistId}`,
    accessTokens,
  });
};

type GetSpotifyArtistsArgs = WithAccessTokens<{
  artistIds: string[];
}>;

export const getSpotifyArtists = ({ artistIds, accessTokens }: GetSpotifyArtistsArgs) => {
  return fetchSpotify<Artist[]>({
    path: "/artists",
    query: { ids: artistIds.join(",") },
    accessTokens,
  });
};

type GetSpotifyArtistAlbumsArgs = WithAccessTokens<{
  artistId: string;
}>;

export const getSpotifyArtistAlbums = ({ artistId, accessTokens }: GetSpotifyArtistAlbumsArgs) => {
  return fetchSpotify<Page<SimplifiedAlbum>>({
    path: `/artists/${artistId}/albums`,
    accessTokens,
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
    path: `/artists/${artistId}/related-artists`,
    accessTokens,
  });
};

type GetSpotifyCurrentlyPlayingTrackArgs = WithAccessTokens;

export const getSpotifyCurrentlyPlayingTrack = ({
  accessTokens,
}: GetSpotifyCurrentlyPlayingTrackArgs) => {
  return fetchSpotify<PlaybackState>({
    path: "/me/player/currently-playing",
    accessTokens,
  });
};
