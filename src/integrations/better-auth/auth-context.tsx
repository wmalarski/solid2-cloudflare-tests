import { createContext, createMemo, useContext, type Component, type ParentProps } from "solid-js";
import { authClient } from "./auth-client";

export const createSessionResource = () => {
  return createMemo(() => authClient.getSession());
};

type AuthContextValue = ReturnType<typeof createSessionResource>;

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

type AuthContextProviderProps = ParentProps<{ value: AuthContextValue }>;

export const AuthContextProvider: Component<AuthContextProviderProps> = (props) => {
  return <AuthContext value={props.value}>{props.children}</AuthContext>;
};
