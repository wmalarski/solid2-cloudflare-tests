import type { SimplifiedArtist, Image } from "@spotify/web-api-ts-sdk";
import * as v from "valibot";

const parseSimplifiedArtistPipeline = v.pipe(
  v.nullish(v.string(), "[]"),
  v.parseJson(),
  v.array(
    v.object({
      external_urls: v.object({
        spotify: v.string(),
      }),
      href: v.string(),
      id: v.string(),
      name: v.string(),
      type: v.string(),
      uri: v.string(),
    }),
  ),
);

export const parseSimplifiedArtist = (artistsString?: string | null): SimplifiedArtist[] => {
  const parsed = v.safeParse(parseSimplifiedArtistPipeline, artistsString);
  return parsed.success ? parsed.output : [];
};

const parseImagesPipeline = v.pipe(
  v.nullish(v.string(), "[]"),
  v.parseJson(),
  v.array(
    v.object({
      url: v.string(),
      height: v.number(),
      width: v.number(),
    }),
  ),
);

export const parseImages = (imagesString?: string | null): Image[] => {
  const parsed = v.safeParse(parseImagesPipeline, imagesString);
  return parsed.success ? parsed.output : [];
};
