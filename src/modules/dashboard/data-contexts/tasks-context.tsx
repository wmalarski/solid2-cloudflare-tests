import {
  createContext,
  createOptimisticStore,
  createSignal,
  useContext,
  type Component,
  type ParentProps,
} from "solid-js";
import type { TaskStatus } from "../validation";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "../constansts";
import { parseResponse } from "hono/client";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";

const createSelectTasksResource = (status: TaskStatus) => {
  const honoClient = useHonoClientContext();

  const [page, setPage] = createSignal(0);

  const [resource, setResource] = createOptimisticStore(
    () => parseResponse(honoClient.api.tasks.$get({ query: { status } })),
    [],
  );

  return { resource, page, setPage, setResource };
};

export type TaskResourceItem = ReturnType<typeof createSelectTasksResource>["resource"][number];

const createTasksContext = () => {
  const columns = {
    [STATUS_NEW]: createSelectTasksResource(STATUS_NEW),
    [STATUS_IN_PROGRESS]: createSelectTasksResource(STATUS_IN_PROGRESS),
    [STATUS_REVIEWED]: createSelectTasksResource(STATUS_REVIEWED),
  };

  type InsertAlbumAsTaskArgs = {
    album: SimplifiedAlbum;
    note: string;
    rate?: number;
    status: TaskStatus;
  };

  const insertAlbumAsTask = (args: InsertAlbumAsTaskArgs) => {
    const now = new Date().toISOString();
    const item: TaskResourceItem = {
      id: crypto.randomUUID(),
      createdAt: now,
      doneAt: null,
      note: args.note,
      preview: JSON.stringify(args.album.images),
      rate: args.rate ?? null,
      releaseDate: args.album.release_date,
      spotifyArtists: JSON.stringify(args.album.artists),
      spotifyId: args.album.id,
      status: args.status,
      title: args.album.name,
      updatedAt: now,
      url: args.album.external_urls.spotify,
      spotifyUri: args.album.uri,
    };

    columns[args.status].setResource((resource) => {
      resource.push(item);
    });

    return item;
  };

  const deleteTask = (status: TaskStatus, taskId: string) => {
    columns[status].setResource((resource) => {
      const indexToDelete = resource.findIndex((element) => element.id === taskId);
      if (indexToDelete !== -1) {
        resource.splice(indexToDelete, 1);
      }
    });
  };

  type UpdateTaskArgs = {
    taskId: string;
    note: string;
    rate?: number;
    status: TaskStatus;
  };

  const updateTask = (status: TaskStatus, args: UpdateTaskArgs) => {
    const sameStatus = status === args.status;
    const taskId = args.taskId;

    if (sameStatus) {
      columns[status].setResource((resource) => {
        const element = resource.find((element) => element.id === taskId);
        if (element) {
          element.note = args.note;
          element.rate = args.rate ?? null;
        }
      });
      return;
    }

    const taskToRemove = columns[status].resource.find((element) => element.id === taskId);
    if (!taskToRemove) {
      return;
    }

    deleteTask(status, taskId);

    columns[args.status].setResource((resource) => {
      resource.splice(0, 0, {
        ...taskToRemove,
        note: args.note,
        rate: args.rate ?? null,
        status: args.status,
      });
    });
  };

  return { columns, insertAlbumAsTask, deleteTask, updateTask };
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
