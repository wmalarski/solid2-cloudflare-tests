import { tv } from "tailwind-variants";

export const selectRecipe = tv({
  base: "select",
  defaultVariants: {},
  variants: {
    color: {
      accent: "select-accent",
      error: "select-error",
      info: "select-info",
      primary: "select-primary",
      secondary: "select-secondary",
      success: "select-success",
      warning: "select-warning",
    },
    size: {
      lg: "select-lg",
      md: "select-md",
      sm: "select-sm",
      xs: "select-xs",
    },
    variant: {
      ghost: "select-ghost",
    },
  },
});
