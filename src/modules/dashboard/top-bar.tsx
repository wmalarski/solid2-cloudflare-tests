import type { ComponentProps } from "@solidjs/web";
import { createUniqueId, refresh, type Component } from "solid-js";
import { useAuthContext } from "~/integrations/better-auth/auth-context";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { TaskFields, taskFieldsSchema } from "./task-fields";
import { transformFormData } from "~/ui/utils/forms";
import * as v from "valibot";
import { useTasksContext } from "./data-contexts/tasks-context";
import { useCurrentlyPlayingContext } from "./data-contexts/currently-playing-context";
import {
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

export const TopBar: Component = () => {
  const authContext = useAuthContext();

  return (
    <>
      <pre>{JSON.stringify(authContext, null, 2)}</pre>
      <CurrentlyPlayingSection />
    </>
  );
};

const CurrentlyPlayingSection: Component = () => {
  const currentlyPlayingContext = useCurrentlyPlayingContext();

  return (
    <>
      <pre>{JSON.stringify(currentlyPlayingContext(), null, 2)}</pre>
      <InsertCurrentlyPlayingTaskDialog albumId={currentlyPlayingContext().item.id} />
    </>
  );
};

type InsertCurrentlyPlayingTaskDialogProps = {
  albumId: string;
};

const InsertCurrentlyPlayingTaskDialog: Component<InsertCurrentlyPlayingTaskDialogProps> = (
  props,
) => {
  const { t } = useI18n();

  const formId = createUniqueId();
  const dialogId = createUniqueId();

  return (
    <>
      <DialogTrigger color="primary" for={dialogId}>
        <PlusIcon class="size-4" />
        {t("currentlyPlaying.addTask.trigger")}
      </DialogTrigger>
      <Dialog id={dialogId}>
        <DialogBox>
          <DialogTitle>{t("currentlyPlaying.addTask.title")}</DialogTitle>
          <DialogDescription>{t("currentlyPlaying.addTask.description")}</DialogDescription>
          <InsertCurrentlyPlayingTaskForm albumId={props.albumId} formId={formId} />
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

type InsertCurrentlyPlayingTaskFormProps = {
  formId: string;
  albumId: string;
};

const InsertCurrentlyPlayingTaskForm: Component<InsertCurrentlyPlayingTaskFormProps> = (props) => {
  const honoClient = useHonoClientContext();
  const tasksContext = useTasksContext();

  const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = v.safeParse(
      transformFormData(taskFieldsSchema, { numbers: ["rate"] }),
      formData,
    );

    if (!result.success) {
      return;
    }

    await honoClient.api.tasks.$post({ json: { albumId: props.albumId, ...result.output } });

    const tasksColumn = tasksContext[result.output.status];
    refresh(tasksColumn.resource);
    tasksColumn.setPage(0);
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" value={props.albumId} name="albumId" />
      <TaskFields />
    </form>
  );
};
