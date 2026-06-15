import type { Session, User } from "better-auth";
import { createFactory } from "hono/factory";
import type { AuthInstance } from "~/integrations/better-auth/init";
import type { DbInstance } from "~/integrations/drizzle/init";

export type AppEnv = {
  Bindings: Env;
  Variables: {
    auth: AuthInstance;
    authorizedSession: Session;
    db: DbInstance;
    session: Session | null;
    user: User | null;
    accessToken: string;
  };
};

export const factory = createFactory<AppEnv>();
