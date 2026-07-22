import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { readdir } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import type { SelectTodosItem } from "~/modules/dashboard/routes/types";

type Task = {
  doneAt?: number;
  id: string;
  note: string;
  rate?: number;
  status: string;
};

type DataEntry = {
  task: Task;
  id: number;
};

const getDataMap = async () => {
  const data = await readFile("src/scripts/data.json", { encoding: "utf8" });
  const json = JSON.parse(data) as DataEntry[];
  const map = new Map(json.map((entry) => [entry.id, entry] as const));
  return map;
};

const mapToTask = (entry?: DataEntry, album?: SimplifiedAlbum): SelectTodosItem | null => {
  if (!entry || !album) {
    return null;
  }

  return {
    createdAt: null,
    doneAt: entry.task.doneAt ? `${entry.task.doneAt}` : null,
    id: entry.task.id,
    note: entry.task.note,
    preview: JSON.stringify(album.images),
    rate: entry.task.rate ? entry.task.rate : null,
    releaseDate: album.release_date,
    spotifyArtists: JSON.stringify(album.artists),
    spotifyId: album.id,
    spotifyUri: album.uri,
    status: entry.task.status,
    title: album.name,
    updatedAt: null,
    url: album.href,
    userId: "",
  };
};

const main = async () => {
  const dataMap = await getDataMap();

  const files = await readdir("src/scripts/data");
  const filenames = files.filter((file) => file.endsWith(".json"));
  const todos: SelectTodosItem[] = [];

  for (const filename of filenames) {
    const text = await readFile(`src/scripts/data/${filename}`, { encoding: "utf8" });
    const id = Number(filename.replaceAll(".json", ""));
    const json = JSON.parse(text).albums.items as SimplifiedAlbum[];
    const album = json.at(0);
    const task = dataMap.get(id);

    const mapped = mapToTask(task, album);
    if (mapped) {
      todos.push(mapped);
    }
  }

  console.log(JSON.stringify(todos, null, 2));
};

void main();
