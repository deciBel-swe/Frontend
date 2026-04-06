'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePlayerStore } from '@/features/player/store/playerStore';
import { useAuth } from '@/features/auth';
import {
  usePlaylist,
  useReorderPlaylistTracks,
  useRemoveTrackFromPlaylist,
} from '@/hooks/usePlaylists';

import PlaylistBanner from '@/components/ui/playlist/PlaylistBanner';
import PlaylistActionBar from '@/components/ui/playlist/PlaylistActionBar';
import PlaylistTrackItem, {
  type PlaylistTrack,
} from '@/components/ui/playlist/PlaylistTrackItem';
import PlaylistTagsSection from '@/components/ui/playlist/PlaylistTagsSection';
import AvatarImage from '@/components/ui/AvatarImage';

/**
 * /sets/[id]/page.tsx
 *
 * Single playlist page — stateless UI, data sourced from MOCK_PLAYLIST.
 * Replace MOCK_PLAYLIST with a real fetch from:
 *   GET /users/me/playlists/{playlistId}
 * when the API is ready.
 */
export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const playlistId = Number(id);
  const { user: currentUser } = useAuth();

  // Queries & Mutations
  const { data: playlist, isLoading, isError } = usePlaylist(playlistId);
  const { mutate: reorderTracks } = useReorderPlaylistTracks();
  const { mutate: removeTrack } = useRemoveTrackFromPlaylist();

  // Local Optimistic State for Snappy Drag & Drop
  const [optimisticTracks, setOptimisticTracks] = useState<PlaylistTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Drag and Drop State
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const addPlaylistToQueue = usePlayerStore(
    (state) => state.addPlaylistToQueue
  );
  useEffect(() => {
    if (playlist?.tracks) {
      setOptimisticTracks(playlist.tracks);
    }
  }, [playlist?.tracks]);

  function handlePlayTrack(trackId: number) {
    if (activeTrackId === trackId) {
      setIsPlaying((v) => !v);
    } else {
      setActiveTrackId(trackId);
      setIsPlaying(true);
    }
  }

  function handleBannerPlayPause() {
    if (activeTrackId === null) {
      const first = optimisticTracks[0];
      if (first) {
        setActiveTrackId(first.trackId);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying((v) => !v);
    }
  }

  const handleRemoveTrack = (trackId: number) => {
    if (!window.confirm('Remove track from playlist?')) return;

    // Optimistic UI update
    setOptimisticTracks((prev) => prev.filter((t) => t.trackId !== trackId));
    removeTrack({ playlistId, trackId });
  };

  // --- Drag & Drop Logic ---

  const handleDragStart = (
    event: React.DragEvent<HTMLLIElement>,
    index: number
  ) => {
    if (optimisticTracks.length < 2) return;
    setDragIndex(index);
    setDragOverIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLLIElement>,
    index: number
  ) => {
    if (dragIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLLIElement>,
    targetIndex: number
  ) => {
    event.preventDefault();

    if (dragIndex !== null && dragIndex !== targetIndex) {
      // 1. Optimistic Update
      const newTracks = [...optimisticTracks];
      const [movedTrack] = newTracks.splice(dragIndex, 1);
      newTracks.splice(targetIndex, 0, movedTrack);
      setOptimisticTracks(newTracks);

      // 2. Fire Mutation to Server
      reorderTracks({
        playlistId,
        trackIds: newTracks.map((t) => t.trackId),
      });
    }

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-text-muted animate-pulse">
        Loading playlist...
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <div className="p-8 text-status-error">Failed to load playlist.</div>
    );
  }

  const activeTrack: PlaylistTrack | null =
    optimisticTracks.find((t) => t.trackId === activeTrackId) ?? null;

  // Safely map the owner to guarantee avatarUrl exists for the UI without using 'any'
  const safeOwner = {
    id: playlist.owner?.id ?? 0,
    username: playlist.owner?.username ?? 'Unknown',
    avatarUrl: (playlist.owner as unknown as { avatarUrl?: string })?.avatarUrl,
  };
  const ownerSlug = safeOwner.username.toLowerCase().replace(/\s+/g, '');
  const isOwner = currentUser?.id === safeOwner.id;

  const isPrivate = Boolean(playlist.isPrivate);
  const tags = (playlist.tags as string[]) || [];
  const handleAddPlaylistToQueue = () => {
    if (optimisticTracks.length === 0) return;

    // Map UI tracks to PlayerTracks
    const playerTracks = optimisticTracks.map((t) => ({
      id: t.trackId,
      title: t.title,
      artistName: t.artist ?? safeOwner.username,
      trackUrl: t.trackUrl,
      access: 'PLAYABLE' as const,
      durationSeconds: t.durationSeconds,
      coverUrl: t.coverUrl,
    }));

    addPlaylistToQueue(playerTracks);
    alert('Playlist added to queue!'); // Optional: replace with a toast notification if you have one
  };
  return (
    <div className="w-full min-w-0">
      {/* ── Banner ── */}
      <PlaylistBanner
        playlist={{
          title: playlist.title,
          owner: safeOwner,
          tracks: optimisticTracks,
          updatedAt: playlist.updatedAt as string | undefined,
        }}
        playingTrack={activeTrack}
        isPlaying={isPlaying}
        onPlayPause={handleBannerPlayPause}
      />

      {/* ── Action bar ── */}
      <PlaylistActionBar
        onShare={() => console.log('share')}
        onCopyLink={() => console.log('copy link')}
        onEdit={isOwner ? () => console.log('edit') : undefined}
        onDelete={isOwner ? () => console.log('delete') : undefined}
        onAddToQueue={handleAddPlaylistToQueue}
      />

      {/* ── Body ── */}
      <div className="flex flex-col md:flex-row gap-0">
        {/* LEFT SIDEBAR — avatar + owner info */}
        <aside className="hidden md:flex flex-col items-center gap-3 w-44 shrink-0 px-4 py-6 ">
          <Link
            href={`/${ownerSlug}`}
            className="hover:opacity-80 transition-opacity"
          >
            <AvatarImage
              src={safeOwner.avatarUrl}
              alt={safeOwner.username}
              size={80}
              shape="circle"
            />
          </Link>
          <Link
            href={`/${ownerSlug}`}
            className="text-sm font-bold text-text-primary hover:opacity-60 transition-opacity text-center"
          >
            {safeOwner.username}
          </Link>
        </aside>

        {/* LEFT — tracks + tags */}
        <div className="flex-1 min-w-0 px-4 py-5 space-y-5">
          <PlaylistTagsSection isPrivate={isPrivate} tags={tags} />

          <ul className="flex flex-col list-none p-0 m-0">
            {optimisticTracks.length === 0 ? (
              <div className="py-8 text-sm text-text-muted text-center italic">
                This playlist is empty.
              </div>
            ) : (
              optimisticTracks.map((track, index) => (
                <PlaylistTrackItem
                  key={track.trackId}
                  track={track}
                  index={index}
                  isActive={activeTrackId === track.trackId}
                  isPlaying={isPlaying && activeTrackId === track.trackId}
                  onPlay={() => handlePlayTrack(track.trackId)}
                  isOwner={isOwner}
                  draggable={isOwner && optimisticTracks.length > 1}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDrop={(event) => handleDrop(event, index)}
                  onDragEnd={handleDragEnd}
                  isDragging={dragIndex === index}
                  isDragTarget={dragOverIndex === index && dragIndex !== index}
                  onRemove={() => handleRemoveTrack(track.trackId)}
                />
              ))
            )}
          </ul>
        </div>

        {/* RIGHT — sidebar placeholder (wire up your own sidebar here) */}
        <aside className="hidden md:block w-64 px-4 py-5 shrink-0">
          {/* <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
            You might also like
          </p> */}
        </aside>
      </div>
    </div>
  );
}
