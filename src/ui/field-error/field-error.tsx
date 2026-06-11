import { type Component, Show, omit } from "solid-js";
import type { ComponentPropsWithClass } from "../utils/types";
import { fieldErrorRecipe } from "./field-error.recipe";

export type FieldErrorProps = Omit<ComponentPropsWithClass<"span">, "children"> & {
  message?: string;
  id: string;
};

export const FieldError: Component<FieldErrorProps> = (props) => {
  const withoutVariants = omit(props, "message");

  return (
    <Show when={props.message}>
      <span role="alert" {...withoutVariants} class={fieldErrorRecipe({ class: props.class })}>
        {props.message}
      </span>
    </Show>
  );
};
