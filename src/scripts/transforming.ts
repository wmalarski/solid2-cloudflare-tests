import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { readdir } from "node:fs/promises";
import { readFile } from "node:fs/promises";

type Task = {
  doneAt: number;
  id: string;
  note: string;
  rate: number;
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

const main = async () => {
  const dataMap = await getDataMap();

  const files = await readdir("src/scripts/data");
  const filenames = files.filter((file) => file.endsWith(".json"));

  for (const filename of filenames) {
    const text = await readFile(`src/scripts/data/${filename}`, { encoding: "utf8" });
    const json = JSON.parse(text).albums.items as SimplifiedAlbum[];
    const id = Number(filename.replaceAll(".json", ""));
    const task = dataMap.get(id);

    console.log({ id, task, json });
  }
};

void main();
