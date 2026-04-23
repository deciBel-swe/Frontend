import Image from 'next/image';
import Link from 'next/link';
import type { PlaylistData, TrackData } from '@/components/messages/types';

const DEFAULT_COVER = '/images/default_song_image_1.png';

type TrackBeforeSendItemProps = {
  track: TrackData;
  onDelete: () => void;
};

type PlaylistBeforeSendItemProps = {
  playlist: PlaylistData;
  onDelete: () => void;
};

type MessageListBeforeSendProps = {
  type: 'track' | 'playlist';
  track?: TrackData;
  playlist?: PlaylistData;
  onDelete: () => void;
};

const toUserSlug = (value: string): string =>
  value.toLowerCase().replace(/\s+/g, '');

function ThinMediaRow({
  href,
  imageSrc,
  imageAlt,
  title,
  author,
  onDelete,
}: {
  href: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  author: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border-default bg-surface-default px-3 py-2">
      <Image
        src={imageSrc || DEFAULT_COVER}
        alt={imageAlt}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded object-cover"
      />

      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block truncate text-sm font-semibold text-text-primary hover:text-brand-primary"
        >
          {title}
        </Link>
        <div className="truncate text-xs text-text-muted">{author}</div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${title}`}
        className="ml-2 shrink-0 text-lg leading-none text-text-muted transition-colors hover:text-status-error"
      >
        ×
      </button>
    </div>
  );
}

export function TrackBeforeSendItem({
  track,
  onDelete,
}: TrackBeforeSendItemProps) {
  const username = track.artist.username;
  const artistSlug = toUserSlug(username);
  const trackPathId = track.trackSlug ?? String(track.id);
  const trackHref = `/${artistSlug}/${trackPathId}`;
  const author = track.artist.displayName || track.artist.username;

  return (
    <ThinMediaRow
      href={trackHref}
      imageSrc={track.cover || DEFAULT_COVER}
      imageAlt={track.title}
      title={track.title}
      author={author}
      onDelete={onDelete}
    />
  );
}

export function PlaylistBeforeSendItem({
  playlist,
  onDelete,
}: PlaylistBeforeSendItemProps) {
  const ownerSlug = toUserSlug(playlist.owner);
  const playlistPathId = playlist.playlistId || String(playlist.id);
  const playlistHref = `/${ownerSlug}/sets/${playlistPathId}`;

  return (
    <ThinMediaRow
      href={playlistHref}
      imageSrc={playlist.cover || DEFAULT_COVER}
      imageAlt={playlist.title}
      title={playlist.title}
      author={playlist.owner}
      onDelete={onDelete}
    />
  );
}

export default function MessageListBeforeSend({
  type,
  track,
  playlist,
  onDelete,
}: MessageListBeforeSendProps) {
  if (type === 'track' && track) {
    return <TrackBeforeSendItem track={track} onDelete={onDelete} />;
  }

  if (type === 'playlist' && playlist) {
    return <PlaylistBeforeSendItem playlist={playlist} onDelete={onDelete} />;
  }

  return null;
}
