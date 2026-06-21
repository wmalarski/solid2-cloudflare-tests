import type { ComponentProps } from "@solidjs/web";
import { Show, type Component } from "solid-js";
import { cx } from "tailwind-variants";

type InfoRowItemProps = {
  name: string;
  value?: string;
};

export const InfoRowItem: Component<InfoRowItemProps> = (props) => {
  return (
    <Show when={props.value && props.value.length > 0}>
      <span class="font-semibold">{props.name}</span>
      <span class="opacity-60">{props.value}</span>
    </Show>
  );
};

type InfoRowContainerProps = ComponentProps<"div">;

export const InfoRowContainer: Component<InfoRowContainerProps> = (props) => {
  return <div {...props} class={cx("grid grid-cols-2 gap-2", props.class)} />;
};
