/* @refresh reload */
import { render } from "@solidjs/web";
import { App } from "./app.tsx";
import "./index.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);

// Field data is always on in production; `?vitals` turns it on for a local
// build so the payload can be inspected. Loaded lazily to stay off the LCP path.
if (import.meta.env.PROD || new URLSearchParams(location.search).has("vitals")) {
  void import("./modules/performance/report-web-vitals.ts").then(({ reportWebVitals }) =>
    reportWebVitals(),
  );
}
