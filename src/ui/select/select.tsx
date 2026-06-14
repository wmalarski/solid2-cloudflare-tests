import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { selectRecipe } from "./select.recipe";

type SelectProps = ComponentVariantProps<"select", typeof selectRecipe>;

export const Select: Component<SelectProps> = (props) => {
  const withoutVariants = omit(props, "color", "size", "variant");

  return (
    <select
      {...withoutVariants}
      class={selectRecipe({
        class: props.class,
        color: props.color,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};
