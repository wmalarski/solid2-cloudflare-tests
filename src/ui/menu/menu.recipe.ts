import { tv } from "tailwind-variants";

export const menuRecipe = tv({
  base: "menu",
  variants: {
    direction: {
      horizontal: "menu-horizontal",
      vertical: "menu-vertical",
    },
    size: {
      lg: "menu-lg",
      md: "menu-md",
      sm: "menu-sm",
      xl: "menu-xl",
      xs: "menu-xs",
    },
  },
});

export const menuItemRecipe = tv({
  variants: {
    behaviour: {
      active: "menu-active",
      disabled: "menu-disabled",
      focus: "menu-focus",
    },
  },
});

export const menuTitleRecipe = tv({
  base: "menu-title",
});

export const menuDropdownRecipe = tv({
  base: "menu-dropdown",
  variants: {
    show: {
      true: "menu-dropdown-show",
    },
  },
});

export const menuDropdownToggleRecipe = tv({
  base: "menu-dropdown-toggle",
  variants: {
    show: {
      true: "menu-dropdown-show",
    },
  },
});
