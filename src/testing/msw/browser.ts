import { setupWorker } from "msw/browser";
import { authHandlers } from "~/modules/auth/tests/handlers";
import { dashboardHandlers } from "~/modules/dashboard/tests/handlers";

/**
 * Browser-mode MSW worker.
 *
 * The same `handlers` list backs every test file; individual tests extend it
 * with `worker.use(...)`. Life-cycle wiring lives in `./setup`.
 */
export const worker = setupWorker(...dashboardHandlers, ...authHandlers);
