import { readFile } from "node:fs/promises";

const process = async () => {
  const file = await readFile("src/scripts/dump-remote.sql", { encoding: "utf8" });

  const lines = file
    .split("\n")
    .filter((line) => line.startsWith('INSERT INTO "bookmark"'))
    .map((line) => {
      const values = line.slice(line.indexOf("VALUES") + 7, -2).split(",");

      const [_createdAt, doneAt, id, note, _preview, rate, text, ...rest] = values;
      const [_updatedAt, _url, _userId, status] = rest.splice(-4);
      const title = rest.join(",");

      return {
        task: {
          doneAt: doneAt !== "NULL" ? JSON.parse(doneAt) : undefined,
          id: crypto.randomUUID(),
          note: note !== "NULL" ? (note ?? "") : "",
          rate: rate !== "NULL" ? JSON.parse(rate) : undefined,
          status: status.replaceAll("'", ""),
        },
        text,
        id: Number(id.slice(1, -1)),
        title: title.slice(1, -1),
      };
    })
    .filter((entry) => entry.text === "NULL")
    .map((line) => ({ task: line.task, id: line.id, title: line.title }));

  console.log(JSON.stringify(lines, null, 2));
};

void process();
