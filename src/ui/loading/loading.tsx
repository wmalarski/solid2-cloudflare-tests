import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { loadingRecipe } from "./loading.recipe";

const buttonOmit = ["size"] as const;

export type LoadingProps = ComponentVariantProps<"span", typeof loadingRecipe>;

export const Loading: Component<LoadingProps> = (props) => {
  const withoutVariants = omit(props, ...buttonOmit);

  return (
    <span
      {...withoutVariants}
      class={loadingRecipe({
        class: props.class,
        size: props.size,
      })}
    />
  );
};
