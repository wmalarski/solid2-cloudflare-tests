import type { Session } from "better-auth";
import { buildSearchParams } from "~/utils/search-params";

type FetchSpotifyArgs = {
  session: Session;
  path: string;
  query?: Record<string, unknown>;
  init?: RequestInit;
};

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

export const fetchSpotify = async <T = unknown>({
  path,
  session,
  query,
  init,
}: FetchSpotifyArgs): Promise<T> => {
  const searchParams = buildSearchParams(query);

  const url = `${SPOTIFY_BASE_URL}${path}?${searchParams}`;

  const headers = new Headers(init?.headers);
  headers.set("Authorization", session.token);

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    console.error(url);
    throw new Error(response.statusText);
  }

  const json = await response.json();
  return json as T;
};
