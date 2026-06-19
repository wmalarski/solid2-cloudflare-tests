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

  const insertAlbumAsTask = (album: SimplifiedAlbum) => {
    setResource((resource) => {
      resource.splice(0, 0, {
        id: crypto.randomUUID(),
        createdAt: null,
        doneAt: null,
        note: null,
        preview: null,
        rate: null,
        releaseDate: album.release_date,
        spotifyArtists: JSON.stringify(album.artists),
        spotifyId: album.id,
        status: STATUS_IN_PROGRESS,
        title: album.name,
        updatedAt: null,
        url: album.external_urls.spotify,
        userId: "self",
      });
    });
  };

  const deleteTask = (taskId: string) => {
    setResource((resource) => {
      const indexToDelete = resource.findIndex((element) => element.id === taskId);
      resource.splice(indexToDelete, 1);
    });
  };

  type UpdateTaskArgs = {
    taskId: string;
    note: string;
    rate?: number;
    status: TaskStatus;
  };

  const updateTask = (args: UpdateTaskArgs) => {
    setResource((resource) => {
      const element = resource.find((element) => element.id === args.taskId);
      if (element) {
        element.note = args.note;
        element.rate = args.rate ?? null;
        element.status = args.status;
      }
    });
  };

  return { resource, page, setPage, insertTask: insertAlbumAsTask, deleteTask, updateTask };
};

const createTasksContext = () => {
  return {
    [STATUS_NEW]: createSelectTasksResource(STATUS_NEW),
    [STATUS_IN_PROGRESS]: createSelectTasksResource(STATUS_IN_PROGRESS),
    [STATUS_REVIEWED]: createSelectTasksResource(STATUS_REVIEWED),
  };
};

type TasksContextValue = ReturnType<typeof createTasksContext>;

export type TaskResourceItem = ReturnType<typeof createSelectTasksResource>["resource"][0];

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
