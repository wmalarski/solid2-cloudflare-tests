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
pnpm test-storybook   # run story tests (Vitest browser mode + Playwright)
```

Configuration lives in `.storybook/`:

- `main.ts` — stories/addons/framework and the `~/*` alias.
- `vite.config.ts` — Storybook-only Vite config (Tailwind + daisyUI). The app's
  root `vite.config.ts` is not used because it wires up the Cloudflare Worker
  plugin, which Storybook does not need.
- `preview.tsx` — global decorators (i18n provider) and the library CSS.

Stories are colocated with the components as `src/ui/**/*.stories.tsx`.

Story tests need a Playwright browser once: `pnpm exec playwright install chromium`.

## Deployment

Learn more about deploying your application with the [documentations](https://vite.dev/guide/static-deploy.html)
