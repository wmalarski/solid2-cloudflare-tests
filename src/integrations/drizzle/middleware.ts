import { factory } from "~/worker/factory";
import { initDrizzleConnect } from "./init";

export const dbMiddleware = factory.createMiddleware((context, next) => {
  const db = initDrizzleConnect(context.env);

  context.set("db", db);

  return next();
});
