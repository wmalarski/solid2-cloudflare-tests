import { expect } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import type { Locator } from "vite-plus/test/browser";

/**
 * Screenshot-based assertion. Compares the rendered result against a stored
 * reference image (no DOM snapshots).
 *
 * Defaults to the {@link renderWithProviders} container; pass a locator to
 * capture a more specific element (for example an open dialog in the top
 * layer).
 */
export const expectScreenshot = async (name: string, target?: Locator): Promise<void> => {
  await expect.element(target ?? page.getByTestId("ui-container")).toMatchScreenshot(name);
};
