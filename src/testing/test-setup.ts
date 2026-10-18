import "../index.css";
import { afterEach } from "vite-plus/test";
import "~/testing/freeze-animations";
import "~/testing/msw/setup";
import { cleanupRoots } from "~/testing/render";

/**
 * Browser-mode setup for integration tests (`src/modules`, `src/integrations`,
 * …).
 *
 * Loads the library stylesheet, starts MSW (see `~/testing/msw/setup`), and
 * tears down the DOM and reactive roots between tests.
 */
afterEach(() => {
  cleanupRoots();
  document.body.replaceChildren();
});
