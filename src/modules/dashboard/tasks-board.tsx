import { For, type Component } from "solid-js";
import type { TaskStatus } from "./validation";
import { useTasksContext, type TaskResourceItem } from "./data-contexts/tasks-context";
import { BOOKMARK_STATUSES } from "./constansts";
import { Card, CardBody, CardDescription, CardTitle } from "~/ui/card/card";

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
  return (
    <li>
      <Card>
        <CardBody>
          <CardTitle component="span">{props.task.title}</CardTitle>
          <CardDescription>{props.task.text}</CardDescription>
          <pre>{JSON.stringify(props.task, null, 2)}</pre>
        </CardBody>
      </Card>
    </li>
  );
};
