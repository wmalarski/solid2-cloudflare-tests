import { HttpResponse, http } from "msw/http";

// --- web vitals ----------------------------------------------------------

/**
 * `POST /api/rum` is unauthenticated on purpose: the sign-in screen reports
 * before a session exists. The Worker only logs the report, so the mock always
 * answers `204`.
 */
const reportWebVitals = () => http.post("/api/rum", () => new HttpResponse(null, { status: 204 }));

/** Default, happy-path handlers for the Hono (`/api/*`) layer. */
export const webVitalsHandlers = [reportWebVitals()];
