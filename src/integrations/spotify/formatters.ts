import type { SimplifiedArtist } from "@spotify/web-api-ts-sdk";
import { useI18n } from "../i18n";
import { createMemo } from "solid-js";

export const createArtistsNamesFormatter = () => {
  const { locale } = useI18n();

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
