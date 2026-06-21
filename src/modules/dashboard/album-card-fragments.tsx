import type { Image } from "@spotify/web-api-ts-sdk";
import { createMemo, Show, type Component } from "solid-js";
import { useI18n } from "~/integrations/i18n";
import { CardDescription, CardTitle } from "~/ui/card/card";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";
import { createDateFormatter } from "~/integrations/i18n/create-date-formatter";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { InfoRowContainer, InfoRowItem } from "~/ui/info-row/info-row";

type AlbumImageProps = {
  images: Image[];
  size: 64 | 300 | 640;
  containerSize?: number;
};

export const AlbumImage: Component<AlbumImageProps> = (props) => {
  const { t } = useI18n();

  const source = createMemo(() => {
    return props.images.find((image) => image.height === props.size);
  });

  return (
    <Show when={source()}>
      {(source) => (
        <figure>
          <img
            src={source().url}
            alt={t("task.image")}
            width={props.containerSize ?? source().width}
            height={props.containerSize ?? source().height}
          />
        </figure>
      )}
    </Show>
  );
};

type AlbumInformationSectionProps = {
  album: SimplifiedAlbum;
};

export const AlbumInformationSection: Component<AlbumInformationSectionProps> = (props) => {
  const { t } = useI18n();

  const artistsNamesFormatter = createArtistsNamesFormatter();
  const dateFormatter = createDateFormatter();

  return (
    <div class="flex flex-col gap-2">
      <CardTitle component="span">{props.album.name}</CardTitle>
      <CardDescription>{artistsNamesFormatter(props.album.artists)}</CardDescription>
      <InfoRowContainer>
        <InfoRowItem
          name={t("task.releaseDate")}
          value={props.album.release_date ? dateFormatter(props.album.release_date) : undefined}
        />
      </InfoRowContainer>
    </div>
  );
};
