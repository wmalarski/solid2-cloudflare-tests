import { type Component } from "solid-js";
import * as v from "valibot";
import { useI18n } from "~/integrations/i18n";
import { FieldError } from "~/ui/field-error/field-error";
import { Fieldset, FieldsetLabel } from "~/ui/fieldset/fieldset";
import { FormError } from "~/ui/form-error/form-error";
import { Input } from "~/ui/input/input";
import { getInvalidStateProps, type FormIssues } from "~/ui/utils/forms";
import type { SelectTodosItem } from "./routes/types";
import { Select } from "~/ui/select/select";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "./constansts";
import { taskStatusSchema } from "./validation";

export const taskFieldsSchema = v.object({
  note: v.string(),
  rate: v.pipe(
    v.nullable(v.number()),
    v.transform((value) => value ?? undefined),
  ),
  status: taskStatusSchema,
});

type TaskFieldsProps = {
  pending?: boolean;
  issues?: FormIssues;
  initialValues?: SelectTodosItem;
};

export const TaskFields: Component<TaskFieldsProps> = (props) => {
  const { t } = useI18n();

  return (
    <Fieldset>
      <FormError message={props.issues?.error} />

      <FieldsetLabel for="note">{t("task.note")}</FieldsetLabel>
      <Input
        disabled={props.pending}
        id="note"
        name="note"
        width="full"
        value={props.initialValues?.note ?? ""}
        {...getInvalidStateProps({
          errorMessageId: "note-error",
          isInvalid: Boolean(props.issues?.errors?.note),
        })}
      />
      <FieldError id="note-error" message={props.issues?.errors?.note} />

      <FieldsetLabel for="rate">{t("task.rate")}</FieldsetLabel>
      <Input
        disabled={props.pending}
        id="rate"
        name="rate"
        type="number"
        min="0"
        max="10"
        step="0.1"
        width="full"
        value={props.initialValues?.rate ?? ""}
        {...getInvalidStateProps({
          errorMessageId: "rate-error",
          isInvalid: Boolean(props.issues?.errors?.rate),
        })}
      />
      <FieldError id="rate-error" message={props.issues?.errors?.rate} />

      <FieldsetLabel for="status">{t("task.status")}</FieldsetLabel>
      <Select
        disabled={props.pending}
        id="status"
        name="status"
        required={true}
        class="w-full"
        value={props.initialValues?.status ?? STATUS_IN_PROGRESS}
        {...getInvalidStateProps({
          errorMessageId: "status-error",
          isInvalid: Boolean(props.issues?.errors?.status),
        })}
      >
        <option value={STATUS_NEW}>{t("task.statuses.new")}</option>
        <option value={STATUS_IN_PROGRESS}>{t("task.statuses.inProgress")}</option>
        <option value={STATUS_REVIEWED}>{t("task.statuses.reviewed")}</option>
      </Select>
      <FieldError id="status-error" message={props.issues?.errors?.status} />
    </Fieldset>
  );
};
