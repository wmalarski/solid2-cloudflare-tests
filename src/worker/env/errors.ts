import { logError } from "~/integrations/logger";
import type { Context } from "hono";
import { getSharedErrorRequest } from "../errors";

export class EnvValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid environment configuration: ${issues.join("; ")}`);
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

export const onEnvValidationError = (error: EnvValidationError, context: Context) => {
  const request = getSharedErrorRequest(context);

  logError("invalid_environment", { ...request, issues: error.issues });

  return context.json({ message: "Server is misconfigured", requestId: request.requestId }, 500);
};
