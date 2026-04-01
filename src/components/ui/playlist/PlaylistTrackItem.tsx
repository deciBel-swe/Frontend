'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import TrackActions from '@/components/TrackActions';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';

export type PlaylistTrack = {
  trackId: number;
  title: string;
  artist?: string;
  coverUrl?: string;
  durationSeconds: number;
  plays?: string;
  trackUrl: string;
  available?: boolean;
};

export type Playlist = {
  id: number;
  title: string;
  type: 'PLAYLIST' | 'ALBUM' | 'EP';
  isLiked: boolean;
  isPrivate?: boolean;
  tags?: string[];
  updatedAt?: string;
  owner: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  tracks: PlaylistTrack[];
};

function PlayingBars() {
  return (
    <span className="inline-flex items-end gap-[2px] h-4" aria-label="Now playing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-[3px] bg-brand-primary rounded-[1px]"
          style={{ animation: `playingBar 0.6s ease ${delay}ms infinite alternate` }}
        />
      ))}
      <style>{`
        @keyframes playingBar { from { height: 4px; } to { height: 14px; } }
      `}</style>
    </span>
  );
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

type PlaylistTrackItemProps = {
  track: PlaylistTrack;
  index: number;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: () => void;
};

export default function PlaylistTrackItem({
  track,
  index,
  isPlaying,
  isActive,
  onPlay,
}: PlaylistTrackItemProps) {
  const [hovered, setHovered] = useState(false);
  const artistSlug = (track.artist ?? '').toLowerCase().replace(/\s+/g, '-');
  const trackSlug = track.title.toLowerCase().replace(/\s+/g, '-');
  const unavailable = track.available === false;

  return (
    <li
      className={`
        relative flex items-center gap-3 px-3 py-2 rounded cursor-pointer select-none transition-colors
        ${unavailable ? 'opacity-40 pointer-events-none' : ''}
        ${isActive ? 'bg-brand-primary/5' : 'hover:bg-surface-raised'}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
    >
      {/* Cover */}
      <div className="flex-shrink-0 w-8 h-8">
        <HoverPlayImage image={track.coverUrl ?? ''} alt={track.title} />
      </div>

      {/* Number */}
      <span className="text-[11px] font-bold text-text-muted w-5 text-right flex-shrink-0">
        {index + 1}.
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {track.artist && (
          <Link
            href={`/${artistSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-text-muted font-semibold hover:opacity-60 block leading-tight truncate"
          >
            {track.artist}
          </Link>
        )}
        <Link
          href={`/${artistSlug}/${trackSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[13px] font-bold text-text-primary hover:opacity-60 block truncate"
        >
          {track.title}
        </Link>
      </div>

      {/* Right side: actions on hover, plays count otherwise */}
      {hovered ? (
        <div onClick={(e) => e.stopPropagation()}>
          <TrackActions
            size={13}
            showRepost={false}
            showShare={false}
            showEdit={false}
            onLike={() => console.log('liked', track.trackId)}
            onCopy={() => console.log('copy', track.trackId)}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[11px] font-bold text-text-muted flex-shrink-0">
          {isActive && isPlaying ? (
            <PlayingBars />
          ) : (
            <>
              <Play size={11} />
              <span>{track.plays ?? ''}</span>
            </>
          )}
        </div>
      )}

      {/* Duration */}
      <span className="text-[11px] text-text-muted flex-shrink-0 w-9 text-right">
        {formatSeconds(track.durationSeconds)}
      </span>
    </li>
  );
}