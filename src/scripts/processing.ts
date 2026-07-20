import { readFile } from "node:fs/promises";

const process = async () => {
  const file = await readFile("src/scripts/dump-remote.sql", { encoding: "utf8" });

  const lines = file
    .split("\n")
    .filter((line) => line.startsWith('INSERT INTO "bookmark"'))
    .map((line) => {
      const values = line.slice(line.indexOf("VALUES") + 7, -2).split(",");

      const [createdAt, doneAt, id, note, preview, rate, text, ...rest] = values;
      const [updatedAt, url, userId, status] = rest.splice(-4);
      const title = rest.join(",");

      return {
        task: {
          doneAt: doneAt !== "NULL" ? JSON.parse(doneAt) : undefined,
          id: crypto.randomUUID(),
          note: note !== "NULL" ? note : undefined,
          rate: rate !== "NULL" ? JSON.parse(rate) : undefined,
        },
        createdAt,
        doneAt,
        id,
        note,
        preview,
        rate,
        text,
        title,
        updatedAt,
        url,
        userId,
        status,
      };
    });
  console.log("PROCESS", lines);

  const groups = lines
    .map((line) => line.status)
    .reduce((previous, current) => {
      previous.set(current, (previous.get(current) ?? 0) + 1);
      return previous;
    }, new Map<string, number>());

  console.log(groups);
};

void process();
