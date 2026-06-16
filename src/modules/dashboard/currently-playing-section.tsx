import type { ComponentProps } from "@solidjs/web";
import {
  action,
  createMemo,
  createSignal,
  createUniqueId,
  refresh,
  Show,
  type Component,
} from "solid-js";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { TaskFields, taskFieldsSchema } from "./task-fields";
import { parseFormValidationError, transformFormData, type FormIssues } from "~/ui/utils/forms";
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
import { Card, CardActions, CardBody, CardDescription, CardTitle } from "~/ui/card/card";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";
import { createDateFormatter } from "~/integrations/i18n/create-date-formatter";
import { parseResponse } from "hono/client";

export const CurrentlyPlayingSection: Component = () => {
  const currentlyPlayingContext = useCurrentlyPlayingContext();

  const artistsNamesFormatter = createArtistsNamesFormatter();
  const dateFormatter = createDateFormatter();

  const album = createMemo(() => {
    const currentlyPlaying = currentlyPlayingContext();
    return "album" in currentlyPlaying.item ? currentlyPlaying.item.album : null;
  });

  return (
    <Show when={album()}>
      {(album) => (
        <Card>
          <CardBody>
            <CardTitle component="span">{album().name}</CardTitle>
            <CardDescription>{artistsNamesFormatter(album().artists)}</CardDescription>
            <CardDescription>{dateFormatter(album().release_date)}</CardDescription>
            <pre>{JSON.stringify(album(), null, 2)}</pre>
            <CardActions>
              <InsertCurrentlyPlayingTaskDialog albumId={album().id} />
            </CardActions>
          </CardBody>
        </Card>
      )}
    </Show>
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

  const [issues, setIssues] = createSignal<FormIssues>();

  const onSubmit: ComponentProps<"form">["onSubmit"] = action(async function* (event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsed = v.safeParse(
      transformFormData(taskFieldsSchema, { numbers: ["rate"] }),
      formData,
    );

    console.log("[parsed]", parsed);

    if (!parsed.success) {
      setIssues(parseFormValidationError(parsed.issues));
      return;
    }

    const result = await parseResponse(
      honoClient.api.tasks.$post({
        json: { albumId: props.albumId, ...parsed.output },
      }),
    );

    console.log("[parsed]", result);

    yield result;

    const tasksColumn = tasksContext[parsed.output.status];
    refresh(tasksColumn.resource);
    tasksColumn.setPage(0);
  });

  return (
    <form onSubmit={onSubmit} id={props.formId}>
      <TaskFields issues={issues()} />
    </form>
  );
};
