import type { ComponentProps } from "@solidjs/web";
import { refresh, type Component } from "solid-js";
import { useAuthContext } from "~/integrations/better-auth/auth-context";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { TaskFields, taskFieldsSchema } from "./task-fields";
import { transformFormData } from "~/ui/utils/forms";
import * as v from "valibot";
import { useTasksContext } from "./data-contexts/tasks-context";
import { useCurrentlyPlayingContext } from "./data-contexts/currently-playing-context";

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
