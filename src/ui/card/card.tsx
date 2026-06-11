import { type ComponentProps, Dynamic, type DynamicProps, type ValidComponent } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { cn } from "tailwind-variants";
import type { ComponentVariantProps } from "../utils/types";
import { cardActionsRecipe, cardRecipe, cardTitleRecipe } from "./card.recipe";

export type CardProps = ComponentVariantProps<"div", typeof cardRecipe>;

export const Card: Component<CardProps> = (props) => {
  const withoutVariants = omit(props, "variant", "size", "side", "imageFull");

  return (
    <div
      {...withoutVariants}
      class={cardRecipe({
        class: props.class,
        imageFull: props.imageFull,
        side: props.side,
        size: props.size,
        variant: props.variant,
      })}
    />
  );
};

export type CardTitleProps<T extends ValidComponent> = DynamicProps<T>;

export const CardTitle = <T extends ValidComponent>(props: CardTitleProps<T>) => {
  return (
    <Dynamic
      {...props}
      class={cardTitleRecipe({ class: props.class })}
      component={props.component}
    />
  );
};

export type CardBodyProps = ComponentProps<"div">;

export const CardBody: Component<CardBodyProps> = (props) => {
  return <div {...props} class={cn("card-body", props.class)} />;
};

export type CardActionsProps = ComponentVariantProps<"div", typeof cardActionsRecipe>;

export const CardActions: Component<CardActionsProps> = (props) => {
  const withoutVariants = omit(props, "justify");

  return (
    <div
      {...withoutVariants}
      class={cardActionsRecipe({
        class: props.class,
        justify: props.justify,
      })}
    />
  );
};
