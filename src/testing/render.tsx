import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type { Component, ParentProps } from "solid-js";
import { I18nContextProvider } from "~/integrations/i18n";
import { HonoClientContextProvider } from "~/integrations/hono-client/hono-client-context";

/** A context provider component, e.g. `I18nContextProvider`. */
export type TestProvider = Component<ParentProps>;

const disposers: Array<() => void> = [];

/**
 * Default providers for integration tests: i18n (translations read by dialogs)
 * and the Hono client (the layer MSW intercepts).
 */
export const defaultTestProviders: TestProvider[] = [
  I18nContextProvider,
  HonoClientContextProvider,
];

/** Nests `wrappers` around `component`, outermost first. */
export const composeProviders = (
  component: () => JSX.Element,
  wrappers: TestProvider[],
): (() => JSX.Element) =>
  wrappers.reduceRight<() => JSX.Element>(
    (children, Provider) => () => <Provider>{children()}</Provider>,
    component,
  );

export type RenderWithProvidersOptions = {
  /** Providers to nest around the component. Defaults to {@link defaultTestProviders}. */
  providers?: TestProvider[];
  /** `data-testid` for the container. Defaults to `ui-container`. */
  testId?: string;
};

/**
 * Renders a component into a container attached to `document.body`, wrapped in
 * the given providers (i18n + Hono client by default).
 *
 * The container is tagged with `data-testid="ui-container"` so screenshot
 * helpers can find it. Pass a different `providers` list for unit-style renders
 * that need fewer contexts.
 */
export const renderWithProviders = (
  component: () => JSX.Element,
  options: RenderWithProvidersOptions = {},
): HTMLElement => {
  const { providers = defaultTestProviders, testId = "ui-container" } = options;

  const container = document.createElement("div");
  container.setAttribute("data-testid", testId);
  document.body.appendChild(container);

  disposers.push(render(composeProviders(component, providers), container));

  return container;
};

/** Disposes every root created by {@link renderWithProviders}. */
export const cleanupRoots = (): void => {
  for (const dispose of disposers.splice(0)) {
    dispose();
  }
};

/**
 * Renders a UI component into a container attached to `document.body`.
 *
 * Every render is wrapped in the i18n provider because a few components
 * (`Dialog`, `AlertDialog`) read translations from context. Components that
 * talk to the Hono API should use `renderWithProviders` from `~/testing`
 * instead, which also provides the Hono client context.
 *
 * The container is tagged with `data-testid="ui-container"` so
 * {@link expectScreenshot} can find it.
 */
export const renderUi = (component: () => JSX.Element): HTMLElement => {
  return renderWithProviders(component, { providers: [I18nContextProvider] });
};
