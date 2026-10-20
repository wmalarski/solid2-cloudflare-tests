import { HttpResponse, http } from "msw/http";

// --- better-auth ---------------------------------------------------------

const getAuthSession = () => http.get("/api/auth/get-session", () => HttpResponse.json(null));

const getSession = () => http.get("/api/auth/session", () => HttpResponse.json(null));

const signOut = () => http.post("/api/auth/sign-out", () => HttpResponse.json({ success: true }));

/** Catch-all for the remaining better-auth endpoints (`sign-in/social`, …). */
const authFallback = () => http.all("/api/auth/*", () => HttpResponse.json({}));

/**
 * Default, happy-path handlers for the Hono (`/api/*`) layer.
 *
 * Requests hit the relative URLs built by the `hc` client, so paths are
 * prefix-less (`/api/tasks`) rather than absolute.
 *
 * Ordering note: MSW returns the first matching handler, so the literal
 * `/api/artists/related` must be registered before `/api/artists/:artistId`.
 */
export const authHandlers = [
  // better-auth
  getAuthSession(),
  getSession(),
  signOut(),
  authFallback(),
];
