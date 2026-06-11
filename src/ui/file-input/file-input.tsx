import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { fileInputRecipe } from "./file-input.recipe";

export type FileInputProps = ComponentVariantProps<"input", typeof fileInputRecipe>;

export const FileInput: Component<FileInputProps> = (props) => {
  const withoutVariants = omit(props, "color", "size", "variant");

  return (
    <input
      {...withoutVariants}
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
