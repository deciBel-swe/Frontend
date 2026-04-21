'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GripVertical, Play } from 'lucide-react';
import TrackActions from '@/components/tracks/actions/TrackActions';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';

export type PlaylistTrack = {
  id: number;
  trackSlug?: string;
  artistUsername?: string;
  title: string;
  artist?: string;
  coverUrl?: string;
  durationSeconds?: number;
  plays?: string;
  trackUrl?: string;
  available?: boolean;
  isLiked?: boolean;
  isReposted?: boolean;
  likeCount?: number;
  repostCount?: number;
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
    <span className="inline-flex items-end gap-0.5 h-4" aria-label="Now playing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-0.75 bg-brand-primary rounded-[1px]"
          style={{ animation: `playingBar 0.6s ease ${delay}ms infinite alternate` }}
        />
      ))}
      <style>{`
        @keyframes playingBar { from { height: 4px; } to { height: 14px; } }
      `}</style>
    </span>
  );
}

type PlaylistTrackItemProps = {
  track: PlaylistTrack;
  index: number;
  isPlaying: boolean;
  isActive: boolean;
  isDragTarget?: boolean;
  isDragging?: boolean;
  draggable?: boolean;
  onPlay: () => void;
  onLike?: () => void;
  onRepost?: () => void;
  onDragStart?: (event: React.DragEvent<HTMLLIElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLLIElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd?: () => void;
};

export default function PlaylistTrackItem({
  track,
  index,
  isPlaying,
  isActive,
  isDragTarget = false,
  isDragging = false,
  draggable = false,
  onPlay,
  onLike,
  onRepost,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: PlaylistTrackItemProps) {
  const [hovered, setHovered] = useState(false);
  const artistSlug = (track.artist ?? '').toLowerCase().replace(/\s+/g, '-');
  const artistPathSlug =
    track.artistUsername?.trim().toLowerCase() || artistSlug;
  const unavailable = track.available === false;

  return (
    <li
      className={`
        relative flex items-center gap-3 px-3 py-2 rounded cursor-pointer select-none transition-colors
        ${unavailable ? 'opacity-40 pointer-events-none' : ''}
        ${hovered ? 'hover:bg-surface-raised' : ''}
        ${isDragTarget ? 'ring-1 ring-brand-primary/60' : ''}
        ${isDragging ? 'opacity-60' : 'opacity-100'}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div
        className={`text-text-muted cursor-grab active:cursor-grabbing ${
          draggable ? 'opacity-100' : 'opacity-40'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <GripVertical size={14} className="opacity-60" />
      </div>

      {/* Cover */}
      <div className="shrink-0 w-8 h-8">
        <HoverPlayImage image={track.coverUrl ?? ''} alt={track.title} />
      </div>

      {/* Number */}
      <span className={`text-sm font-bold w-5 text-right shrink-0 ${isActive ? 'text-brand-primary' : 'text-text-muted'}`}>
        {index + 1}.
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0 flex items-center gap-1 truncate">
        {track.artist && (
            <>
            <Link
                href={`/${artistSlug}`}
                onClick={(e) => e.stopPropagation()}
                className={`text-sm font-semibold hover:opacity-60 shrink-0 ${isActive ? 'text-brand-primary' : 'text-text-muted'}`}
            >
                {track.artist}
            </Link>
            <span className={isActive ? 'text-brand-primary' : 'text-text-muted'}>·</span>
            </>
        )}
        <Link
          href={`/${artistPathSlug}/${track.trackSlug ?? track.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm font-bold hover:opacity-60 truncate ${isActive ? 'text-brand-primary' : 'text-text-primary'}`}
        >
            {track.title}
        </Link>
        </div>

      {/* Right side: actions on hover, plays count otherwise */}
      {hovered || isActive ? (
        <div onClick={(e) => e.stopPropagation()}>
          <TrackActions
            size={13}
            showRepost
            showEdit={false}
            isLiked={track.isLiked ?? false}
            isReposted={track.isReposted ?? false}
            onLike={onLike}
            onRepost={onRepost}
            showShare={false}
            showCopy={false}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs font-bold text-text-muted shrink-0">
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
    </li>
  );
}