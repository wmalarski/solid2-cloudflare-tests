# Performance Baseline and Findings

Date: 2026-10-23

This is the first baseline produced with the `performance-optimization` skill
(`.agents/skills/performance-optimization`). It measures the current code; it
does not change application behaviour.

## Scope and method

- **Build:** `pnpm build` (production client + Worker).
- **Client measurement:** built `dist/client` served locally with gzip, driven by
  Playwright Chromium 1.64.
- **Network:** Slow 4G emulation (1.6 Mbps down, 750 kbps up, 150 ms RTT) and 4x
  CPU throttling.
- **API:** mocked at 150 ms per request. This isolates the client cost; it is not
  a production API measurement.
- **Data:** 10 tasks per board column (30 cards) plus one currently-playing
  album. Cover art uses the byte sizes of real Spotify images:
  300 px = 32,395 B, 640 px = 115,514 B, 64 px = 2,299 B.
- **Runs:** 3-5 runs, medians reported. All numbers are lab (synthetic), not RUM.

## Baseline

| Metric                             |                      Result |       Target | Verdict          |
| ---------------------------------- | --------------------------: | -----------: | ---------------- |
| LCP                                |                      1.48 s |      ≤ 2.5 s | good             |
| FCP                                |                      1.48 s |            - | good             |
| CLS                                |                   **0.279** |        ≤ 0.1 | **poor**         |
| Long tasks (startup)               |       2-3, longest 81-88 ms | none > 50 ms | needs work       |
| Click -> page 2 content            |                  379-403 ms | INP ≤ 200 ms | needs work*      |
| Client JS                          |                72.6 kB gzip |     < 200 kB | good             |
| Client CSS                         |                19.6 kB gzip |      < 50 kB | good             |
| Cover art on first dashboard paint |  **62 requests / 4.37 MiB** |            - | **poor**         |
| Worker bundle                      | 1.06 MB raw / 244.7 kB gzip |            - | watch cold start |

\* The click measurement is "click until the newly loaded page is visible"; it
includes the 150 ms mocked API call, so it is not a true INP measurement.

Since the guard below was added, the client also ships a 3.5 kB gzip
`web-vitals` chunk, bringing client JS to 76.0 kB gzip in total.

The build also emits a single client chunk. There is no route-level splitting:
the sign-in screen downloads the dashboard code too.

### Configuration fix applied: skill docs were in the Tailwind scan

Tailwind v4's automatic content detection was scanning the vendored skill
markdown under `.agents/` (and would have scanned this report). Prose such as
`card-side`, `loading="lazy"`, and `aspect-ratio` generated unused CSS.

`src/index.css` now only scans browser-rendered markup:

```css
@source not "../.agents";
@source not "../PERF.md";
@source not "../scripts";
@source not "../src/worker";
```

The last two keep Node scripts and server code out of the scan; their prose
(`join`, `isolate`) was generating daisyUI components. Measured on the same
build: client CSS went from **20.8 kB gzip to 19.6 kB gzip** (-1.2 kB, ~6%),
and it stayed at 19.6 kB after the RUM code was added (Vite's own gzip report;
`pnpm budget` measures slightly lower at 19.2 kB). `vite.config.ts` also
excludes `.agents/**` from formatting and linting so `vp check --fix` cannot
rewrite files whose hashes are recorded in `skills-lock.json`. This is a keep:
the CSS moved, the suite is green, and the lock hash still matches.

## Findings

### P0: the currently-playing request suspends the whole dashboard

`src/app.tsx:19` has one `<Loading>` boundary around the authenticated app.
`CurrentlyPlayingSection` reads the pending `/api/player/currently-playing`
promise in the footer, so that promise suspends the same boundary as the task
board.

Measured: delaying only the player request to 2 s moved the first task card from
1.7 s to **3.28 s** and LCP from 1.49 s to **3.25 s**. The task board, which only
needs D1, waits for Spotify.

The worst case is larger: Spotify calls time out after 8 s and retry up to 3
times (`src/integrations/spotify/fetch.ts:22-23`), so a slow Spotify response can
hold the dashboard for roughly 24 s before the error boundary takes over.

Fix direction: give the footer its own `<Loading fallback={...}>` boundary (or a
non-suspending fetch) so the task board renders independently.

### P0: every closed details dialog loads a 640 px cover

`src/modules/dashboard/currently-playing-section/details-dialog.tsx:101` renders
the 640 px `<AlbumImage>` unconditionally. The `<Show when={open()}>` at line 110
only guards the artist lists. A native `<dialog>` that is not open still loads
images inside it.

Measured with unique image URLs: 30 task cards + 1 player card produced **62
image requests**. At the sampled Spotify sizes that is **4.37 MiB** on first
dashboard load. If the 640 px images were loaded only when the dialog opens, the
first load would drop to about **0.96 MiB** (a 78% reduction).

The same component also has no `loading="lazy"`, `decoding="async"`, or
`srcset`/`sizes`; all cover art is eager. Below-the-fold cards should be lazy,
and the visible card should keep the eager/high-priority treatment.

### P0: CLS 0.279 from card layout shift

The card layout shifts when the cover image arrives. Layout-shift attribution
points at `.card-side` and `.card-body`: before the image loads the body takes the
full card width (380 px); after the image loads the body shrinks to 135 px and
the card height changes. daisyUI's `.card-side figure>*` sets
`width: 100%; height: 100%`, so the `<figure>` has no reserved width until the
image has intrinsic size.

The `<img>` already has `width`/`height` attributes, but the figure that wraps it
does not reserve space. Fix direction: give the figure a fixed square size (or an
explicit `aspect-ratio` plus width) so the card body never reflows. This should
take CLS from 0.279 to ~0.

### P1: every task request also pays for a Spotify access token

`src/modules/dashboard/routes/tasks.ts:48` applies
`authorizedMiddleware, accessTokenMiddleware` to the whole tasks route. Reading
tasks from D1 does not need a Spotify token, but `accessTokenMiddleware` performs
an `account` lookup and `auth.api.getAccessToken` on every request
(`src/integrations/better-auth/middleware.ts`). The dashboard makes three task
requests plus the player request on load, so this work is repeated four times.

Fix direction: keep `accessTokenMiddleware` only on routes that call Spotify
(`POST /api/tasks`, albums, artists, player). `GET/PUT/DELETE /api/tasks` need
`authorizedMiddleware` only.

### P1: task pagination has no stable order or covering index

`src/modules/dashboard/routes/tasks.ts:151-157` selects by `status` and
`userId`, applies `LIMIT/OFFSET`, and never orders the rows. Offset pagination
without a stable order can repeat or skip rows when items are inserted or moved
between pages.

The schema has `task_user_status_idx` on `(userId, status)`
(`src/integrations/drizzle/schema.ts:105`), but no index that also covers the
sort. Add `ORDER BY created_at DESC` and an index on
`(userId, status, created_at DESC)`; use keyset pagination
(`created_at, id` cursor) if the board grows beyond a few pages.

### P1: related-albums fan-out

`getSpotifyRelatedAlbums` (`src/integrations/spotify/fetch.ts:293`) issues one
related-artists request per artist ID (up to 20) and then up to 10 album
requests. This is behind the details dialog, but a first open can fan out to ~30
subrequests and several seconds. The Cache API softens repeat visits (300 s TTL
for metadata, 60 s for artist albums).

The cache key is the URL only. Spotify catalogue responses can vary by market
(album availability, track relinking), so the key should include a market or
country component, or requests should send an explicit `market`.

### P2: client bundle is one chunk

The client is a single 72.6 kB gzip chunk plus 19.6 kB gzip CSS (plus a 3.5 kB
gzip `web-vitals` chunk for RUM). That is inside
the skill's budget, but an unauthenticated visitor downloads the dashboard and
all dialogs before seeing the sign-in form. Lazy-loading `DashboardContainer`
after authentication would improve the sign-in path and is the main remaining
code-splitting opportunity.

### P2: Worker bundle and cold start

The Worker bundle is 1.06 MB raw / 244.7 kB gzip. Sonda shows the main bundle
pulling `better-auth`, `kysely`, `zod`, and OpenTelemetry semantic conventions,
plus separate SQLite dialect chunks. This does not affect client Core Web Vitals,
but it is worth watching for cold-start latency.

### P2: no synthetic CI run yet

Build-time byte budgets and field RUM now exist (see "Performance guard"), but
there is still no Lighthouse CI or throttled synthetic run wired into CI, so a
regression in LCP/CLS would only show up in field data after deploy. Add a
Lighthouse CI (or the throttled Playwright harness) once the repository has a CI
pipeline.

## Performance guard

Two budgets are enforced: bytes at build time, and Core Web Vitals in the field.

### Byte budget

`performance-budget.json` holds the limits. `scripts/check-bundle-budget.mjs`
measures the finished build (gzip level 9, kB = 1000 bytes, sourcemaps ignored,
so `pnpm analyze` and `pnpm build` produce the same check output).

```bash
pnpm build && pnpm budget
pnpm analyze          # Sonda report plus the same budget check
```

| Check                     | Limit    | Current  |
| ------------------------- | -------- | -------- |
| client JS                 | 90.0 kB  | 76.0 kB  |
| client CSS                | 25.0 kB  | 19.2 kB  |
| largest client chunk      | 90.0 kB  | 72.5 kB  |
| worker entry (cold start) | 280.0 kB | 244.1 kB |
| worker JS total (upload)  | 450.0 kB | 405.8 kB |

Both `pnpm build` and `pnpm analyze` run the check after building, so the
documented validation loop fails on growth. The worker entry is the cold-start
cost; the worker total includes the lazily imported SQLite dialect chunks, which
still count toward the uploaded script size. Limits leave roughly 15-20%
headroom: raise one only in the change that adds the weight, and say why in the
same commit.

### Field data (RUM)

`src/integrations/web-vitals` reports LCP, CLS, INP, FCP, and TTFB to
`POST /api/rum`. The route is public on purpose (the sign-in screen reports
before a session exists) and is rate limited per IP. Reports are batched, sent
with `navigator.sendBeacon` and fall back to `fetch(..., { keepalive: true })`;
they never block rendering. Production builds always report; append `?vitals` to
a local URL to try it in development.

The Worker logs one JSON line per metric:

```json
{
  "level": "info",
  "event": "web_vital",
  "metric": "LCP",
  "value": 1480,
  "rating": "good",
  "path": "/"
}
```

A value above the `poor` boundary in `performance-budget.json` is logged as
`web_vital_budget_exceeded` at `warn` level instead, which is the event to alert
on in Cloudflare Workers Logs. The Worker's log line carries the pathname,
metric, normalized value and delta, the rating it computed, and the connection's
`effectiveType` — no user id and no query string. `src/worker/web-vitals`
validates the report (10 metrics per request, 64-character id) and
`src/performance/budget.ts` turns `performance-budget.json` into the thresholds
shared by the client and the Worker.

### Lab data (Playwright)

Every E2E test attaches a `performance` JSON to the Playwright report and appends
it to `test-results/performance.jsonl` (LCP, CLS, FCP, TTFB, an INP proxy, long
tasks/TBT, and resource counts). See `e2e/fixtures.ts` and the E2E section of the
README.

```bash
pnpm test-e2e                   # build + preview, then collect one [perf] line per test
PERF_THROTTLE=1 pnpm test-e2e   # Slow 4G + 4x CPU
PERF_BUDGET=1 pnpm test-e2e     # assert the `lab` budgets
```

The suite runs against `pnpm preview` (the production build), so these numbers
are representative of what ships. On the sign-in screen, throttled: LCP ~2.3 s,
CLS 0, TBT ~50 ms, 4 requests. `E2E_TARGET=dev` switches to the dev server for
fast iteration; its unbundled modules make throttled numbers meaningless, so
`PERF_BUDGET` skips assertions in that mode. Field data comes from the RUM setup
above.

There is no CI configuration in this repository yet. When one is added, run
`pnpm build && pnpm budget` (and optionally `pnpm test-e2e` with
`PERF_BUDGET=1`) in it.

## What is already good

- Client JS/CSS are comfortably under the size budgets.
- No web fonts; daisyUI uses the system font stack.
- Album images declare `width`/`height`, so the image box itself has an aspect
  ratio; the remaining CLS is the card-side layout, not a missing image size.
- Tasks are paginated with a one-extra-row `hasNext` probe.
- Spotify GETs use the Cache API with explicit TTLs.
- Mutations use optimistic UI and refresh only the affected column.
- The task table already has user/status and user/created-at indexes, and a
  unique user/Spotify constraint.

## Suggested next experiments (ledger)

| Idea                                                                          | Expected                                                                     | Verification                                           |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| Wrap the player footer in its own `<Loading>`                                 | LCP stays ~1.5 s when the player is slow; first task ~1.7 s instead of 3.3 s | Re-run the throttled benchmark with a 2 s player delay |
| Render the 640 px dialog image only when open; lazy-load below-the-fold cards | First-load image bytes 4.37 MiB -> ~1 MiB                                    | Count image requests/bytes on first paint              |
| Reserve the card figure size                                                  | CLS 0.279 -> ~0                                                              | Layout-shift entries empty                             |
| Drop `accessTokenMiddleware` from task reads                                  | 3 fewer account lookups/token reads per dashboard load                       | Trace `/api/tasks` requests in the Worker              |
| Add `ORDER BY created_at DESC` + `(userId, status, created_at)` index         | Stable pages; no sort                                                        | `EXPLAIN QUERY PLAN` before/after                      |
| Lazy-load the dashboard chunk                                                 | Smaller sign-in payload                                                      | Sonda client report + first-load transfer              |

Only the first three are on the critical path for the measured Core Web Vitals.
Apply one at a time and re-measure with the same throttled setup; revert anything
inside run-to-run noise.

## Reproduction commands

```bash
pnpm build
pnpm analyze        # Sonda reports in .sonda/, then the byte budget
pnpm budget         # byte budget only, against the last build
pnpm test
pnpm test-e2e       # production build + preview + Playwright
```

The throttled benchmark used a local static server for `dist/client`, Playwright
route mocks for `/api/**`, and CDP `Network.emulateNetworkConditions` plus
`Emulation.setCPUThrottlingRate`. It is intentionally kept out of the repository
because it is a lab harness, not an application test.
