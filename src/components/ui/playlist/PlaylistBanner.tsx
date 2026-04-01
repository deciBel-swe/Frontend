'use client';

import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import TimeAgo from '@/components/TimeAgo';
import Waveform from '@/components/waveform/Waveform';
import { mockWave } from '@/app/[username]/sets/[id]/mockdata';

type PlaylistTrack = {
  trackId: number;
  title: string;
  coverUrl?: string;
  durationSeconds: number;
};

type Playlist = {
  title: string;
  updatedAt?: string;
  tracks: PlaylistTrack[];
  owner: { username: string };
};

type PlaylistBannerProps = {
  playlist: Playlist;
  playingTrack: PlaylistTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
};

export default function PlaylistBanner({
  playlist,
  playingTrack,
  isPlaying,
  onPlayPause,
}: PlaylistBannerProps) {
  const ownerSlug = playlist.owner.username.toLowerCase().replace(/\s+/g, '');
  const coverToShow = playingTrack?.coverUrl ?? playlist.tracks[0]?.coverUrl;

  return (
    <div className="relative w-full h-[260px] md:h-[300px] overflow-hidden bg-surface-raised">
      {/* Blurred background tint from cover */}
      <div
        className="absolute inset-0 bg-surface-raised"
        style={{
          backgroundImage: coverToShow ? `url(${coverToShow})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px) brightness(0.4)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Waveform (only when playing) */}
      {playingTrack && (
        <div className="absolute bottom-8 left-4 right-[220px] md:right-[300px] px-4 pb-2">
            <Waveform
            data={mockWave(50)}  // Replace with actual waveform data for the playing track
            height={70}
            barClassName="bg-neutral-0/40 hover:bg-brand-primary"
            />
        </div>
      )}

      {/* Top-right cover */}
      <div className="absolute top-0 right-0 w-[220px] md:w-[300px] h-full group cursor-pointer">
        {coverToShow ? (
          <img src={coverToShow} alt={playlist.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-overlay flex items-center justify-center">
            <span className="text-text-muted text-sm">Upload image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-surface-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-surface-default text-text-primary text-xs font-semibold px-3 py-1.5 rounded">
            Replace image
          </span>
        </div>
      </div>

      {/* Bottom-left: play + meta + track count */}
      <div className="absolute top-4 left-4 flex items-end gap-3">
        <button
          onClick={onPlayPause}
          className="w-18 h-18 rounded-full bg-neutral-950 flex items-center justify-center hover:bg-neutral-800 transition-colors flex-shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying
            ? <Pause size={25} fill="white" className="text-neutral-0" />
            : <Play size={25} fill="white" className="text-neutral-0 translate-x-[1px]" />
          }
        </button>

        <div className="flex flex-col">
            <div className="inline-block gap-2">
          <span className="inline-block bg-neutral-950 text-neutral-0 text-3xl font-bold px-2.5 py-1.5 mr-5 w-fit">
            {playlist.title}
            </span>
            {playlist.updatedAt && (
            <span className="text-neutral-200 text-[11px] mt-0.5" suppressHydrationWarning>
              Updated <TimeAgo date={playlist.updatedAt} />
            </span>
          )}
          </div>
          
          
          <Link href={`/${ownerSlug}`}>
            <span className="inline-block bg-neutral-950 text-neutral-0 text-xl font-semibold px-2.5 py-1.5 w-fit hover:opacity-70 transition-opacity">
              {playlist.owner.username}
            </span>
          </Link>
          {/* {playlist.updatedAt && (
            <span className="text-neutral-200 text-[11px] mt-0.5" suppressHydrationWarning>
              Updated <TimeAgo date={playlist.updatedAt} />
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
}