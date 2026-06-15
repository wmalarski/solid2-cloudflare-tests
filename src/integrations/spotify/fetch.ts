import type { Session } from "better-auth";
import { buildSearchParams } from "~/utils/search-params";
import {
  type Album,
  type Artist,
  type Artists,
  type Page,
  type PlaybackState,
  type SimplifiedAlbum,
} from "@spotify/web-api-ts-sdk";

type FetchSpotifyArgs = {
  session: Session;
  path: string;
  query?: Record<string, unknown>;
  init?: RequestInit;
  accessToken?: string;
};

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

export const fetchSpotify = async <T = unknown>({
  path,
  session,
  query,
  init,
  accessToken,
}: FetchSpotifyArgs): Promise<T> => {
  const searchParams = buildSearchParams(query);

  const url = `${SPOTIFY_BASE_URL}${path}?${searchParams}`;

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken ?? session.token}`);

  const response = await fetch(url, { ...init, headers });

  console.error(url, headers, session);
  console.error(response);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();
  return json as T;
};

type WithSession<T = {}> = T & { session: Session; accessToken?: string };

type GetSpotifyAlbumArgs = WithSession<{
  albumId: string;
}>;

export const getSpotifyAlbum = ({ albumId, session }: GetSpotifyAlbumArgs) => {
  return fetchSpotify<Album>({
    path: `/albums/${albumId}`,
    session,
  });
};

type GetSpotifyAlbumsArgs = WithSession<{
  albumIds: string[];
}>;

export const getSpotifyAlbums = ({ albumIds, session }: GetSpotifyAlbumsArgs) => {
  return fetchSpotify<Album[]>({
    path: "/albums",
    query: { ids: albumIds.join(",") },
    session,
  });
};

type GetSpotifyArtistArgs = WithSession<{
  artistId: string;
}>;

export const getSpotifyArtist = ({ artistId, session }: GetSpotifyArtistArgs) => {
  return fetchSpotify<Artist>({
    path: `/artists/${artistId}`,
    session,
  });
};

type GetSpotifyArtistsArgs = WithSession<{
  artistIds: string[];
}>;

export const getSpotifyArtists = ({ artistIds, session }: GetSpotifyArtistsArgs) => {
  return fetchSpotify<Artist[]>({
    path: "/artists",
    query: { ids: artistIds.join(",") },
    session,
  });
};

type GetSpotifyArtistAlbumsArgs = WithSession<{
  artistId: string;
}>;

export const getSpotifyArtistAlbums = ({ artistId, session }: GetSpotifyArtistAlbumsArgs) => {
  return fetchSpotify<Page<SimplifiedAlbum>>({
    path: `/artists/${artistId}/albums`,
    session,
  });
};

type GetSpotifyRelatedArtistsArgs = WithSession<{
  artistId: string;
}>;

export const getSpotifyRelatedArtists = ({ artistId, session }: GetSpotifyRelatedArtistsArgs) => {
  return fetchSpotify<Artists>({
    path: `/artists/${artistId}/related-artists`,
    session,
  });
};

type GetSpotifyCurrentlyPlayingTrackArgs = WithSession;

export const getSpotifyCurrentlyPlayingTrack = ({
  session,
  accessToken,
}: GetSpotifyCurrentlyPlayingTrackArgs) => {
  return fetchSpotify<PlaybackState>({
    path: "/me/player/currently-playing",
    session,
    accessToken,
  });
};
