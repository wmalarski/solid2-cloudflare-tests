import type { ComponentProps } from "@solidjs/web";
import { action, createMemo, isPending, refresh, Show, type Component } from "solid-js";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { useI18n } from "~/integrations/i18n";
import { Button } from "~/ui/button/button";
import { useCurrentlyPlayingContext } from "./data-contexts/currently-playing-context";
import type { TaskResourceItem } from "./data-contexts/tasks-context";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";

type StartTaskPlaybackButtonProps = {
  task: TaskResourceItem;
};

export const StartTaskPlaybackButton: Component<StartTaskPlaybackButtonProps> = (props) => {
  return (
    <Show when={props.task.spotifyUri.startsWith("spotify:")}>
      <StartPlaybackButton contextUri={props.task.spotifyUri} />
    </Show>
  );
};

type StartAlbumPlaybackButtonProps = {
  album: SimplifiedAlbum;
};

export const StartAlbumPlaybackButton: Component<StartAlbumPlaybackButtonProps> = (props) => {
  return <StartPlaybackButton contextUri={props.album.uri} />;
};

type StartPlaybackButtonProps = {
  contextUri: string;
};

const StartPlaybackButton: Component<StartPlaybackButtonProps> = (props) => {
  const { t } = useI18n();

  const honoClient = useHonoClientContext();
  const currentlyPlayingContext = useCurrentlyPlayingContext();

  const onSubmit: ComponentProps<"form">["onSubmit"] = action(function* (event) {
    event.preventDefault();

    yield honoClient.api.player["start-resume"].$put({
      json: { contextUri: props.contextUri },
    });

    refresh(currentlyPlayingContext);
  });

  const isLoading = createMemo(() => isPending(currentlyPlayingContext));

  return (
    <form onSubmit={onSubmit}>
      <Button size="sm" color="primary" isLoading={isLoading()} disabled={isLoading()}>
        {t("task.play")}
      </Button>
    </form>
  );
};
