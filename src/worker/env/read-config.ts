import * as v from "valibot";
import { envSchema, type AppConfig } from "./schema";
import { EnvValidationError } from "./errors";

let lastEnv: Env | undefined;
let lastConfig: AppConfig | undefined;

/**
 * Reads and validates the Worker bindings/secrets. Cloudflare has no process
 * "startup" hook, so this runs on the first request (and is memoized for the
 * isolate when the bindings object is stable). Missing configuration fails
 * loudly instead of silently producing a broken `baseURL` or OAuth client.
 */
export const readConfig = (env: Env): AppConfig => {
  if (env === lastEnv && lastConfig) {
    return lastConfig;
  }

  const result = v.safeParse(envSchema, env);

  if (!result.success) {
    const issues = result.issues.map((issue) => {
      const path = issue.path
        ?.map((segment) => String(typeof segment === "object" ? segment.key : segment))
        .join(".");

      return `${path || "env"}: ${issue.message}`;
    });

    throw new EnvValidationError(issues);
  }

  lastEnv = env;
  lastConfig = result.output;

  return lastConfig;
};
