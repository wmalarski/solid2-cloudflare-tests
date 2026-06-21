import { createMemo, Show, type Component } from "solid-js";
import { useCurrentlyPlayingContext } from "./data-contexts/currently-playing-context";
import { Card, CardActions, CardBody } from "~/ui/card/card";
import { AlbumImage, AlbumInformationSection } from "./album-card-fragments";
import { AlbumDetailsDialog } from "./details-dialog";
import { InsertTaskDialog } from "./insert-task-dialog";

export const CurrentlyPlayingSection: Component = () => {
  const currentlyPlayingContext = useCurrentlyPlayingContext();

  const album = createMemo(() => {
    const currentlyPlaying = currentlyPlayingContext();
    return currentlyPlaying && "album" in currentlyPlaying.item
      ? currentlyPlaying.item.album
      : null;
  });

  return (
    <Show when={album()}>
      {(album) => (
        <Card side size="xs" class="h-28">
          <AlbumImage images={album().images} size={300} />
          <CardBody class="flex-row justify-between w-full">
            <AlbumInformationSection album={album()} />
            <CardActions>
              <InsertTaskDialog album={album()} />
              <AlbumDetailsDialog album={album()} />
            </CardActions>
          </CardBody>
        </Card>
      )}
    </Show>
  );
};
