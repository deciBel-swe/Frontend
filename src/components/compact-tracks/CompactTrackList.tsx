'use client';

import React, { useState } from 'react';
import ScrollableArea from '@/components/scroll/ScrollableArea';
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';
import CompactTrackItem from './CompactTrackItem';

export type Track = {
  id: number;
  trackSlug?: string;
  artistUsername?: string;
  title: string;
  artist: string;
  coverUrl: string;
  plays: string;
  trackUrl?: string;
  durationSeconds?: number;
  available?: boolean;
  isLiked?: boolean;
  isReposted?: boolean;
  likeCount?: number;
  repostCount?: number;
  access?: 'PLAYABLE' | 'BLOCKED' | 'PREVIEW';
};

type CompactTrackListProps = {
  tracks: Track[];
  queueTracks?: PlayerTrack[];
  queueSource?: QueueSource;
};

export default function CompactTrackList({
  tracks,
  queueTracks,
  queueSource,
}: CompactTrackListProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleTracks = showAll ? tracks : tracks.slice(0, 5);
  const remainingCount = tracks.length - 5;

  return (
    <div className="sound__trackList">
      <ScrollableArea maxHeight="calc(10*2.5rem)">
        <ul className="trackList__item sc-list-nostyle">
          {visibleTracks.map((track, index) => (
            <CompactTrackItem
              key={track.id}
              track={track}
              index={index}
              queueTracks={queueTracks}
              queueSource={queueSource}
            />
          ))}
        </ul>
      </ScrollableArea>

      {tracks.length > 5 && (
        <div
          className="mt-5 text-sm text-primary cursor-pointer font-bold hover:opacity-40"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? 'View fewer tracks'
            : `View ${remainingCount} more track${remainingCount > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
