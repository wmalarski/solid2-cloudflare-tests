import {
  createMemo,
  createSignal,
  createUniqueId,
  For,
  Loading,
  Repeat,
  Show,
  type Component,
} from "solid-js";
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
import { useI18n } from "~/integrations/i18n";
import type { SimplifiedAlbum } from "@spotify/web-api-ts-sdk";
import { parseImages, parseSimplifiedArtist } from "./parsers";
import { AlbumImage, AlbumInformationSection } from "./album-card-fragments";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";
import { InfoRowContainer, InfoRowItem } from "~/ui/info-row/info-row";
import { createDateFormatter } from "~/integrations/i18n/create-date-formatter";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { parseResponse } from "hono/client";
import { Card, CardActions, CardBody } from "~/ui/card/card";
import { InsertTaskDialog } from "./insert-task-dialog";
import { InfoIcon } from "~/ui/icons/info-icon";
import { StartAlbumPlaybackButton } from "./start-playback-button";
import { Skeleton } from "~/ui/skeleton/skeleton";

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

  const [open, setOpen] = createSignal(false);

  const onClose = () => {
    setOpen(false);
  };

  const onOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <DialogTrigger color="info" size="sm" for={dialogId} onClick={onOpen}>
        <InfoIcon class="size-4" />
        {t("task.details.more")}
      </DialogTrigger>
      <Dialog id={dialogId} open={open()} onClose={onClose}>
        <DialogBox>
          <AlbumImage images={props.images} size={640} />
          <DialogTitle class="pt-4">{props.name}</DialogTitle>
          <DialogDescription>{artistsNamesFormatter(props.artists)}</DialogDescription>
          <InfoRowContainer>
            <InfoRowItem
              name={t("task.releaseDate")}
              value={props.relaseDate ? dateFormatter(props.relaseDate) : undefined}
            />
          </InfoRowContainer>
          <Show when={open()}>
            <div class="flex flex-col gap-4 pt-4">
              <Loading fallback={<SkeletonList />}>
                <For each={props.artists}>
                  {(artist) => <ArtistAlbumsList name={artist.name} artistId={artist.id} />}
                </For>
                <RelatedArtistAlbumsList artistIds={props.artists.map((artist) => artist.id)} />
              </Loading>
            </div>
          </Show>
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

  return <AlbumsList albums={artistAlbums()?.items ?? []} name={props.name} />;
};

type RelatedArtistAlbumsListProps = {
  artistIds: string[];
};

const RelatedArtistAlbumsList: Component<RelatedArtistAlbumsListProps> = (props) => {
  const honoClient = useHonoClientContext();

  const relatedArtistsAndAlbums = createMemo(() =>
    parseResponse(
      honoClient.api.artists.related.$get({ query: { artistIds: props.artistIds.join(",") } }),
    ),
  );

  return (
    <For each={relatedArtistsAndAlbums()}>
      {(element) => <AlbumsList albums={element.albums} name={element.artist.name} />}
    </For>
  );
};

type AlbumsListProps = {
  name: string;
  albums: SimplifiedAlbum[];
};

const AlbumsList: Component<AlbumsListProps> = (props) => {
  return (
    <div class="flex flex-col gap-2">
      <span class="text-lg font-semibold">{props.name}</span>
      <ul class="flex gap-2 max-w-full overflow-auto">
        <For each={props.albums}>{(album) => <AlbumsListItem album={album} />}</For>
      </ul>
    </div>
  );
};

type AlbumsListItemProps = {
  album: SimplifiedAlbum;
};

const AlbumsListItem: Component<AlbumsListItemProps> = (props) => {
  return (
    <li class="h-auto min-w-64">
      <Card>
        <AlbumImage images={props.album.images} size={300} />
        <CardBody>
          <AlbumInformationSection album={props.album} />
          <CardActions>
            <StartAlbumPlaybackButton album={props.album} />
            <InsertTaskDialog album={props.album} />
          </CardActions>
        </CardBody>
      </Card>
    </li>
  );
};

const SkeletonList: Component = () => {
  return (
    <div class="flex flex-col gap-2">
      <Skeleton class="h-7" />
      <ul class="flex gap-2 max-w-full overflow-auto">
        <Repeat count={4}>{() => <SkeletonListItem />}</Repeat>
      </ul>
    </div>
  );
};

const SkeletonListItem: Component = () => {
  return (
    <li class="h-auto min-w-64">
      <Card>
        <Skeleton class="h-64" />
        <CardBody>
          <Skeleton class="h-7" />
          <Skeleton class="h-5" />
          <Skeleton class="h-5" />
          <CardActions>
            <Skeleton class="h-8 w-19" />
            <Skeleton class="h-8 w-19" />
          </CardActions>
        </CardBody>
      </Card>
    </li>
  );
};
