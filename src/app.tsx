import { Errored, Loading, Show } from "solid-js";
import { ErrorFallback } from "./modules/common/error-fallback";
import {
  AuthContextProvider,
  createSessionResource,
} from "./integrations/better-auth/auth-context";
import { SignInForm } from "./modules/auth/sign-in-form";
import { I18nContextProvider } from "./integrations/i18n";
import { DashboardContainer } from "./modules/dashboard/dashboard-container";
import { HonoClientContextProvider } from "./integrations/hono-client/hono-client-context";

export const App = () => {
  const session = createSessionResource();

  return (
    <I18nContextProvider>
      <HonoClientContextProvider>
        <Errored fallback={ErrorFallback}>
          <Loading>
            <AuthContextProvider value={session}>
              <Show when={session().data} fallback={<SignInForm />}>
                <DashboardContainer />
              </Show>
            </AuthContextProvider>
          </Loading>
        </Errored>
      </HonoClientContextProvider>
    </I18nContextProvider>
  );
};
