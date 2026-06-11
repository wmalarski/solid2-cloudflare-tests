import type { ComponentProps } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useI18n } from "~/integrations/i18n";
import { Button } from "../button/button";
import type { ComponentPropsWithClass, ComponentVariantProps } from "../utils/types";
import {
  modalActionRecipe,
  modalBackdropRecipe,
  modalBoxRecipe,
  modalDescriptionRecipe,
  modalRecipe,
  modalTitleRecipe,
} from "./dialog.recipe";

export const closeDialog = (dialogId: string) => {
  document.querySelector<HTMLDialogElement>(`#${dialogId}`)?.close();
};

export const openDialog = (dialogId: string) => {
  const id = `#${dialogId}`;
  const dialog = document.querySelector<HTMLDialogElement>(id);
  dialog?.showModal();
};

export type DialogProps = ComponentVariantProps<"dialog", typeof modalRecipe, { id: string }>;

export const Dialog: Component<DialogProps> = (props) => {
  const withoutVariants = omit(props, "open", "horizontal", "vertical");
  return (
    <dialog
      {...withoutVariants}
      style={{ transition: "none" }}
      class={modalRecipe({
        class: props.class,
        horizontal: props.horizontal,
        open: props.open,
        vertical: props.vertical,
      })}
    />
  );
};

export type DialogTriggerProps = ComponentPropsWithClass<
  typeof Button,
  {
    for: string;
    onClick?: (event: MouseEvent) => void;
  }
>;

export const DialogTrigger: Component<DialogTriggerProps> = (props) => {
  const withoutFor = omit(props, "for", "onClick");

  const onClick: ComponentProps<"button">["onClick"] = (event) => {
    props.onClick?.(event);
    openDialog(props.for);
  };

  return <Button {...withoutFor} onClick={onClick} type="button" />;
};

export type DialogBoxProps = ComponentPropsWithClass<"div">;

export const DialogBox: Component<DialogBoxProps> = (props) => {
  return <div {...props} class={modalBoxRecipe({ class: props.class })} />;
};

export type DialogTitleProps = ComponentPropsWithClass<"h3">;

export const DialogTitle: Component<DialogTitleProps> = (props) => {
  // oxlint-disable-next-line heading-has-content
  return <h3 {...props} class={modalTitleRecipe({ class: props.class })} />;
};

export type DialogDescriptionProps = ComponentPropsWithClass<"p">;

export const DialogDescription: Component<DialogDescriptionProps> = (props) => {
  return <p {...props} class={modalDescriptionRecipe({ class: props.class })} />;
};

export type DialogBackdropProps = Record<string, never>;

export const DialogBackdrop: Component<DialogBackdropProps> = (props) => {
  const { t } = useI18n();

  return (
    <form class={modalBackdropRecipe({ class: props.class })} method="dialog">
      <button type="submit">{t("common.closeDialog")}</button>
    </form>
  );
};

export type DialogCloseProps = Omit<ComponentPropsWithClass<typeof Button>, "children">;

export const DialogClose: Component<DialogCloseProps> = (props) => {
  const { t } = useI18n();

  return (
    <form method="dialog">
      <Button {...props}>{t("common.closeDialog")}</Button>
    </form>
  );
};

export type DialogActionsProps = ComponentPropsWithClass<"div">;

export const DialogActions: Component<DialogActionsProps> = (props) => {
  return <div {...props} class={modalActionRecipe({ class: props.class })} />;
};
