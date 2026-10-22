import { type Component, omit } from "solid-js";
import { useFieldContext } from "../field/field";
import type { ComponentVariantProps } from "../utils/types";
import { inputRecipe } from "./input.recipe";

type InputProps = ComponentVariantProps<"input", typeof inputRecipe>;

export const Input: Component<InputProps> = (props) => {
  const field = useFieldContext();
  const withoutVariants = omit(props, "color", "size", "variant", "width", "id", "name");

  return (
    <input
      autocomplete="off"
      autocorrect="off"
      {...withoutVariants}
      id={props.id ?? field?.id}
      name={props.name ?? field?.name}
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
