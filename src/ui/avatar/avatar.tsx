import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import { avatarContentRecipe, avatarGroupRecipe, avatarRecipe } from "./avatar.recipe";

export type AvatarProps = ComponentVariantProps<"div", typeof avatarRecipe>;

export const Avatar: Component<AvatarProps> = (props) => {
  const withoutVariants = omit(props, "offline", "online", "placeholder");

  return (
    <div
      {...withoutVariants}
      class={avatarRecipe({
        class: props.class,
        offline: props.offline,
        online: props.online,
        placeholder: props.placeholder,
      })}
    />
  );
};

export type AvatarContentProps = ComponentVariantProps<"div", typeof avatarContentRecipe>;

export const AvatarContent: Component<AvatarContentProps> = (props) => {
  return <div {...props} class={avatarContentRecipe({ class: props.class })} />;
};

export type AvatarGroupProps = ComponentVariantProps<"div", typeof avatarGroupRecipe>;

export const AvatarGroup: Component<AvatarGroupProps> = (props) => {
  return <div {...props} class={avatarGroupRecipe({ class: props.class })} />;
};
