import { type Component, omit } from "solid-js";
import type { ComponentVariantProps } from "../utils/types";
import {
  menuDropdownRecipe,
  menuDropdownToggleRecipe,
  menuItemRecipe,
  menuRecipe,
  menuTitleRecipe,
} from "./menu.recipe";

export type MenuProps = ComponentVariantProps<"ul", typeof menuRecipe>;

export const Menu: Component<MenuProps> = (props) => {
  const withoutVariants = omit(props, "direction", "size");
  return (
    <ul
      {...withoutVariants}
      class={menuRecipe({ class: props.class, direction: props.direction, size: props.size })}
    />
  );
};

export type MenuItemProps = ComponentVariantProps<"li", typeof menuItemRecipe>;

export const MenuItem: Component<MenuItemProps> = (props) => {
  const withoutVariants = omit(props, "behaviour");
  return (
    <li
      {...withoutVariants}
      class={menuItemRecipe({ behaviour: props.behaviour, class: props.class })}
    />
  );
};

export type MenuTitleProps = ComponentVariantProps<"li", typeof menuTitleRecipe>;

export const MenuTitle: Component<MenuTitleProps> = (props) => {
  return <li {...props} class={menuTitleRecipe({ class: props.class })} />;
};

export type MenuDropdownProps = ComponentVariantProps<"ul", typeof menuDropdownRecipe>;

export const MenuDropdown: Component<MenuDropdownProps> = (props) => {
  const withoutVariants = omit(props, "show");
  return (
    <ul {...withoutVariants} class={menuDropdownRecipe({ class: props.class, show: props.show })} />
  );
};

export type MenuDropdownToggleProps = ComponentVariantProps<
  "span",
  typeof menuDropdownToggleRecipe
>;

export const MenuDropdownToggle: Component<MenuDropdownToggleProps> = (props) => {
  const withoutVariants = omit(props, "show");
  return (
    <span
      {...withoutVariants}
      class={menuDropdownToggleRecipe({ class: props.class, show: props.show })}
    />
  );
};
