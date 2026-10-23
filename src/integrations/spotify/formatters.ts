import type { SimplifiedArtist } from "@spotify/web-api-ts-sdk";
import { type Accessor, createMemo } from "solid-js";
import type { Locale } from "../i18n";

export const createArtistsNamesFormatter = (locale: Accessor<Locale>) => {
  const formatter = createMemo(
    () =>
      new Intl.ListFormat(locale(), {
        style: "long",
        type: "conjunction",
      }),
  );

  return (artists: SimplifiedArtist[]) => {
    const names = artists.map((artist) => artist.name);
    return formatter().format(names);
  };
};
