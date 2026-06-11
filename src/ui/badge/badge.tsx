import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { badgeRecipe } from "./badge.recipe";

export type BadgeProps = ComponentVariantProps<"div", typeof badgeRecipe>;

export const Badge: Component<BadgeProps> = (props) => {
  const withoutVariants = omit(props, "size", "color", "style");

  return (
    <div
      {...withoutVariants}
      class={badgeRecipe({
        class: props.class,
        color: props.color,
        size: props.size,
        style: props.style,
      })}
    />
  );
};
