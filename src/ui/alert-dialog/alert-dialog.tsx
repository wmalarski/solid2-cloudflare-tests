import type { Component } from "solid-js";
import { useI18n } from "~/integrations/i18n";
import { Button, type ButtonProps } from "../button/button";
import {
  Dialog,
  DialogActions,
  DialogBackdrop,
  DialogBox,
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "../dialog/dialog";

type AlertDialogProps = {
  description: string;
  dialogId: string;
  formId?: string;
  onClose?: () => void;
  onSave?: () => void;
  open?: boolean;
  title: string;
  isLoading?: boolean;
  submitColor?: ButtonProps["color"];
  submitLabel?: string;
};

export const AlertDialog: Component<AlertDialogProps> = (props) => {
  const { t } = useI18n();

  return (
    <Dialog open={props.open} onClose={props.onClose} id={props.dialogId}>
      <DialogBox>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogDescription>{props.description}</DialogDescription>
        <DialogActions>
          <DialogClose />
          <Button
            color={props.submitColor ?? "primary"}
            form={props.formId}
            onClick={props.onSave}
            type={props.onSave ? "button" : "submit"}
            isLoading={props.isLoading}
          >
            {props.submitLabel ?? t("common.save")}
          </Button>
        </DialogActions>
      </DialogBox>
      <DialogBackdrop />
    </Dialog>
  );
};
