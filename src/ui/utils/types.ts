import type { ComponentProps, ValidComponent } from "@solidjs/web";
import type { ClassNameValue } from "tailwind-merge";
import type { VariantProps } from "tailwind-variants";

export type ComponentVariantProps<
  T extends ValidComponent,
  // oxlint-disable-next-line typescript/no-explicit-any
  Component extends (...args: any) => any,
  // oxlint-disable-next-line unicorn/no-abusive-eslint-disable
  // oxlint-disable-next-line typescript/ban-types typescript/no-empty-object-type
  Rest = {},
> = Omit<ComponentProps<T>, keyof VariantProps<Component>> &
  VariantProps<Component> &
  Rest & {
    class?: ClassNameValue;
  };

export type ComponentPropsWithClass<
  T extends ValidComponent,
  // oxlint-disable-next-line unicorn/no-abusive-eslint-disable
  // oxlint-disable-next-line typescript/ban-types typescript/no-empty-object-type
  Rest = {},
> = ComponentProps<T> &
  Rest & {
    class?: ClassNameValue;
  };
