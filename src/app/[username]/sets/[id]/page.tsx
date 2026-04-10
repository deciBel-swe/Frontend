'use client';

import React, { useState } from 'react';
import { MOCK_PLAYLIST } from '@/app/[username]/sets/[id]/mockdata';
import { PlaylistTrack } from '@/features/playlist/components/PlaylistTrackItem';
import PlaylistBanner from '@/features/playlist/components/PlaylistBanner';
import PlaylistActionBar from '@/features/playlist/components/PlaylistActionBar';
import PlaylistTrackList from '@/features/playlist/components/PlaylistTrackItem';
import PlaylistTagsSection from '@/features/playlist/components/PlaylistTagsSection';
import Link from 'next/link';
import AvatarImage from '@/components/avatars/AvatarImage';

/**
 * /sets/[id]/page.tsx
 *
 * Single playlist page — stateless UI, data sourced from MOCK_PLAYLIST.
 * Replace MOCK_PLAYLIST with a real fetch from:
 *   GET /users/me/playlists/{playlistId}
 * when the API is ready.
 */
export default function PlaylistPage() {
  const playlist = MOCK_PLAYLIST;

  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeTrack: PlaylistTrack | null =
    playlist.tracks.find((t) => t.trackId === activeTrackId) ?? null;

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
      // Start from first track
      const first = playlist.tracks[0];
      if (first) {
        setActiveTrackId(first.trackId);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying((v) => !v);
    }
  }

  const ownerSlug = playlist.owner.username.toLowerCase().replace(/\s+/g, '');
  return (
    <div className="w-full min-w-0">
      {/* ── Banner ── */}
      <PlaylistBanner
        playlist={playlist}
        playingTrack={activeTrack}
        isPlaying={isPlaying}
        onPlayPause={handleBannerPlayPause}
      />

      {/* ── Action bar ── */}
      <PlaylistActionBar
        onShare={() => console.log('share')}
        onCopyLink={() => console.log('copy link')}
        onEdit={() => console.log('edit')}
        onDelete={() => console.log('delete')}
      />

      {/* ── Body ── */} 
        
      <div className="flex flex-col md:flex-row gap-0">
        {/* LEFT SIDEBAR — avatar + owner info */}
        <aside className="hidden md:flex flex-col items-center gap-3 w-44 shrink-0 px-4 py-6 ">
            <Link href={`/${ownerSlug}`} className="hover:opacity-80 transition-opacity">
                <AvatarImage
                    src={playlist.owner.avatarUrl}
                    alt={playlist.owner.username}
                    size={80}
                    shape="circle"
                />
            </Link>
            <Link
                href={`/${ownerSlug}`}
                className="text-sm font-bold text-text-primary hover:opacity-60 transition-opacity text-center"
            >
                {playlist.owner.username}
            </Link>
        </aside>

        {/* LEFT — tracks + tags */}
        <div className="flex-1 min-w-0 px-4 py-5 space-y-5">
          <PlaylistTagsSection
            isPrivate={playlist.isPrivate}
            tags={playlist.tags}
          />
          
            <ul className="flex flex-col list-none p-0 m-0">
                {playlist.tracks.map((track, index) => (
                    <PlaylistTrackList
                    key={track.trackId}
                    track={track}
                    index={index}
                    isActive={activeTrackId === track.trackId}
                    isPlaying={isPlaying && activeTrackId === track.trackId}
                    onPlay={() => handlePlayTrack(track.trackId)}
                    />
                ))}
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