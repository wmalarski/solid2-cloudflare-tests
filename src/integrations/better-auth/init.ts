import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "~/integrations/drizzle/schema";
import type { AppConfig } from "~/worker/env/schema";
import type { DbInstance } from "../drizzle/init";

type InitBetterAuthArgs = {
  config: AppConfig;
  db: DbInstance;
};

export const initBetterAuth = ({ config, db }: InitBetterAuthArgs) => {
  return betterAuth({
    baseURL: config.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    secret: config.BETTER_AUTH_SECRET,
    trustedOrigins: [config.BETTER_AUTH_URL],
    socialProviders: {
      spotify: {
        clientId: config.SPOTIFY_CLIENT_ID,
        clientSecret: config.SPOTIFY_CLIENT_SECRET,
        scope: ["user-read-currently-playing", "user-modify-playback-state"],
      },
    },
  });
};

export type AuthInstance = ReturnType<typeof initBetterAuth>;

export type AccessTokens = Awaited<ReturnType<AuthInstance["api"]["getAccessToken"]>>;
