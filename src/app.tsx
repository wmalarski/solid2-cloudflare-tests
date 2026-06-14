import { createMemo, Errored, Loading, Show } from "solid-js";
import { authClient } from "./integrations/better-auth/auth-client";
import { ErrorFallback } from "./modules/common/error-fallback";
import { AuthContextProvider } from "./integrations/better-auth/auth-context";
import { SignInForm } from "./modules/auth/sign-in-form";
import { I18nContextProvider } from "./integrations/i18n";
import { DashboardContainer } from "./modules/dashboard/dashboard-container";
import { HonoClientContextProvider } from "./integrations/hono-client/hono-client-context";

export const App = () => {
  const session = createMemo(() => authClient.getSession());

  return (
    <HonoClientContextProvider>
      <Errored fallback={ErrorFallback}>
        <Loading>
          <I18nContextProvider>
            <AuthContextProvider value={session}>
              <Show when={session().data} fallback={<SignInForm />}>
                <DashboardContainer />
              </Show>
            </AuthContextProvider>
          </I18nContextProvider>
        </Loading>
      </Errored>
    </HonoClientContextProvider>
  );
};
