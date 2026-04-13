'use client';

/**
 * SearchResults — renders the correct card type for each search tab.
 *
 * Stateless: receives resolved data arrays and result counts from the page;
 * does not fetch anything itself.
 *
 * Tab → card mapping:
 *   `tracks`    → TrackCard (existing component, unchanged)
 *   `playlists` → PlaylistCard (existing component, unchanged)
 *   `albums`    → PlaylistCard (albums share the same card shape)
 *   `people`    → UserCard variant="horizontal"
 *   `everything`→ all three sections in sequence, with a combined count
 *                  header matching SoundCloud's "Found X playlists, Y+ tracks,
 *                  Z people" format
 *
 * Loading state renders animated skeleton rows. Empty state renders a
 * contextual "No results for …" message.
 *
 * @example
 * <SearchResults
 *   tab="everything"
 *   query="ijk"
 *   tracks={tracks}
 *   playlists={playlists}
 *   people={people}
 *   totalTracks={500}
 *   totalPlaylists={293}
 *   totalPeople={317}
 * />
 */

import TrackCard from '@/components/tracks/track-card/TrackCard';
import PlaylistCard from '@/components/playlist/playlist-card/PlaylistCard';
import UserCard from '@/features/social/components/UserCard';
import type { SearchTab } from '@/features/search/SearchSidebar';
import type { TrackCardProps } from '@/components/tracks/track-card';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import type { UserCardData } from '@/features/social/components/UserCard';

interface SearchResultsProps {
  tab: SearchTab;
  query: string;
  tracks?: TrackCardProps[];
  playlists?: PlaylistHorizontalProps[];
  people?: UserCardData[];
  totalTracks?: number;
  totalPlaylists?: number;
  totalPeople?: number;
  isLoading?: boolean;
}

function ResultCount({ label }: { label: string }) {
  return (
    <p className="text-sm text-text-muted mb-4">{label}</p>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <p className="text-sm text-text-muted py-8 text-center">
      No results for &ldquo;{query}&rdquo;
    </p>
  );
}

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 rounded-lg bg-surface-default animate-pulse mb-3" />
      ))}
    </>
  );
}

// ── Per-tab renderers ────────────────────────────────────────────────────────

function TrackResults({ tracks = [], total, query }: { tracks: TrackCardProps[]; total?: number; query: string }) {
  if (!tracks.length) return <EmptyState query={query} />;
  return (
    <>
      <ResultCount label={`Found ${total ? `${total.toLocaleString()}+` : tracks.length} tracks`} />
      {tracks.map((props, index) => (
        <TrackCard key={index} {...props} />
      ))}
    </>
  );
}

function PlaylistResults({ playlists = [], total, query }: { playlists: PlaylistHorizontalProps[]; total?: number; query: string }) {
  if (!playlists.length) return <EmptyState query={query} />;
  return (
    <>
      <ResultCount label={`Found ${total ? `${total.toLocaleString()}` : playlists.length} playlists`} />
      {playlists.map((props, index) => (
        <PlaylistCard key={index} {...props} />
      ))}
    </>
  );
}

function PeopleResults({ people = [], total, query }: { people: UserCardData[]; total?: number; query: string }) {
  if (!people.length) return <EmptyState query={query} />;
  return (
    <>
      <ResultCount label={`Found ${total ? `${total.toLocaleString()}` : people.length} people`} />
      <div className="flex flex-col  ">
        {people.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            variant="horizontal"
            showFollowButton
          />
        ))}
      </div>
    </>
  );
}

function EverythingResults({
  tracks = [],
  playlists = [],
  people = [],
  totalTracks,
  totalPlaylists,
  totalPeople,
  query,
}: {
  tracks: TrackCardProps[];
  playlists: PlaylistHorizontalProps[];
  people: UserCardData[];
  totalTracks?: number;
  totalPlaylists?: number;
  totalPeople?: number;
  query: string;
}) {
  const counts = [
    totalPlaylists && `${totalPlaylists.toLocaleString()} playlists`,
    totalTracks && `${totalTracks.toLocaleString()}+ tracks`,
    totalPeople && `${totalPeople.toLocaleString()} people`,
  ].filter(Boolean).join(', ');

  return (
    <>
      {counts && <ResultCount label={`Found ${counts}`} />}

      {tracks.length > 0 && (
        <section className="mb-6">
          {tracks.map((props, index) => (
            <TrackCard key={index} {...props} />
          ))}
        </section>
      )}

      {playlists.length > 0 && (
        <section className="mb-6">
          {playlists.map((props, index) => (
            <PlaylistCard key={index} {...props} />
          ))}
        </section>
      )}

      {people.length > 0 && (
        <section>
          <div className="flex flex-col divide-y divide-border-default">
            {people.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                variant="horizontal"
                showFollowButton
              />
            ))}
          </div>
        </section>
      )}

      {!tracks.length && !playlists.length && !people.length && (
        <EmptyState query={query} />
      )}
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SearchResults({
  tab,
  query,
  tracks = [],
  playlists = [],
  people = [],
  totalTracks,
  totalPlaylists,
  totalPeople,
  isLoading,
}: SearchResultsProps) {
  if (isLoading) return <SkeletonRows />;

  switch (tab) {
    case 'tracks':
      return <TrackResults tracks={tracks} total={totalTracks} query={query} />;
    case 'playlists':
      return <PlaylistResults playlists={playlists} total={totalPlaylists} query={query} />;
    case 'albums':
      return <PlaylistResults playlists={playlists} total={totalPlaylists} query={query} />;
    case 'people':
      return <PeopleResults people={people} total={totalPeople} query={query} />;
    case 'everything':
    default:
      return (
        <EverythingResults
          tracks={tracks}
          playlists={playlists}
          people={people}
          totalTracks={totalTracks}
          totalPlaylists={totalPlaylists}
          totalPeople={totalPeople}
          query={query}
        />
      );
  }
}