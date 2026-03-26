'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Repeat2, Share2, Copy, MoreHorizontal } from 'lucide-react';
import Button from '@/components/buttons/Button';
import { Track } from './CompactTrackList';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
import { Play } from 'lucide-react';

type CompactTrackItemProps = {
  track: Track;
  index: number;
};

export default function CompactTrackItem({ track, index }: CompactTrackItemProps) {
  const [hovered, setHovered] = useState(false);

  const artistSlug = track.artist.toLowerCase().replace(/\s+/g, '-');
  const trackSlug = track.title.toLowerCase().replace(/\s+/g, '-');

  return (
    <li
      className={`compactTrackList__item relative ${track.available === false ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="trackItem flex items-center gap-2 p-1 relative">
        {/* IMAGE */}
        <div className="trackItem__image flex-shrink-0 w-7 h-7">
          <HoverPlayImage image={track.coverUrl} alt={track.title} />
        </div>

        {/* Track number */}
        <div className="trackItem__numberWrapper text-[11px] font-bold text-text-muted w-6">
          {index + 1}.
        </div>

        {/* Track info */}
        <div className="trackItem__content flex-1 truncate">
          <Link
            href={`/${artistSlug}/${trackSlug}`}
            className="trackItem__title text-[13px] text-primary text-sm inline-flex self-start font-bold truncate hover:opacity-40"
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
          <div className="trackItem__actions flex gap-1 absolute right-2 top-1/2 -translate-y-1/2 bg-transparent">
            <Button variant="ghost" aria-label="Like"><Heart size={14} /></Button>
            <Button variant="ghost" aria-label="Repost"><Repeat2 size={14} /></Button>
            <Button variant="ghost" aria-label="Share"><Share2 size={14} /></Button>
            <Button variant="ghost" aria-label="Copy link"><Copy size={14} /></Button>
            <Button variant="ghost" aria-label="More"><MoreHorizontal size={14} /></Button>
          </div>
        )}
      </div>
    </li>
  );
}