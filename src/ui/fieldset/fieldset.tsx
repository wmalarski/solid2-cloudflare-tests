import { type Component, omit } from "solid-js";
import { useFieldContext } from "../field/field";
import type { ComponentVariantProps } from "../utils/types";
import { fieldsetLabelRecipe, fieldsetLegendRecipe, fieldsetRecipe } from "./fieldset.recipe";

type FieldsetProps = ComponentVariantProps<"fieldset", typeof fieldsetRecipe>;

export const Fieldset: Component<FieldsetProps> = (props) => {
  return <fieldset {...props} class={fieldsetRecipe({ class: props.class })} />;
};

type FieldsetLabelProps = ComponentVariantProps<"label", typeof fieldsetLabelRecipe>;

export const FieldsetLabel: Component<FieldsetLabelProps> = (props) => {
  const field = useFieldContext();
  const withoutFieldProps = omit(props, "for");

  return (
    // oxlint-disable-next-line label-has-associated-control
    <label
      {...withoutFieldProps}
      for={props.for ?? field?.id}
      class={fieldsetLabelRecipe({ class: props.class })}
    />
  );
};

type FieldsetLegendProps = ComponentVariantProps<"legend", typeof fieldsetLegendRecipe>;

export const FieldsetLegend: Component<FieldsetLegendProps> = (props) => {
  return <legend {...props} class={fieldsetLegendRecipe({ class: props.class })} />;
};
