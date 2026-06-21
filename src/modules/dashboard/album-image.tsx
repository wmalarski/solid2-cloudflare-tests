import type { Image } from "@spotify/web-api-ts-sdk";
import { createMemo, Show, type Component } from "solid-js";
import { useI18n } from "~/integrations/i18n";

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
