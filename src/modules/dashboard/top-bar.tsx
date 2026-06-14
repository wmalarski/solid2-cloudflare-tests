import type { ComponentProps } from "@solidjs/web";
import { parseResponse } from "hono/client";
import { createMemo, type Component } from "solid-js";
import { useAuthContext } from "~/integrations/better-auth/auth-context";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { TaskFields, taskFieldsSchema } from "./task-fields";
import { transformFormData } from "~/ui/utils/forms";
import * as v from "valibot";

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
  const honoClient = useHonoClientContext();

  const currentlyPlaying = createMemo(() =>
    parseResponse(honoClient.api.player["currently-playing"].$get()),
  );

  return (
    <>
      <pre>{JSON.stringify(currentlyPlaying, null, 2)}</pre>
      <InsertCurrentlyPlayingTaskDialog albumId={currentlyPlaying().item.id} />
    </>
  );
};

type InsertCurrentlyPlayingTaskDialogProps = {
  albumId: string;
};

const InsertCurrentlyPlayingTaskDialog: Component<InsertCurrentlyPlayingTaskDialogProps> = (
  props,
) => {
  return (
    <>
      <InsertCurrentlyPlayingTaskForm albumId={props.albumId} />
    </>
  );
};

type InsertCurrentlyPlayingTaskFormProps = {
  albumId: string;
};

const InsertCurrentlyPlayingTaskForm: Component<InsertCurrentlyPlayingTaskFormProps> = (props) => {
  const honoClient = useHonoClientContext();

  const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = v.safeParse(transformFormData(taskFieldsSchema), formData);

    if (!result.success) {
      return;
    }

    await honoClient.api.tasks.$post({ json: { albumId: props.albumId, ...result.output } });
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" value={props.albumId} name="albumId" />
      <TaskFields />
    </form>
  );
};
