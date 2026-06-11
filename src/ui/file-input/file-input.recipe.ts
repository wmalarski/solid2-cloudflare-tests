import { tv } from "tailwind-variants";

export const fileInputRecipe = tv({
  base: "file-input",
  variants: {
    color: {
      accent: "file-input-accent",
      error: "file-input-error",
      info: "file-input-info",
      neutral: "file-input-neutral",
      primary: "file-input-primary",
      secondary: "file-input-secondary",
      success: "file-input-success",
      warning: "file-input-warning",
    },
    size: {
      lg: "file-input-lg",
      md: "file-input-md",
      sm: "file-input-sm",
      xl: "file-input-xl",
      xs: "file-input-xs",
    },
    variant: {
      ghost: "file-input-ghost",
    },
  },
});
