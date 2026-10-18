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

## Component Library (Storybook)

The `src/ui` component library is documented with [Storybook](https://storybook.js.org)
using the `storybook-solidjs-vite` framework (Solid 2).

```bash
pnpm storybook        # dev server on http://localhost:6006
pnpm build-storybook  # static build into ./storybook-static
pnpm test             # run every browser-mode test project
pnpm test-ui          # run the src/ui unit + screenshot tests
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
pnpm test-ui -- -u
```

Test files are wired into `vitest.config.ts` as the `ui` project, kept separate
from the `storybook` project and from the app's Cloudflare `vite.config.ts`.

Story tests need a Playwright browser once: `pnpm exec playwright install chromium`.

## Deployment

Learn more about deploying your application with the [documentations](https://vite.dev/guide/static-deploy.html)
