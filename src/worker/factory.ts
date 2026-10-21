import type { Session, User } from "better-auth";
import { createFactory } from "hono/factory";
import type { AccessTokens, AuthInstance } from "~/integrations/better-auth/init";
import type { DbInstance } from "~/integrations/drizzle/init";
import type { AppConfig } from "~/worker/env/schema";

export type AppEnv = {
  Bindings: Env;
  Variables: {
    accessTokens: AccessTokens;
    auth: AuthInstance;
    authorizedSession: Session;
    config: AppConfig;
    db: DbInstance;
    requestId: string;
    session: Session | null;
    user: User | null;
  };
};

export const factory = createFactory<AppEnv>();
