import { Dynamic } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { AlertCircleIcon } from "../icons/alert-circle-icon";
import { CheckCircleIcon } from "../icons/check-circle-icon";
import { InfoIcon } from "../icons/info-icon";
import { XCircleIcon } from "../icons/x-circle-icon";
import type { ComponentVariantProps } from "../utils/types";
import { alertRecipe } from "./alert.recipe";

export type AlertProps = ComponentVariantProps<"div", typeof alertRecipe>;

export const Alert: Component<AlertProps> = (props) => {
  const withoutVariants = omit(props, "variant", "color", "direction");

  return (
    <div
      role="alert"
      {...withoutVariants}
      class={alertRecipe({
        class: props.class,
        color: props.color,
        direction: props.direction,
        variant: props.variant,
      })}
    />
  );
};

const alertIconMap: Record<"error" | "info" | "success" | "warning", typeof CheckCircleIcon> = {
  error: XCircleIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertCircleIcon,
};

export type AlertIconProps = {
  variant: keyof typeof alertIconMap;
};

export const AlertIcon: Component<AlertIconProps> = (props) => {
  const component = () => {
    return alertIconMap[props.variant];
  };
  return <Dynamic class="size-6 shrink-0 stroke-current" component={component()} />;
};
