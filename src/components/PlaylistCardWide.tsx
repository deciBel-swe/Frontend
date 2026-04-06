'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Play, Repeat2, ListMusic } from 'lucide-react';
import Button from '@/components/buttons/Button';
import Waveform from '@/components/waveform/Waveform';
import TrackActions from '@/components/TrackActions';
import TimeAgo from '@/components/TimeAgo';
import { usePlayerStore } from '@/features/player/store/playerStore';
import {
  useDeletePlaylist,
  useTogglePlaylistLike,
  useTogglePlaylistRepost,
} from '@/hooks/usePlaylists';
type PlaylistCardWideProps = {
  playlistId: string;
  user: {
    name: string;
    avatar: string;
  };
  playlist: {
    id: number;
    title: string;
    cover: string;
    trackCount: number;
    updatedAt?: string;
    isLiked?: boolean;
    isReposted?: boolean;
    likeCount?: number;
    repostCount?: number;
    tracks?: Array<{
      trackId: number;
      title: string;
      durationSeconds: number;
      trackUrl: string;
      coverUrl?: string;
    }>;
  };
  showEditButton?: boolean;
  showHeader?: boolean;
  onEdit?: () => void;
};

export default function PlaylistCardWide({
  playlistId,
  user,
  playlist,
  showEditButton = false,
  showHeader = true,
  onEdit,
}: PlaylistCardWideProps) {
  const userSlug = user.name.toLowerCase().replace(/\s+/g, '');
  const playlistLink = `/${userSlug}/sets/${playlistId}`;

  const addPlaylistToQueue = usePlayerStore(
    (state) => state.addPlaylistToQueue
  );
  const [isLiked, setIsLiked] = useState(playlist.isLiked ?? false);
  const [isReposted, setIsReposted] = useState(playlist.isReposted ?? false);

  const { mutate: toggleLike } = useTogglePlaylistLike();
  const { mutate: toggleRepost } = useTogglePlaylistRepost();

  const handleLike = () => {
    setIsLiked(!isLiked); // Optimistic update
    toggleLike({ playlistId: Number(playlistId), isLiked });
  };

  const handleRepost = () => {
    setIsReposted(!isReposted); // Optimistic update
    toggleRepost({ playlistId: Number(playlistId), isReposted });
  };

  const handleShare = () => {
    const fullUrl = `${window.location.origin}${playlistLink}`;
    if (navigator.share) {
      navigator
        .share({ title: playlist.title, url: fullUrl })
        .catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  const handleAddToQueue = () => {
    if (!playlist.tracks || playlist.tracks.length === 0) return;

    const playerTracks = playlist.tracks.map((t) => ({
      id: t.trackId,
      title: t.title,
      artistName: user.name, // The playlist owner
      trackUrl: t.trackUrl,
      access: 'PLAYABLE' as const,
      durationSeconds: t.durationSeconds,
      coverUrl: t.coverUrl || playlist.cover,
    }));

    addPlaylistToQueue(playerTracks);
  };

  const { mutate: deletePlaylist } = useDeletePlaylist();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(Number(playlistId));
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/${user.name.toLowerCase().replace(/\s+/g, '')}/sets/${playlistId}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Link copied!');
  };
  return (
    <div className="bg-surface-default text-text-primary p-2 sm:p-3 rounded-lg w-full my-3">
      {/* HEADER */}
      {showHeader && (
        <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
          <Link href={`/${userSlug}`}>
            <Image
              src={user.avatar}
              className="w-8 h-8 rounded-full object-cover"
              width={32}
              height={32}
              alt={user.name}
            />
          </Link>
          <div>
            <span className="text-text-primary font-medium hover:opacity-40">
              <Link href={`/${userSlug}`}>{user.name}</Link>
            </span>{' '}
            posted a playlist
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex gap-2 sm:gap-3 md:gap-4 items-start min-w-0">
        <Link
          href={playlistLink}
          className="w-24 sm:w-28 md:w-36 aspect-square shrink-0 -mt-1"
        >
          <Image
            src={playlist.cover}
            className="w-full h-full object-cover rounded"
            width={400}
            height={400}
            alt={playlist.title}
          />
        </Link>

        <div className="flex flex-col flex-1 gap-2 min-w-0">
          <div className="flex items-center gap-3 h-12 px-2">
            {/* Play button goes to the playlist page */}
            <Link href={playlistLink}>
              <Button
                variant="ghost"
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0 flex items-center justify-center bg-neutral-0"
              >
                <Play
                  className="relative z-10 w-6 h-6 text-neutral-1000"
                  fill="currentColor"
                />
              </Button>
            </Link>

            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2">
                <Link
                  href={`/${userSlug}`}
                  className="text-text-muted text-sm font-bold hover:opacity-40"
                >
                  {user.name}
                </Link>
                {playlist.updatedAt && (
                  <div className="ml-auto text-xs text-text-muted">
                    <TimeAgo date={playlist.updatedAt} />
                  </div>
                )}
              </div>
              <Link
                href={playlistLink}
                className="w-fit text-text-primary font-semibold hover:opacity-40"
              >
                {playlist.title}
              </Link>
            </div>
          </div>

          {/* Placeholder Waveform - Visual consistency with Track Card */}
          <div className="w-full opacity-50 grayscale">
            <Waveform data={Array.from({ length: 60 }, () => Math.random())} />
          </div>

          <div className="flex items-center w-full">
            <TrackActions
              size={16}
              showEdit={showEditButton}
              showDelete={showEditButton}
              showAddToQueue={true}
              isLiked={isLiked}
              isReposted={isReposted}
              onLike={handleLike}
              onRepost={handleRepost}
              onAddToQueue={handleAddToQueue}
              onEdit={onEdit}
              onDelete={handleDelete}
              onShare={handleShare}
              onCopy={handleCopyLink}
            />

            <div className="ml-auto flex items-center gap-4 text-xs text-text-muted font-semibold">
              <div className="flex items-center gap-1">
                <Heart size={14} />
                <span>{playlist.likeCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat2 size={14} />
                <span>{playlist.repostCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ListMusic size={14} />
                <span>{playlist.trackCount} tracks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
