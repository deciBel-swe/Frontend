'use client';

import React, { useState } from 'react';
import ScrollableArea from '@/components/ui/ScrollableArea';
import CompactTrackItem from './CompactTrackItem';

export type Track = {
  id: number;
  title: string;
  artist: string;
  coverUrl: string;
  plays: string;
  available?: boolean;
};

type CompactTrackListProps = {
  tracks: Track[];
};

export default function CompactTrackList({ tracks }: CompactTrackListProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleTracks = showAll ? tracks : tracks.slice(0, 5);
  const remainingCount = tracks.length - 5;

  return (
    <div className="sound__trackList">
      <ScrollableArea maxHeight="calc(10*2.5rem)">
        <ul className="trackList__item sc-list-nostyle">
          {visibleTracks.map((track, index) => (
            <CompactTrackItem key={track.id} track={track} index={index} />
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