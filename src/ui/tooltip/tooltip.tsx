import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { tooltipContentRecipe, tooltipRecipe } from "./tooltip.recipe";

export type TooltipProps = ComponentVariantProps<"div", typeof tooltipRecipe>;

export const Tooltip: Component<TooltipProps> = (props) => {
  const withoutVariants = omit(props, "color", "open", "placement");

  return (
    <div
      {...withoutVariants}
      class={tooltipRecipe({
        class: props.class,
        color: props.color,
        open: props.open,
        placement: props.placement,
      })}
    />
  );
};

export type TooltipContentProps = ComponentVariantProps<"div", typeof tooltipContentRecipe>;

export const TooltipContent: Component<TooltipContentProps> = (props) => {
  return <div {...props} class={tooltipContentRecipe({ class: props.class })} />;
};
