import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { inputRecipe } from "./input.recipe";

type InputProps = ComponentVariantProps<"input", typeof inputRecipe>;

export const Input: Component<InputProps> = (props) => {
  const withoutVariants = omit(props, "color", "size", "variant", "width");

  return (
    <input
      autocomplete="off"
      autocorrect="off"
      {...withoutVariants}
      class={inputRecipe({
        class: props.class,
        color: props.color,
        size: props.size,
        variant: props.variant,
        width: props.width,
      })}
    />
  );
};
