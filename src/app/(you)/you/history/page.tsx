'use client';

import { useMemo, useState } from 'react';

import TrackList from '@/components/tracks/TrackList';
import FilterBar from '@/components/nav/FilterBar';
import { useListeningHistoryTracks } from '@/hooks/useListeningHistoryTracks';

export default function Page() {
  const { tracks, isLoading } = useListeningHistoryTracks({ page: 0, size: 50 });
  const [filterText, setFilterText] = useState('');

  const filteredTracks = useMemo(() => {
    if (!filterText.trim()) {
      return tracks;
    }

    const normalized = filterText.toLowerCase();
    return tracks.filter((track) =>
      track.track.title.toLowerCase().includes(normalized) ||
      (track.track.artist.displayName || track.track.artist.username)
        .toLowerCase()
        .includes(normalized)
    );
  }, [filterText, tracks]);

  return (
    <section className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="hidden sm:block font-extrabold">Your listening history</h2>
        <FilterBar
          value={filterText}
          onChange={setFilterText}
          placeholder='Filter'
        />
      </div>

      <TrackList tracks={filteredTracks} isLoading={isLoading} showHeader={false} />
    </section>
  );
}
