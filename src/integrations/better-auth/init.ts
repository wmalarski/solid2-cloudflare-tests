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
    socialProviders: {
      spotify: {
        clientId: env.SPOTIFY_CLIENT_ID,
        clientSecret: env.SPOTIFY_CLIENT_SECRET,
      },
    },
  });
};

export type AuthInstance = ReturnType<typeof initBetterAuth>;
