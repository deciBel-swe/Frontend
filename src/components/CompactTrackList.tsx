'use client';

import React, { useState } from 'react';
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
      {/* WRAPPER WITH MAX HEIGHT */}
      <div className="max-h-[calc(10*2.5rem)] overflow-y-auto 
    [&::-webkit-scrollbar]:w-1 
    [&::-webkit-scrollbar-thumb]:bg-gray-400/20
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/60
      ">
        <ul className="trackList__item sc-list-nostyle">
          {visibleTracks.map((track, index) => (
            <CompactTrackItem key={track.id} track={track} index={index} />
          ))}
        </ul>
      </div>

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