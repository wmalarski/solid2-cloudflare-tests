/**
 * Freezes CSS animations and transitions so screenshot tests are
 * deterministic.
 *
 * `toMatchScreenshot` already disables animations on the Playwright side, but
 * pseudo-element animations (e.g. the daisyUI spinner on `.btn-loading`) can
 * still make captures unstable. Importing this module injects the override
 * once for the page.
 */
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
`;
document.head.appendChild(style);
