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
    trustedOrigins: ["http://127.0.0.1:5173"],
    socialProviders: {
      spotify: {
        clientId: env.SPOTIFY_CLIENT_ID,
        clientSecret: env.SPOTIFY_CLIENT_SECRET,
        redirectURI: "http://127.0.0.1:5173/api/auth/callback/spotify",
        scope: ["user-read-playback-state", "user-read-email"],
      },
    },
    logger: { level: "debug" },
  });
};

export type AuthInstance = ReturnType<typeof initBetterAuth>;
