import {
  createContext,
  createOptimisticStore,
  createSignal,
  refresh,
  useContext,
  type Component,
  type ParentProps,
} from "solid-js";
import type { TaskStatus } from "../validation";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "../constansts";
import { parseResponse } from "hono/client";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import type { TaskDto, TasksPageDto } from "../task-dto";

const createSelectTasksResource = (status: TaskStatus) => {
  const honoClient = useHonoClientContext();

  // Number of server pages loaded into the column. "Load more" adds one.
  const [loadedPages, setLoadedPages] = createSignal(1);

  // Page responses are cached while the column grows, so loading another page
  // only requests that page instead of the whole column again. A reload clears
  // the cache because a server write may have moved items between pages.
  const pageCache = new Map<number, Promise<TasksPageDto>>();

  const fetchPage = (page: number) => {
    const cached = pageCache.get(page);
    if (cached) {
      return cached;
    }

    const request = parseResponse(
      honoClient.api.tasks.$get({ query: { page: String(page), status } }),
    ).catch((error: unknown) => {
      pageCache.delete(page);
      throw error;
    });

    pageCache.set(page, request);

    return request;
  };

  const loadPages = async (pages: number): Promise<TasksPageDto> => {
    const results = await Promise.all(Array.from({ length: pages }, (_, page) => fetchPage(page)));
    const lastPage = results.at(-1);

    return {
      hasNext: lastPage?.hasNext ?? false,
      items: results.flatMap((result) => result.items),
    };
  };

  const [resource, setResource] = createOptimisticStore<TasksPageDto>(
    () => loadPages(loadedPages()),
    { hasNext: false, items: [] },
  );

  const loadMore = () => {
    setLoadedPages((current) => current + 1);
  };

  const reload = () => {
    pageCache.clear();
    return refresh(resource);
  };

  return { loadMore, reload, resource, setResource };
};

export type TaskResourceItem = TaskDto;

export type TasksColumnResource = ReturnType<typeof createSelectTasksResource>;

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
      resource.items.push(item);
    });

    return item;
  };

  const deleteTask = (status: TaskStatus, taskId: string) => {
    columns[status].setResource((resource) => {
      const indexToDelete = resource.items.findIndex((element) => element.id === taskId);
      if (indexToDelete !== -1) {
        resource.items.splice(indexToDelete, 1);
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
        const element = resource.items.find((element) => element.id === taskId);
        if (element) {
          element.note = args.note;
          element.rate = args.rate ?? null;
        }
      });
      return;
    }

    const taskToRemove = columns[status].resource.items.find((element) => element.id === taskId);
    if (!taskToRemove) {
      return;
    }

    deleteTask(status, taskId);

    columns[args.status].setResource((resource) => {
      resource.items.splice(0, 0, {
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
