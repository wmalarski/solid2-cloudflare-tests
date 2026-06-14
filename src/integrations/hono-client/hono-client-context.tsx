import { createContext, useContext, type Component, type ParentProps } from "solid-js";
import { createHonoClient } from "./create-client";

const honoClient = createHonoClient();

type HonoClientContextValue = typeof honoClient;

const HonoClientContext = createContext<HonoClientContextValue>(honoClient);

export const useHonoClientContext = () => {
  return useContext(HonoClientContext);
};

export const HonoClientContextProvider: Component<ParentProps> = (props) => {
  return <HonoClientContext value={honoClient}>{props.children}</HonoClientContext>;
};
