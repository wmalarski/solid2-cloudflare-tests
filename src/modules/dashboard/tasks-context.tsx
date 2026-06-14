import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Component,
  type ParentProps,
} from "solid-js";
import type { TaskStatus } from "./validation";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";

const createSelectTasksResource = (status: TaskStatus) => {
  const honoClient = useHonoClientContext();
  const resource = createMemo(() => honoClient.api.tasks.$get({ query: { status } }));
  const [page, setPage] = createSignal(0);
  return { resource, page, setPage };
};

const createTasksContext = () => {
  return {
    new: createSelectTasksResource("new"),
    inProgress: createSelectTasksResource("in-progress"),
    reviewed: createSelectTasksResource("reviewed"),
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
