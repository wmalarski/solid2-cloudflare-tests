import type { ComponentProps } from "@solidjs/web";
import { action, createSignal, createUniqueId, refresh, type Component } from "solid-js";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { TaskFields, taskFieldsSchema } from "./task-fields";
import { parseFormValidationError, transformFormData, type FormIssues } from "~/ui/utils/forms";
import * as v from "valibot";
import { useTasksContext } from "./data-contexts/tasks-context";
import {
  closeDialog,
  Dialog,
  DialogActions,
  DialogBackdrop,
  DialogBox,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/ui/dialog/dialog";
import { PlusIcon } from "~/ui/icons/plus-icon";
import { useI18n } from "~/integrations/i18n";
import { Button } from "~/ui/button/button";
import { parseResponse } from "hono/client";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";

type InsertTaskDialogProps = {
  album: SimplifiedAlbum;
};

export const InsertTaskDialog: Component<InsertTaskDialogProps> = (props) => {
  const { t } = useI18n();

  const formId = createUniqueId();
  const dialogId = createUniqueId();

  const onSubmitStart = () => {
    closeDialog(dialogId);
  };

  return (
    <>
      <DialogTrigger color="primary" size="sm" for={dialogId}>
        <PlusIcon class="size-4" />
        {t("currentlyPlaying.addTask.trigger")}
      </DialogTrigger>
      <Dialog id={dialogId}>
        <DialogBox>
          <DialogTitle>{t("currentlyPlaying.addTask.title")}</DialogTitle>
          <DialogDescription>{t("currentlyPlaying.addTask.description")}</DialogDescription>
          <InsertTaskForm album={props.album} formId={formId} onSubmitStart={onSubmitStart} />
          <DialogActions>
            <DialogClose />
            <Button color="primary" form={formId} type="submit">
              {t("common.save")}
            </Button>
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
    </>
  );
};

type InsertTaskFormProps = {
  formId: string;
  album: SimplifiedAlbum;
  onSubmitStart: () => void;
};

const InsertTaskForm: Component<InsertTaskFormProps> = (props) => {
  const honoClient = useHonoClientContext();
  const tasksContext = useTasksContext();

  const [issues, setIssues] = createSignal<FormIssues>();

  const onSubmit: ComponentProps<"form">["onSubmit"] = action(function* (event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = v.safeParse(
      transformFormData(taskFieldsSchema, { numbers: ["rate"] }),
      formData,
    );

    if (!parsed.success) {
      setIssues(parseFormValidationError(parsed.issues));
      return;
    }

    tasksContext.insertAlbumAsTask(props.album);

    props.onSubmitStart();

    yield parseResponse(
      honoClient.api.tasks.$post({
        json: { albumId: props.album.id, ...parsed.output },
      }),
    );

    const status = parsed.output.status;
    const tasksColumn = tasksContext.columns[status];
    refresh(tasksColumn.resource);
    tasksColumn.setPage(0);
  });

  return (
    <form onSubmit={onSubmit} id={props.formId}>
      <TaskFields issues={issues()} />
    </form>
  );
};
