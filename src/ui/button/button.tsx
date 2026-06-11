import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { buttonRecipe } from "./button.recipe";

const buttonOmit = ["behaviour", "color", "isLoading", "shape", "size", "variant"] as const;

export type ButtonProps = ComponentVariantProps<"button", typeof buttonRecipe>;

export const Button: Component<ButtonProps> = (props) => {
  const withoutVariants = omit(props, ...buttonOmit);

  return (
    <button
      {...withoutVariants}
      class={buttonRecipe({
        behaviour: props.behaviour,
        class: props.class,
        color: props.color,
        isLoading: props.isLoading,
        shape: props.shape,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};
