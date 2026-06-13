import { action, type Component } from "solid-js";
import type { ComponentProps } from "@solidjs/web";
import { useI18n } from "~/integrations/i18n";
import { Button } from "~/ui/button/button";
import { authClient } from "~/integrations/better-auth/auth-client";

export const SignInForm: Component = () => {
  const { t } = useI18n();

  // const authContext = useAuthContext();

  const onSubmit: ComponentProps<"form">["onSubmit"] = action(function* (event) {
    event.preventDefault();

    yield authClient.signIn.social({ provider: "spotify" });

    // refresh(authContext);
  });

  return (
    <form class="w-full p-10 flex items-center justify-center" onSubmit={onSubmit}>
      <Button>{t("auth.signInWithSpotify")}</Button>
    </form>
  );
};
