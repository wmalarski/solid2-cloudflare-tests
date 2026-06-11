import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { linkRecipe } from "./link.recipe";

export type LinkProps = ComponentVariantProps<"a", typeof linkRecipe>;

export const Link: Component<LinkProps> = (props) => {
  const withoutVariants = omit(props, "color", "hover", "size");

  return (
    // oxlint-disable-next-line jsx_a11y/anchor-has-content
    <a
      {...withoutVariants}
      class={linkRecipe({
        class: props.class,
        color: props.color,
        hover: props.hover,
        size: props.size,
      })}
    />
  );
};
