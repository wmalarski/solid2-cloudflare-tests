import * as v from "valibot";

export const envSchema = v.object({
  BETTER_AUTH_URL: v.pipe(v.string(), v.url("BETTER_AUTH_URL must be an absolute URL")),
  BETTER_AUTH_SECRET: v.pipe(v.string(), v.minLength(1, "BETTER_AUTH_SECRET is required")),
  SPOTIFY_CLIENT_ID: v.pipe(v.string(), v.minLength(1, "SPOTIFY_CLIENT_ID is required")),
  SPOTIFY_CLIENT_SECRET: v.pipe(v.string(), v.minLength(1, "SPOTIFY_CLIENT_SECRET is required")),
});

export type AppConfig = v.InferOutput<typeof envSchema>;
