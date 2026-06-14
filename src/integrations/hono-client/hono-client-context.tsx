import { createContext, useContext, type Component, type ParentProps } from "solid-js";
import { createHonoClient, type HonoClient } from "./create-client";

const honoClient = createHonoClient();

const HonoClientContext = createContext<HonoClient>(honoClient);

export const useHonoClientContext = () => {
  return useContext(HonoClientContext);
};

export const HonoClientContextProvider: Component<ParentProps> = (props) => {
  return <HonoClientContext value={honoClient}>{props.children}</HonoClientContext>;
};
