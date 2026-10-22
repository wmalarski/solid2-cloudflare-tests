import { type Component, omit } from "solid-js";
import { useFieldContext } from "../field/field";
import type { ComponentVariantProps } from "../utils/types";
import { fileInputRecipe } from "./file-input.recipe";

export type FileInputProps = ComponentVariantProps<"input", typeof fileInputRecipe>;

export const FileInput: Component<FileInputProps> = (props) => {
  const field = useFieldContext();
  const withoutVariants = omit(props, "color", "size", "variant", "id", "name");

  return (
    <input
      {...withoutVariants}
      id={props.id ?? field?.id}
      name={props.name ?? field?.name}
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
