import { createMemo, createUniqueId, For, type Component } from "solid-js";
import type { Image, SimplifiedArtist } from "@spotify/web-api-ts-sdk";
import { type TaskResourceItem } from "./data-contexts/tasks-context";
import {
  Dialog,
  DialogActions,
  DialogBackdrop,
  DialogBox,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/ui/dialog/dialog";
import { PlusIcon } from "~/ui/icons/plus-icon";
import { useI18n } from "~/integrations/i18n";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { parseImages, parseSimplifiedArtist } from "./parsers";
import { AlbumImage } from "./album-image";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";
import { InfoRowContainer, InfoRowItem } from "~/ui/info-row/info-row";
import { createDateFormatter } from "~/integrations/i18n/create-date-formatter";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { parseResponse } from "hono/client";

type TaskDetailsDialogProps = {
  task: TaskResourceItem;
};

export const TaskDetailsDialog: Component<TaskDetailsDialogProps> = (props) => {
  return (
    <DetailsDialog
      artists={parseSimplifiedArtist(props.task.spotifyArtists)}
      images={parseImages(props.task.preview)}
      name={props.task.title}
      relaseDate={props.task.releaseDate}
      spotifyId={props.task.spotifyId}
    />
  );
};

type AlbumDetailsDialogProps = {
  album: SimplifiedAlbum;
};

export const AlbumDetailsDialog: Component<AlbumDetailsDialogProps> = (props) => {
  return (
    <DetailsDialog
      artists={props.album.artists}
      images={props.album.images}
      name={props.album.name}
      relaseDate={props.album.release_date}
      spotifyId={props.album.id}
    />
  );
};

type DetailsDialogProps = {
  spotifyId: string;
  relaseDate: string | null;
  name: string;
  images: Image[];
  artists: SimplifiedArtist[];
};

const DetailsDialog: Component<DetailsDialogProps> = (props) => {
  const { t } = useI18n();

  const dialogId = createUniqueId();

  const artistsNamesFormatter = createArtistsNamesFormatter();
  const dateFormatter = createDateFormatter();

  return (
    <>
      <DialogTrigger color="primary" size="sm" for={dialogId}>
        <PlusIcon class="size-4" />
        {t("currentlyPlaying.addTask.trigger")}
      </DialogTrigger>
      <Dialog id={dialogId}>
        <DialogBox>
          <DialogTitle>{props.name}</DialogTitle>
          <DialogDescription>{artistsNamesFormatter(props.artists)}</DialogDescription>
          <InfoRowContainer>
            <InfoRowItem
              name={t("task.releaseDate")}
              value={props.relaseDate ? dateFormatter(props.relaseDate) : undefined}
            />
          </InfoRowContainer>
          <AlbumImage images={props.images} size={300} />
          <For each={props.artists}>
            {(artist) => <ArtistAlbumsList name={artist.name} artistId={artist.id} />}
          </For>
          <DialogActions>
            <DialogClose />
          </DialogActions>
        </DialogBox>
        <DialogBackdrop />
      </Dialog>
    </>
  );
};

type ArtistAlbumsListProps = {
  artistId: string;
  name: string;
};

const ArtistAlbumsList: Component<ArtistAlbumsListProps> = (props) => {
  const honoClient = useHonoClientContext();

  const artistAlbums = createMemo(() =>
    parseResponse(
      honoClient.api.artists[":artistId"].albums.$get({ param: { artistId: props.artistId } }),
    ),
  );

  return (
    <div>
      <span>{props.name}</span>
      <pre>{JSON.stringify(artistAlbums(), null, 2)}</pre>
    </div>
  );
};
