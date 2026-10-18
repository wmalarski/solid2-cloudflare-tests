import { afterEach } from "vite-plus/test";
import "../index.css";
import { cleanupUi } from "./test-utils";

/**
 * Freezes CSS animations and transitions so screenshot tests are deterministic.
 *
 * `toMatchScreenshot` already disables animations on the Playwright side, but
 * pseudo-element animations (e.g. the daisyUI spinner on `.btn-loading`) can
 * still make captures unstable.
 */
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
`;
document.head.appendChild(style);

/**
 * Browser-mode setup for the `src/ui` component tests.
 *
 * Loads the library stylesheet so screenshot tests capture the real Tailwind +
 * daisyUI look, and tears down the DOM and reactive roots between tests.
 */
afterEach(() => {
  cleanupUi();
  document.body.replaceChildren();
});
