import {
  action,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  isPending,
  Loading,
  Repeat,
  Show,
  type Component,
} from "solid-js";
import type { TaskStatus } from "./validation";
import {
  useTasksContext,
  type TaskResourceItem,
  type TasksColumnResource,
} from "./data-contexts/tasks-context";
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
    <div class="grid grid-cols-[auto_auto_auto] p-4 max-w-full overflow-auto items-stretch gap-2">
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

  const tasksColumn = () => tasksContext.columns[props.status];

  const headingId = createUniqueId();

  return (
    <div class="flex flex-col gap-4 not-last:border-r-2 border-base-300 p-4">
      <h2 id={headingId} class="text-md uppercase text-center">
        {statusTranslations(props.status)}
      </h2>
      <Loading fallback={<SkeletonFragment />}>
        <TaskColumnFragment tasks={tasksColumn().resource.items} />
        <ColumnLoadMore column={tasksColumn()} labelledBy={headingId} />
      </Loading>
    </div>
  );
};

type ColumnLoadMoreProps = {
  column: TasksColumnResource;
  labelledBy: string;
};

const ColumnLoadMore: Component<ColumnLoadMoreProps> = (props) => {
  const { t } = useI18n();

  const isLoading = createMemo(() => isPending(() => props.column.resource.items));

  return (
    <Show when={props.column.resource.hasNext}>
      <div class="flex justify-center" role="group" aria-labelledby={props.labelledBy}>
        <Button
          disabled={isLoading()}
          isLoading={isLoading()}
          onClick={props.column.loadMore}
          size="sm"
          variant="outline"
        >
          {t("common.loadMore")}
        </Button>
      </div>
    </Show>
  );
};

type TaskColumnFragmentProps = {
  tasks: readonly TaskResourceItem[];
};

const TaskColumnFragment: Component<TaskColumnFragmentProps> = (props) => {
  return (
    <ul class="flex flex-row flex-wrap gap-4">
      <For each={props.tasks} keyed={(task) => task.id}>
        {(task) => <TaskColumnItem task={task()} />}
      </For>
    </ul>
  );
};

type TaskColumnItemProps = {
  task: TaskResourceItem;
};

const TaskColumnItem: Component<TaskColumnItemProps> = (props) => {
  const { t } = useI18n();

  const artistsNamesFormatter = createArtistsNamesFormatter();
  const dateFormatter = createDateFormatter();

  return (
    <li class="min-w-xl w-full">
      <Card side>
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
    yield tasksColumn.reload();
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
          <UpdateTaskForm onSubmitStart={onSuccess} task={props.task} formId={formId} />
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
  onSubmitStart: () => void;
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
    props.onSubmitStart();

    yield parseResponse(
      honoClient.api.tasks[":taskId"].$put({
        param: { taskId: props.task.id },
        json: parsed.output,
      }),
    );

    yield tasksContext.columns[status].reload();

    if (status !== parsed.output.status) {
      yield tasksContext.columns[parsed.output.status].reload();
    }
  });

  return (
    <form onSubmit={onSubmit} id={props.formId}>
      <TaskFields initialValues={props.task} issues={issues()} />
    </form>
  );
};

const SkeletonFragment: Component = () => {
  return (
    <ul class="flex flex-row flex-wrap gap-4">
      <Repeat count={4}>{() => <SkeletonItem />}</Repeat>
    </ul>
  );
};

const SkeletonItem: Component = () => {
  return (
    <li class="min-w-xl w-full">
      <Card side>
        <Skeleton class="h-75 w-75 min-w-72" />
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
