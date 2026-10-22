import { type Component, omit } from "solid-js";
import { useFieldContext } from "../field/field";
import type { ComponentVariantProps } from "../utils/types";
import { selectRecipe } from "./select.recipe";
import { createInvalidFieldProps } from "../field/create-invalid-field-props";

type SelectProps = ComponentVariantProps<"select", typeof selectRecipe>;

export const Select: Component<SelectProps> = (props) => {
  const field = useFieldContext();
  const withoutVariants = omit(props, "color", "size", "variant", "id", "name");

  const invalidStateProps = createInvalidFieldProps();

  return (
    <select
      {...withoutVariants}
      id={props.id ?? field?.id}
      name={props.name ?? field?.name}
      {...invalidStateProps()}
      class={selectRecipe({
        class: props.class,
        color: props.color,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};
