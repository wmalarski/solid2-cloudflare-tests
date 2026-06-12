import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export const initDrizzleConnect = (env: Env) => {
  return drizzle(env.DB, { schema });
};

export type DbInstance = ReturnType<typeof initDrizzleConnect>;
