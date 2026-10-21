import * as v from "valibot";

/** Spotify's `/albums?ids=` and `/artists?ids=` endpoints accept at most 20 IDs. */
export const MAX_SPOTIFY_IDS = 20;

export const spotifyIdSchema = v.pipe(
  v.string(),
  v.regex(/^[A-Za-z0-9]{22}$/, "Expected a 22-character Spotify ID"),
);

/** Validates the comma-separated `?albumIds=` / `?artistIds=` query format. */
export const spotifyIdsQuerySchema = v.pipe(
  v.string(),
  v.transform((value) =>
    value
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0),
  ),
  v.array(spotifyIdSchema),
  v.minLength(1, "At least one Spotify ID is required"),
  v.maxLength(MAX_SPOTIFY_IDS, `At most ${MAX_SPOTIFY_IDS} Spotify IDs are allowed`),
  v.transform((ids) => [...new Set(ids)]),
);

/** `context_uri` accepted by Spotify's player endpoints. */
export const spotifyContextUriSchema = v.pipe(
  v.string(),
  v.regex(/^spotify:(album|artist|playlist|track):[A-Za-z0-9]{22}$/, "Expected a Spotify URI"),
);
