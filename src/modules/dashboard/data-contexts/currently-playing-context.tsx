import { createContext, createMemo, useContext, type Component, type ParentProps } from "solid-js";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { parseResponse } from "hono/client";

const createCurrentlyPlayingContext = () => {
  const honoClient = useHonoClientContext();

  return createMemo(() => parseResponse(honoClient.api.player["currently-playing"].$get()));
};

type CurrentlyPlayingContextValue = ReturnType<typeof createCurrentlyPlayingContext>;

const CurrentlyPlayingContext = createContext<CurrentlyPlayingContextValue | null>(null);

export const useCurrentlyPlayingContext = () => {
  const context = useContext(CurrentlyPlayingContext);

  if (!context) {
    throw new Error("CurrentlyPlayingContext not defined");
  }

  return context;
};

export const CurrentlyPlayingContextProvider: Component<ParentProps> = (props) => {
  const value = createCurrentlyPlayingContext();

  return <CurrentlyPlayingContext value={value}>{props.children}</CurrentlyPlayingContext>;
};
