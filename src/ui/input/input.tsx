import { type Component, omit } from "solid-js";
import { useFieldContext } from "../field/field";
import type { ComponentVariantProps } from "../utils/types";
import { inputRecipe } from "./input.recipe";
import { createInvalidFieldProps } from "../field/create-invalid-field-props";

type InputProps = ComponentVariantProps<"input", typeof inputRecipe>;

export const Input: Component<InputProps> = (props) => {
  const field = useFieldContext();
  const withoutVariants = omit(props, "color", "size", "variant", "width", "id", "name");

  const invalidStateProps = createInvalidFieldProps();

  return (
    <input
      autocomplete="off"
      autocorrect="off"
      {...withoutVariants}
      id={props.id ?? field?.id}
      name={props.name ?? field?.name}
      {...invalidStateProps()}
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
