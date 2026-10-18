/**
 * Public surface of the MSW test infrastructure.
 *
 * Re-exports MSW's `http`/`HttpResponse` too, so tests import request mocking
 * from a single module (`~/testing/msw`) regardless of MSW's internal
 * entrypoints.
 */
export { HttpResponse, http } from "msw/http";
export { worker } from "./browser";
export { seedMockDb } from "./db";
