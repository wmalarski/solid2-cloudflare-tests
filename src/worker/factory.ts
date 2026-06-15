import type { Session, User } from "better-auth";
import { createFactory } from "hono/factory";
import type { AccessTokens, AuthInstance } from "~/integrations/better-auth/init";
import type { DbInstance } from "~/integrations/drizzle/init";

export type AppEnv = {
  Bindings: Env;
  Variables: {
    accessTokens: AccessTokens;
    auth: AuthInstance;
    authorizedSession: Session;
    db: DbInstance;
    session: Session | null;
    user: User | null;
  };
};

export const factory = createFactory<AppEnv>();
