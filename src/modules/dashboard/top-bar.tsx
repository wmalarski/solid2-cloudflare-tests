import { type Component } from "solid-js";
import { useAuthContext } from "~/integrations/better-auth/auth-context";
import { CurrentlyPlayingSection } from "./currently-playing-section";

export const TopBar: Component = () => {
  const authContext = useAuthContext();

  return (
    <>
      <pre>{JSON.stringify(authContext, null, 2)}</pre>
      <CurrentlyPlayingSection />
    </>
  );
};
