import { hc } from "hono/client";
import type { AppType } from "../../worker";

export const createHonoClient = () => {
  return hc<AppType>("/api", {
    init: {
      // credentials: "include", // Required for sending cookies cross-origin
    },
  });
};
