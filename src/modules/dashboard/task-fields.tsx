import { For, type Component } from "solid-js";
import * as v from "valibot";
import { useI18n } from "~/integrations/i18n";
import { FieldError } from "~/ui/field-error/field-error";
import { FieldRoot } from "~/ui/field/field";
import { Fieldset, FieldsetLabel } from "~/ui/fieldset/fieldset";
import { FormError } from "~/ui/form-error/form-error";
import { Input } from "~/ui/input/input";
import { type FormIssues } from "~/ui/utils/forms";
import type { SelectTasksItem } from "./routes/types";
import { Select } from "~/ui/select/select";
import { BOOKMARK_STATUSES, STATUS_IN_PROGRESS } from "./constansts";
import { taskStatusSchema } from "./validation";
import { useStatusTranslations } from "./use-status-translations";

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
  initialValues?: SelectTasksItem;
};

export const TaskFields: Component<TaskFieldsProps> = (props) => {
  const { t } = useI18n();

  const statusTranslations = useStatusTranslations();

  return (
    <Fieldset>
      <FormError message={props.issues?.error} />

      <FieldRoot name="note" isInvalid={Boolean(props.issues?.errors?.note)}>
        <FieldsetLabel>{t("task.note")}</FieldsetLabel>
        <Input disabled={props.pending} width="full" value={props.initialValues?.note ?? ""} />
        <FieldError message={props.issues?.errors?.note} />
      </FieldRoot>

      <FieldRoot name="rate" isInvalid={Boolean(props.issues?.errors?.rate)}>
        <FieldsetLabel>{t("task.rate")}</FieldsetLabel>
        <Input
          disabled={props.pending}
          type="number"
          min="0"
          max="10"
          step="0.1"
          width="full"
          value={props.initialValues?.rate ?? ""}
        />
        <FieldError message={props.issues?.errors?.rate} />
      </FieldRoot>

      <FieldRoot name="status" isInvalid={Boolean(props.issues?.errors?.status)}>
        <FieldsetLabel>{t("task.status")}</FieldsetLabel>
        <Select
          disabled={props.pending}
          required={true}
          class="w-full"
          value={props.initialValues?.status ?? STATUS_IN_PROGRESS}
        >
          <For each={BOOKMARK_STATUSES}>
            {(status) => <option value={status}>{statusTranslations(status)}</option>}
          </For>
        </Select>
        <FieldError message={props.issues?.errors?.status} />
      </FieldRoot>
    </Fieldset>
  );
};
