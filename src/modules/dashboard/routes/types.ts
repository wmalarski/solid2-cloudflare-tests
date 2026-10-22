import type { InferResponseType } from "hono/client";
import type { HonoClient } from "~/integrations/hono-client/create-client";

export type SelectTasksResponse = InferResponseType<HonoClient["api"]["tasks"]["$get"], 200>;

export type SelectTasksItem = SelectTasksResponse["items"][number];
