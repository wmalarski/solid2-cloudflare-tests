import {
  action,
  createSignal,
  createUniqueId,
  For,
  refresh,
  Repeat,
  type Component,
} from "solid-js";
import type { TaskStatus } from "./validation";
import { useTasksContext, type TaskResourceItem } from "./data-contexts/tasks-context";
import { BOOKMARK_STATUSES } from "./constansts";
import { Card, CardActions, CardBody, CardDescription, CardTitle } from "~/ui/card/card";
import { AlertDialog } from "~/ui/alert-dialog/alert-dialog";
import { useI18n } from "~/integrations/i18n";
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
import { TrashIcon } from "~/ui/icons/trash-icon";
import { parseResponse } from "hono/client";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { AlbumImage } from "./album-card-fragments";
import { parseImages, parseSimplifiedArtist } from "./parsers";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";
import * as v from "valibot";
import { TaskFields, taskFieldsSchema } from "./task-fields";
import { parseFormValidationError, transformFormData, type FormIssues } from "~/ui/utils/forms";
import type { ComponentProps } from "@solidjs/web";
import { PencilIcon } from "~/ui/icons/pencil-icon";
import { Button } from "~/ui/button/button";
import { createDateFormatter } from "~/integrations/i18n/create-date-formatter";
import { useStatusTranslations } from "./use-status-translations";
import { InfoRowContainer, InfoRowItem } from "~/ui/info-row/info-row";
import { TaskDetailsDialog } from "./details-dialog";
import { StartTaskPlaybackButton } from "./start-playback-button";
import { Skeleton } from "~/ui/skeleton/skeleton";

export const TasksBoard: Component = () => {
  return (
    <div class="grid grid-cols-3 p-4 max-w-full overflow-auto">
      <For each={BOOKMARK_STATUSES}>{(status) => <TasksColumn status={status} />}</For>
    </div>
  );
};

type TasksColumnProps = {
  status: TaskStatus;
};

const TasksColumn: Component<TasksColumnProps> = (props) => {
  const tasksContext = useTasksContext();

  const statusTranslations = useStatusTranslations();

  return (
    <div class="flex flex-col gap-4">
      <h2>{statusTranslations(props.status)}</h2>
      <pre>{JSON.stringify({ page: tasksContext.columns[props.status].page }, null, 2)}</pre>
      <ul class="flex flex-col gap-4">
        <TaskColumnFragment tasks={tasksContext.columns[props.status].resource} />
        <SkeletonFragment />
      </ul>
    </div>
  );
};

type TaskColumnFragmentProps = {
  tasks: readonly TaskResourceItem[];
};

const TaskColumnFragment: Component<TaskColumnFragmentProps> = (props) => {
  return <For each={props.tasks}>{(task) => <TaskColumnItem task={task} />}</For>;
};

type TaskColumnItemProps = {
  task: TaskResourceItem;
};

const TaskColumnItem: Component<TaskColumnItemProps> = (props) => {
  const { t } = useI18n();

  const artistsNamesFormatter = createArtistsNamesFormatter();
  const dateFormatter = createDateFormatter();

  return (
    <li class="w-75">
      <Card>
        <AlbumImage images={parseImages(props.task.preview)} size={300} />
        <CardBody>
          <CardTitle component="span">{props.task.title}</CardTitle>
          <CardDescription>
            {artistsNamesFormatter(parseSimplifiedArtist(props.task.spotifyArtists))}
          </CardDescription>
          <InfoRowContainer class="pb-5">
            <InfoRowItem
              name={t("task.releaseDate")}
              value={props.task.releaseDate ? dateFormatter(props.task.releaseDate) : undefined}
            />
            <InfoRowItem name={t("task.note")} value={props.task.note ?? undefined} />
            <InfoRowItem
              name={t("task.rate")}
              value={props.task.rate !== null ? String(props.task.rate) : undefined}
            />
            <InfoRowItem name={t("task.doneAt")} value={props.task.doneAt ?? undefined} />
          </InfoRowContainer>
          <CardActions>
            <StartTaskPlaybackButton task={props.task} />
            <UpdateTaskDialog task={props.task} />
            <DeleteTaskDialog task={props.task} />
            <TaskDetailsDialog task={props.task} />
          </CardActions>
        </CardBody>
      </Card>
    </li>
  );
};

type DeleteTaskDialogProps = {
  task: TaskResourceItem;
};

const DeleteTaskDialog: Component<DeleteTaskDialogProps> = (props) => {
  const { t } = useI18n();

  const dialogId = createUniqueId();

  const honoClient = useHonoClientContext();
  const tasksContext = useTasksContext();

  const onSave = action(function* () {
    const status = props.task.status as TaskStatus;
    tasksContext.deleteTask(status, props.task.id);

    closeDialog(dialogId);

    yield parseResponse(
      honoClient.api.tasks[":taskId"].$delete({
        param: { taskId: props.task.id },
      }),
    );

    const tasksColumn = tasksContext.columns[status];
    refresh(tasksColumn.resource);
    tasksColumn.setPage(0);
  });

  return (
    <>
      <DialogTrigger color="warning" size="sm" for={dialogId}>
        <TrashIcon class="size-4" />
        {t("common.delete")}
      </DialogTrigger>
      <AlertDialog
        dialogId={dialogId}
        description={t("task.delete.description")}
        title={t("task.delete.title")}
        onSave={onSave}
        submitColor="warning"
        submitLabel={t("common.delete")}
      />
    </>
  );
};

type UpdateTaskDialogProps = {
  task: TaskResourceItem;
};

const UpdateTaskDialog: Component<UpdateTaskDialogProps> = (props) => {
  const { t } = useI18n();

  const formId = createUniqueId();
  const dialogId = createUniqueId();

  const onSuccess = () => {
    closeDialog(dialogId);
  };

  return (
    <>
      <DialogTrigger color="secondary" size="sm" for={dialogId}>
        <PencilIcon class="size-4" />
        {t("common.update")}
      </DialogTrigger>
      <Dialog id={dialogId}>
        <DialogBox>
          <DialogTitle>{t("task.update.title")}</DialogTitle>
          <DialogDescription>{t("task.update.description")}</DialogDescription>
          <UpdateTaskForm onSuccess={onSuccess} task={props.task} formId={formId} />
          <DialogActions>
            <DialogClose />
            <Button color="primary" form={formId} type="submit">
              {t("common.update")}
            </Button>
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
    </>
  );
};

type UpdateTaskFormProps = {
  formId: string;
  task: TaskResourceItem;
  onSuccess: () => void;
};

const UpdateTaskForm: Component<UpdateTaskFormProps> = (props) => {
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

    const status = props.task.status as TaskStatus;
    tasksContext.updateTask(status, { ...parsed.output, taskId: props.task.id });

    yield parseResponse(
      honoClient.api.tasks[":taskId"].$put({
        param: { taskId: props.task.id },
        json: parsed.output,
      }),
    );

    props.onSuccess();

    const tasksColumn = tasksContext.columns[status];
    refresh(tasksColumn.resource);
    tasksColumn.setPage(0);

    if (status !== parsed.output.status) {
      const tasksColumn = tasksContext.columns[parsed.output.status];
      refresh(tasksColumn.resource);
      tasksColumn.setPage(0);
    }
  });

  return (
    <form onSubmit={onSubmit} id={props.formId}>
      <TaskFields initialValues={props.task} issues={issues()} />
    </form>
  );
};

const SkeletonFragment: Component = () => {
  return <Repeat count={4}>{() => <SkeletonItem />}</Repeat>;
};

const SkeletonItem: Component = () => {
  return (
    <li class="w-75">
      <Card>
        <Skeleton class="h-75" />
        <CardBody>
          <Skeleton class="h-7" />
          <Skeleton class="h-5" />
          <Skeleton class="h-5 pb-5" />
          <CardActions class="pt-5">
            <Skeleton class="h-8 w-19" />
            <Skeleton class="h-8 w-21" />
            <Skeleton class="h-8 w-21" />
            <Skeleton class="h-8 w-19" />
          </CardActions>
        </CardBody>
      </Card>
    </li>
  );
};
