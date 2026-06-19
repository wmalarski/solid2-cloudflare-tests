import type { ComponentProps } from "@solidjs/web";
import { action, refresh, type Component } from "solid-js";
import { authClient } from "~/integrations/better-auth/auth-client";
import { useAuthContext } from "~/integrations/better-auth/auth-context";
import { useI18n } from "~/integrations/i18n";
import { Button } from "~/ui/button/button";

export const SignOutButton: Component = () => {
  const { t } = useI18n();

  const authContext = useAuthContext();

  const onSubmit: ComponentProps<"form">["onSubmit"] = action(function* (event) {
    event.preventDefault();

    yield authClient.signOut();

    refresh(authContext);
  });

  return (
    <form onSubmit={onSubmit}>
      <Button>{t("auth.signOut")}</Button>
    </form>
  );
};
