import {
  action,
  createMemo,
  createOptimistic,
  createUniqueId,
  For,
  isPending,
  refresh,
  type Component,
} from "solid-js";
import type { TaskStatus } from "./validation";
import { useTasksContext, type TaskResourceItem } from "./data-contexts/tasks-context";
import { BOOKMARK_STATUSES } from "./constansts";
import { Card, CardActions, CardBody, CardDescription, CardTitle } from "~/ui/card/card";
import { AlertDialog } from "~/ui/alert-dialog/alert-dialog";
import { useI18n } from "~/integrations/i18n";
import { closeDialog, DialogTrigger } from "~/ui/dialog/dialog";
import { TrashIcon } from "~/ui/icons/trash-icon";
import { parseResponse } from "hono/client";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { AlbumImage } from "./album-image";
import { parseImages, parseSimplifiedArtist } from "./parsers";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";

export const TasksBoard: Component = () => {
  return (
    <>
      <For each={BOOKMARK_STATUSES}>{(status) => <TasksColumn status={status} />}</For>
    </>
  );
};

type TasksColumnProps = {
  status: TaskStatus;
};

const TasksColumn: Component<TasksColumnProps> = (props) => {
  const tasksContext = useTasksContext();

  return (
    <>
      <pre>
        {JSON.stringify(
          {
            page: tasksContext[props.status].page,
          },
          null,
          2,
        )}
      </pre>
      <ul>
        <TaskColumnFragment tasks={tasksContext[props.status].resource()} />
      </ul>
    </>
  );
};

type TaskColumnFragmentrops = {
  tasks: TaskResourceItem[];
};

const TaskColumnFragment: Component<TaskColumnFragmentrops> = (props) => {
  return <For each={props.tasks}>{(task) => <TaskColumnItem task={task} />}</For>;
};

type TaskColumnItemProps = {
  task: TaskResourceItem;
};

const TaskColumnItem: Component<TaskColumnItemProps> = (props) => {
  const artistsNamesFormatter = createArtistsNamesFormatter();

  return (
    <li>
      <Card>
        <AlbumImage images={parseImages(props.task.preview ?? "")} size={300} />
        <CardBody>
          <CardTitle component="span">{props.task.title}</CardTitle>
          <CardDescription>
            {artistsNamesFormatter(parseSimplifiedArtist(props.task.spotifyArtists))}
          </CardDescription>
          <CardDescription>{props.task.text}</CardDescription>
          <pre>{JSON.stringify(props.task, null, 2)}</pre>
          <CardActions>
            <DeleteTaskDialog task={props.task} />
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

  const [isSubmitting, setIsSubmitting] = createOptimistic(false);

  const resource = createMemo(() => {
    return tasksContext[props.task.status as TaskStatus].resource;
  });

  const isLoading = createMemo(() => isSubmitting() || isPending(resource()));

  const onSave = action(async function* () {
    setIsSubmitting(true);

    const result = await parseResponse(
      honoClient.api.tasks[":taskId"].$delete({
        param: { taskId: props.task.id },
      }),
    );

    yield result;

    setIsSubmitting(false);
    closeDialog(dialogId);
    refresh(resource());
  });

  return (
    <>
      <DialogTrigger color="warning" for={dialogId} isLoading={isLoading()}>
        <TrashIcon class="size-4" />
        {t("common.delete")}
      </DialogTrigger>
      <AlertDialog
        dialogId={dialogId}
        description={t("task.delete.description")}
        title={t("task.delete.title")}
        onSave={onSave}
        isLoading={isLoading()}
        submitColor="warning"
        submitLabel={t("common.delete")}
      />
    </>
  );
};
