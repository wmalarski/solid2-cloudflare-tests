import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { expect } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import type { Locator } from "vite-plus/test/browser";
import { I18nContextProvider } from "~/integrations/i18n";

const disposers: Array<() => void> = [];

/**
 * Renders a UI component into a container attached to `document.body`.
 *
 * Every render is wrapped in the i18n provider because a few components
 * (`Dialog`, `AlertDialog`) read translations from context.
 *
 * The container is tagged with `data-testid="ui-container"` so
 * {@link expectScreenshot} can find it.
 */
export function renderUi(component: () => JSX.Element): HTMLElement {
  const container = document.createElement("div");
  container.setAttribute("data-testid", "ui-container");
  document.body.appendChild(container);

  disposers.push(render(() => <I18nContextProvider>{component()}</I18nContextProvider>, container));

  return container;
}

/** Disposes every root created by {@link renderUi}. Called after each test. */
export function cleanupUi(): void {
  for (const dispose of disposers.splice(0)) {
    dispose();
  }
}

/**
 * Screenshot-based assertion. Compares the rendered result against a stored
 * reference image (no DOM snapshots).
 *
 * Defaults to the {@link renderUi} container; pass a locator to capture a more
 * specific element (for example an open dialog rendered in the top layer).
 */
export async function expectScreenshot(name: string, target?: Locator): Promise<void> {
  await expect.element(target ?? page.getByTestId("ui-container")).toMatchScreenshot(name);
}
