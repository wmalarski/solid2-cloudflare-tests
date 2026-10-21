import { createRateLimit } from "~/worker/rate-limit";

/** Album/artist metadata lookups fan out to Spotify. */
export const spotifyReadRateLimit = createRateLimit({ name: "spotify-read", limit: 60 });

/** Player controls are user-triggered but cheap to spam. */
export const spotifyPlayerRateLimit = createRateLimit({ name: "spotify-player", limit: 30 });

/** Creating a task performs a Spotify lookup before the D1 insert. */
export const taskInsertRateLimit = createRateLimit({ name: "task-insert", limit: 20 });
