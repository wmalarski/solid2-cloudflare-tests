import { createMemo, createUniqueId, For, Loading, type Component } from "solid-js";
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
import { AlbumImage, AlbumInformationSection } from "./album-card-fragments";
import { createArtistsNamesFormatter } from "~/integrations/spotify/formatters";
import { InfoRowContainer, InfoRowItem } from "~/ui/info-row/info-row";
import { createDateFormatter } from "~/integrations/i18n/create-date-formatter";
import { useHonoClientContext } from "~/integrations/hono-client/hono-client-context";
import { parseResponse } from "hono/client";
import { Card, CardActions, CardBody } from "~/ui/card/card";
import { InsertTaskDialog } from "./insert-task-dialog";

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

  const artistIds = createMemo(() => props.artists.map((artist) => artist.id));

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
          <Loading>
            <For each={props.artists}>
              {(artist) => <ArtistAlbumsList name={artist.name} artistId={artist.id} />}
            </For>
            <RelatedArtistAlbumsList artistIds={artistIds()} />
          </Loading>
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
    parseResponse(honoClient.api.artists.related.$get({ query: { artistIds: props.artistIds } })),
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
    <div>
      <span>{props.name}</span>
      <pre>{JSON.stringify(props.albums, null, 2)}</pre>
      <ul>
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
    <li>
      <Card>
        <AlbumImage images={props.album.images} size={300} />
        <CardBody>
          <AlbumInformationSection album={props.album} />
          <CardActions>
            <InsertTaskDialog album={props.album} />
          </CardActions>
        </CardBody>
      </Card>
    </li>
  );
};
