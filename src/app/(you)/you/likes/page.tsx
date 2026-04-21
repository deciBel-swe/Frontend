'use client';


import MinimalTrackCard from '@/components/tracks/MinimalTrackCard';
import TrackList from '@/components/tracks/TrackList';
import Button from '@/components/buttons/Button';
import FilterBar from '@/components/nav/FilterBar';
import LibrarySection from '@/features/library/LibrarySection';
import { useAuth } from '@/features/auth';
import type { PlayerTrack } from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useTrackLayoutPreference } from '@/hooks/useTrackLayoutPreference';
import { LayoutGrid, List } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Page() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { layout, setLayout, isCompact } = useTrackLayoutPreference('compact');
  const { tracks, isLoading } = useLikedTracks(user?.username ?? '', {
    forCurrentUser: true,
  });
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

  const compactQueueTracks = useMemo(
    () =>
      filteredTracks
        .map((item) => {
          if (item.playback) {
            return item.playback;
          }

          if (!item.trackUrl) {
            return null;
          }

          return playerTrackMappers.fromAdapterInput(
            {
              id: item.track.id,
              title: item.track.title,
              trackUrl: item.trackUrl,
              artist: item.track.artist,
              coverUrl: item.track.cover,
              waveformData: item.waveform,
              durationSeconds: item.track.durationSeconds,
            },
            { access: item.access ?? 'PLAYABLE' }
          );
        })
        .filter((item): item is PlayerTrack => item !== null),
    [filteredTracks]
  );

  return (
    <section className="px-8 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="hidden sm:block font-extrabold">
          Hear the tracks you’ve liked:
        </h2>

        <FilterBar
          value={filterText}
          onChange={setFilterText}
          placeholder='Filter'
        />

        <div className="inline-flex items-center rounded border border-border-default overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLayout('compact')}
            aria-pressed={isCompact}
            className={layout === 'compact' ? 'bg-interactive-hover text-text-primary' : ''}
            aria-label="Compact layout"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLayout('non-compact')}
            aria-pressed={!isCompact}
            className={layout === 'non-compact' ? 'bg-interactive-hover text-text-primary' : ''}
            aria-label="List layout"
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {isCompact ? (
        <LibrarySection title="Likes" className="mb-0" hideHeader>
          {isAuthLoading || isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`likes-compact-skeleton-${index}`}
                  className="shrink-0 rounded-lg bg-surface-raised animate-pulse m-2 w-26 h-26 md:w-32 md:h-32 lg:w-40 lg:h-40"
                />
              ))
            : filteredTracks.map((item) => (
                <MinimalTrackCard
                  key={item.trackId}
                  item={item}
                  queueTracks={compactQueueTracks}
                  queueSource="likes"
                />
              ))}
        </LibrarySection>
      ) : (
        <TrackList
          tracks={filteredTracks}
          isLoading={isAuthLoading || isLoading}
          showHeader={false}
        />
      )}
    </section>
  );
}