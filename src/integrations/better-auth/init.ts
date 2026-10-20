import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "~/integrations/drizzle/schema";
import type { DbInstance } from "../drizzle/init";

type InitBetterAuthArgs = {
  db: DbInstance;
  env: Env;
};

export const initBetterAuth = ({ db, env }: InitBetterAuthArgs) => {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    socialProviders: {
      spotify: {
        clientId: env.SPOTIFY_CLIENT_ID,
        clientSecret: env.SPOTIFY_CLIENT_SECRET,
        scope: ["user-read-currently-playing", "user-modify-playback-state"],
      },
    },
  });
};

export type AuthInstance = ReturnType<typeof initBetterAuth>;

export type AccessTokens = Awaited<ReturnType<AuthInstance["api"]["getAccessToken"]>>;
