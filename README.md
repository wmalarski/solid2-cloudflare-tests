## Usage

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `vp run analyze`

Builds the app with source maps enabled and runs the [Sonda](https://sonda.dev)
bundle analyzer. Reports for the Worker and client builds are written to
`.sonda/` (open the generated HTML file for the build you are inspecting).

Sonda and source maps are enabled only for this command; `vp dev` and
`vp run build` stay lean.

## Component Library (Storybook)

The `src/ui` component library is documented with [Storybook](https://storybook.js.org)
using the `storybook-solidjs-vite` framework (Solid 2).

```bash
pnpm storybook        # dev server on http://localhost:6006
pnpm build-storybook  # static build into ./storybook-static
pnpm test             # run every browser-mode test project
pnpm test-ui          # run the src/ui unit + screenshot tests
pnpm test-integration # run the composed-UI tests against MSW-mocked Hono API
pnpm test-storybook   # run story tests (Vitest browser mode + Playwright)
```

Configuration lives in `.storybook/`:

- `main.ts` — stories/addons/framework and the `~/*` alias.
- `vite.config.ts` — Storybook-only Vite config (Tailwind + daisyUI). The app's
  root `vite.config.ts` is not used because it wires up the Cloudflare Worker
  plugin, which Storybook does not need.
- `preview.tsx` — global decorators (i18n provider) and the library CSS.

Stories are colocated with the components as `src/ui/**/*.stories.tsx`.

### Component tests

The `src/ui` components also have unit tests colocated as
`src/ui/**/*.test.tsx`. They run in [Vitest browser
mode](https://vitest.dev/guide/browser) against a real Chromium page via
Playwright, which lets them exercise real DOM behaviour and take screenshots.

- Behaviour is asserted with DOM matchers (`@vitest/browser` jest-dom matchers
  such as `toHaveClass`, `toHaveTextContent`, `toBeVisible`).
- Visual output is asserted with **screenshot tests**
  (`expect.element(...).toMatchScreenshot()`), not DOM snapshots. Reference
  images live in `__screenshots__/` next to each test file and are committed.

Shared helpers live in `src/ui/test-utils.tsx` (a `renderUi` wrapper that
provides the i18n context and an `expectScreenshot` helper) and
`src/ui/test-setup.ts` (loads the library CSS, freezes CSS animations and
resets the DOM between tests).

To (re)generate reference screenshots after an intentional visual change:

```bash
pnpm test-ui -u
```

### Integration tests (MSW)

Composed UI that talks to the Hono API (`src/modules`, `src/integrations`) is
covered by the separate `integration` Vitest project. Requests are intercepted
with [Mock Service Worker](https://mswjs.io), so no Worker, D1 or Spotify
access is needed.

```bash
pnpm test-integration
```

Shared infrastructure lives in `src/testing/`:

- `msw/handlers.ts` — happy-path handlers for every `/api/*` route (tasks,
  albums, artists, player, better-auth).
- `msw/db.ts` — a tiny in-memory stand-in for D1, reset between tests, so
  mutations are visible to the `GET` the UI makes when it refreshes.
- `msw/fixtures.ts` — Spotify album/artist/track/task factories. Cover art is
  inline `data:` SVG, so fixtures are offline and screenshots deterministic.
- `msw/browser.ts` / `msw/setup.ts` — the `setupWorker(...)` instance and the
  Vitest life-cycle (start once per file, reset handlers + DB after each test).
- `render.tsx` — `renderWithProviders`, which wraps a component in the i18n and
  Hono client providers.

The `mockServiceWorker.js` script is served by the `msw/vite` plugin configured
in `vitest.config.ts` (`mode: "worker-only"`), so there is no `public/` copy to
maintain.

A test seeds data, renders, and can override handlers per case:

```tsx
import { renderWithProviders } from "~/testing";
import { HttpResponse, createTask, http, seedMockDb, worker } from "~/testing/msw";

seedMockDb({ tasks: [createTask({ title: "Nude" })] });
renderWithProviders(() => <TasksBoard />);
await expect.element(page.getByText("Nude").first()).toBeVisible();

// Prepend an override for just this test.
worker.use(http.get("/api/tasks", () => HttpResponse.json([])));
```

The same worker is wired into the `ui` project, so unit tests can opt into API
mocking when needed. See `src/modules/dashboard/tasks-board.test.tsx` for a
worked example.

### End-to-end tests (Playwright)

Real-browser E2E tests live in `e2e/` and run with
[Playwright Test](https://playwright.dev). Unlike the Vitest projects above,
these hit the **actual dev server** — the Solid client, the Hono Worker and its
Cloudflare bindings (D1 via `wrangler.jsonc`) all run for real, with no MSW.

```bash
pnpm test-e2e          # run the suite (boots `pnpm dev` for you)
pnpm test-e2e-ui       # interactive UI mode
pnpm test-e2e --headed # watch it in a real browser window
```

`playwright.config.ts` starts the dev server via its `webServer` block (and
reuses one you already have running locally), so there is nothing to launch by
hand. `e2e/sign-in.spec.ts` is a worked example.

All browser-mode projects need a Playwright browser once:
`pnpm exec playwright install chromium`.

## Deployment

Learn more about deploying your application with the [documentations](https://vite.dev/guide/static-deploy.html)
