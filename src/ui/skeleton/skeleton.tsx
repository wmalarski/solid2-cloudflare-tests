import { type Component } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { skeletonRecipe } from "./skeleton.recipe";

export type SkeletonProps = ComponentVariantProps<"div", typeof skeletonRecipe>;

export const Skeleton: Component<SkeletonProps> = (props) => {
  return <div {...props} class={skeletonRecipe({ class: props.class })} />;
};
