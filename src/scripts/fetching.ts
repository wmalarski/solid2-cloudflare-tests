import { readFile, writeFile } from "node:fs/promises";
import { config } from "dotenv";

config();

const fetchToken = async () => {
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const tokenValue = spotifyClientId + ":" + spotifyClientSecret;
  const token = Buffer.from(tokenValue).toString("base64");
  const url = "https://accounts.spotify.com/api/token";

  const searchParams = new URLSearchParams({ grant_type: "client_credentials" });

  const response = await fetch(url, {
    body: searchParams,
    method: "POST",
    headers: {
      Authorization: "Basic " + token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const json = await response.json();

  return json;
};
const fetchAlbum = async (title: string, accessToken: string) => {
  const params = new URLSearchParams({ q: title, type: "album", limit: "1" });
  const url = `https://api.spotify.com/v1/search?${params}`;
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(url, { headers });
  const json = await response.json();
  return json;
};

const wait = (time: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), time));
};

const main = async () => {
  const token = await fetchToken();

  const file = await readFile("src/scripts/data.json", { encoding: "utf8" });
  const data = JSON.parse(file);

  for await (const element of data.slice(0, 2)) {
    const result = await fetchAlbum(element.title, (token as any).access_token);
    await writeFile(`src/scripts/data/${element.id}.json`, JSON.stringify(result));
    await wait(5_000);
    console.log(result);
  }
};

void main();
