import type { InferResponseType } from "hono/client";
import type { HonoClient } from "~/integrations/hono-client/create-client";

export type SelectTodosResponse = InferResponseType<HonoClient["api"]["tasks"]["$get"]>;

// oxlint-disable-next-line typescript/no-redundant-type-constituents
export type SelectTodosItem = (SelectTodosResponse & { success: true })[0];
