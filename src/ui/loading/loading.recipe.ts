import { tv } from "tailwind-variants";

export const loadingRecipe = tv({
  base: "loading loading-spinner",
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "loading-lg",
      md: "loading-md",
      sm: "loading-sm",
      xl: "loading-xl",
      xs: "loading-xs",
    },
  },
});
