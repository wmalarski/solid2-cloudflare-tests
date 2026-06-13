import { createMemo, Errored, Loading, Show } from "solid-js";
import { authClient } from "./integrations/better-auth/auth-client";
import { ErrorFallback } from "./modules/common/error-fallback";
import { AuthContextProvider } from "./integrations/better-auth/auth-context";
import { SignInForm } from "./modules/auth/sign-in-form";
import { I18nContextProvider } from "./integrations/i18n";

export const App = () => {
  const session = createMemo(() => authClient.getSession());

  return (
    <Errored fallback={ErrorFallback}>
      <Loading>
        <I18nContextProvider>
          <AuthContextProvider value={session}>
            <Show when={session().data} fallback={<SignInForm />}>
              {(data) => <pre>{JSON.stringify(data(), null, 2)}</pre>}
            </Show>
          </AuthContextProvider>
        </I18nContextProvider>
      </Loading>
    </Errored>
  );
};
