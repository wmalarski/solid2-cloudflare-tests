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
import { Card, CardActions, CardBody, CardDescription, CardTitle } from "~/ui/card/card";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";
import { createDateFormatter } from "~/integrations/i18n/create-date-formatter";
import { parseResponse } from "hono/client";
import { AlbumImage } from "./album-image";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { InfoRowContainer, InfoRowItem } from "~/ui/info-row/info-row";

export const CurrentlyPlayingSection: Component = () => {
  const { t } = useI18n();

  const currentlyPlayingContext = useCurrentlyPlayingContext();

  const artistsNamesFormatter = createArtistsNamesFormatter();
  const dateFormatter = createDateFormatter();

  const album = createMemo(() => {
    const currentlyPlaying = currentlyPlayingContext();
    return currentlyPlaying && "album" in currentlyPlaying.item
      ? currentlyPlaying.item.album
      : null;
  });

  return (
    <Show when={album()}>
      {(album) => (
        <Card side size="xs" class="h-28">
          <AlbumImage images={album().images} size={300} />
          <CardBody class="flex-row justify-between w-full">
            <div class="flex flex-col gap-2">
              <CardTitle component="span">{album().name}</CardTitle>
              <CardDescription>{artistsNamesFormatter(album().artists)}</CardDescription>
              <InfoRowContainer>
                <InfoRowItem
                  name={t("task.releaseDate")}
                  value={album().release_date ? dateFormatter(album().release_date) : undefined}
                />
              </InfoRowContainer>
            </div>
            <CardActions>
              <InsertCurrentlyPlayingTaskDialog album={album()} />
            </CardActions>
          </CardBody>
        </Card>
      )}
    </Show>
  );
};

type InsertCurrentlyPlayingTaskDialogProps = {
  album: SimplifiedAlbum;
};

const InsertCurrentlyPlayingTaskDialog: Component<InsertCurrentlyPlayingTaskDialogProps> = (
  props,
) => {
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
          <InsertCurrentlyPlayingTaskForm
            album={props.album}
            formId={formId}
            onSubmitStart={onSubmitStart}
          />
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
  album: SimplifiedAlbum;
  onSubmitStart: () => void;
};

const InsertCurrentlyPlayingTaskForm: Component<InsertCurrentlyPlayingTaskFormProps> = (props) => {
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
