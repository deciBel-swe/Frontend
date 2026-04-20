'use client';

import Link from 'next/link';
// import { Repeat2 } from 'lucide-react';
import TimeAgo from '@/features/tracks/components/TimeAgo';
import TrackCardPlaybackButton from './TrackCardPlaybackButton';

type TrackCardMetaProps = {
  userSlug: string;
  artistName: string;
  trackId: number;
  title: string;
  contentHref?: string;
  genre?: string;
  createdAt?: string;
  // repostedBySlug?: string;
  // repostedByDisplayName?: string;
  isBlocked: boolean;
  hasPlayback: boolean;
  isCurrentTrackPlaying: boolean;
  onPlayClick: () => void;
};

export default function TrackCardMeta({
  userSlug,
  artistName,
  trackId,
  title,
  contentHref,
  genre,
  createdAt,
  // repostedBySlug,
  // repostedByDisplayName,
  isBlocked,
  hasPlayback,
  isCurrentTrackPlaying,
  onPlayClick,
}: TrackCardMetaProps) {
  const resolvedHref = contentHref ?? `/${userSlug}/${trackId}`;

  return (
    <div className="flex h-12 items-center gap-3 px-2">
      <TrackCardPlaybackButton
        disabled={isBlocked || !hasPlayback}
        isPlaying={isCurrentTrackPlaying}
        onClick={onPlayClick}
      />

      <div className="flex w-full flex-col">
        <div className="flex items-center gap-2">
          <Link
            href={`/${userSlug}`}
            className="inline-flex self-start text-sm font-bold text-text-muted hover:opacity-40"
          >
            {artistName}
          </Link>

          {/* {repostedBySlug && repostedByDisplayName ? (
            <>
              <Repeat2
                size={15}
                className="shrink-0 text-text-muted"
                aria-label="reposted by"
              />
              <Link
                href={`/${repostedBySlug}`}
                className="shrink-0 text-sm font-bold text-text-muted hover:opacity-40"
              >
                {repostedByDisplayName}
              </Link>
            </>
          ) : null} */}

          {(createdAt || genre) && (
            <div className="ml-auto flex flex-col items-end gap-1">
              {createdAt ? (
                <div className="text-[11px] text-text-muted">
                  <TimeAgo date={createdAt} />
                </div>
              ) : null}

              {genre ? (
                <button className="inline-flex scale-105 cursor-pointer items-center rounded-full bg-interactive-default px-2 py-1 text-xs leading-none text-text-primary transition-colors hover:bg-interactive-hover">
                  <span className="mr-1 font-semibold">#</span>
                  <span>{genre}</span>
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex w-full">
          <Link
            href={resolvedHref}
            className="inline-block w-fit font-semibold text-text-primary hover:opacity-40"
          >
            {title}
          </Link>
        </div>
      </div>
    </div>
  );
}
