import { type Component, omit } from "solid-js";
import { useFieldContext } from "../field/field";
import type { ComponentVariantProps } from "../utils/types";
import { fileInputRecipe } from "./file-input.recipe";
import { createInvalidFieldProps } from "../field/create-invalid-field-props";

export type FileInputProps = ComponentVariantProps<"input", typeof fileInputRecipe>;

export const FileInput: Component<FileInputProps> = (props) => {
  const field = useFieldContext();
  const withoutVariants = omit(props, "color", "size", "variant", "id", "name");

  const invalidStateProps = createInvalidFieldProps();

  return (
    <input
      {...withoutVariants}
      id={props.id ?? field?.id}
      name={props.name ?? field?.name}
      {...invalidStateProps()}
      type="file"
      class={fileInputRecipe({
        class: props.class,
        color: props.color,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};
