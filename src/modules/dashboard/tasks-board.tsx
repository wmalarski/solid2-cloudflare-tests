import { For, type Component } from "solid-js";
import type { TaskStatus } from "./validation";
import { useTasksContext } from "./tasks-context";
import { BOOKMARK_STATUSES } from "./constansts";

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
    <pre>
      {JSON.stringify(
        {
          tasks: tasksContext[props.status].resource(),
          page: tasksContext[props.status].page,
        },
        null,
        2,
      )}
    </pre>
  );
};
