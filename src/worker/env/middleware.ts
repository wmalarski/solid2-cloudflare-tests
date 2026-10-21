import { factory } from "~/worker/factory";
import { readConfig } from "~/worker/env/read-config";

export const envMiddleware = factory.createMiddleware((context, next) => {
  context.set("config", readConfig(context.env));

  return next();
});
