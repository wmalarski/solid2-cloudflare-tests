import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Component,
  type ParentProps,
} from "solid-js";
import type { TaskStatus } from "../validation";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "../constansts";
import { parseResponse } from "hono/client";

const createSelectTasksResource = (status: TaskStatus) => {
  const honoClient = useHonoClientContext();

  const [page, setPage] = createSignal(0);

  const resource = createMemo(() =>
    parseResponse(honoClient.api.tasks.$get({ query: { status } })),
  );

  return { resource, page, setPage };
};

const createTasksContext = () => {
  return {
    [STATUS_NEW]: createSelectTasksResource(STATUS_NEW),
    [STATUS_IN_PROGRESS]: createSelectTasksResource(STATUS_IN_PROGRESS),
    [STATUS_REVIEWED]: createSelectTasksResource(STATUS_REVIEWED),
  };
};

type TasksContextValue = ReturnType<typeof createTasksContext>;

const TasksContext = createContext<TasksContextValue | null>(null);

export const useTasksContext = () => {
  const context = useContext(TasksContext);

  if (!context) {
    throw new Error("TasksContext not defined");
  }

  return context;
};

export const TasksContextProvider: Component<ParentProps> = (props) => {
  const value = createTasksContext();

  return <TasksContext value={value}>{props.children}</TasksContext>;
};
