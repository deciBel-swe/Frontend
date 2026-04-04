'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Track } from './CompactTrackList';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
import { Play } from 'lucide-react';
import TrackActions from '@/components/TrackActions'

type CompactTrackItemProps = {
  track: Track;
  index: number;
};

export default function CompactTrackItem({ track, index }: CompactTrackItemProps) {
  const [hovered, setHovered] = useState(false);

  const artistSlug = track.artist.toLowerCase().replace(/\s+/g, '-');

  return (
    <li
      className={`compactTrackList__item group relative ${track.available === false ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="trackItem flex items-center gap-2 p-1 relative min-h-[32px]">
        {/* IMAGE */}
        <div className="trackItem__image shrink-0 w-7 h-7">
          <HoverPlayImage image={track.coverUrl} alt={track.title} />
        </div>

        {/* Track number */}
        <div className="trackItem__numberWrapper text-[11px] font-bold text-text-muted w-4 shrink-0">
          {index + 1}.
        </div>

        {/* Track info */}
        <div className="trackItem__content flex-1 min-w-0">
          <Link
            href={`/${artistSlug}/${track.id}`}
            className="trackItem__title text-[13px] text-primary font-bold truncate block hover:opacity-40"
          >
            {track.title}
          </Link>
        </div>
        {/* Plays - hide when hovered */}
        <div className={`trackItem__plays text-[11px] font-bold text-text-muted mr-2 transition-opacity duration-200 flex gap-1 ${hovered ? 'opacity-0' : 'opacity-100'}`}>
          <Play size={14} /> {track.plays}
        </div>

        {/* Action buttons */}
        {hovered && (
        <TrackActions
         size={14}
            className="bsolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center bg-background/80 backdrop-blur-sm pl-2"
            onLike={() => console.log('Liked track', track.id)}
            onCopy={() => console.log('Copy link', track.id)}
         />
        )}
      </div>
    </li>
  );
}