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
 *   `people`    → UserCard variant="horizontal"
 *   `everything`→ mixed track/playlist/people sequence in backend order,
 *                  with a combined count header
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
import type { EverythingOrderItem } from '@/features/search/types/searchContracts';

interface SearchResultsProps {
  tab: SearchTab;
  query: string;
  currentUserId?: string;
  tracks?: TrackCardProps[];
  playlists?: PlaylistHorizontalProps[];
  people?: UserCardData[];
  totalTracks?: number;
  totalPlaylists?: number;
  totalPeople?: number;
  isLoading?: boolean;
  everythingOrder?: EverythingOrderItem[];
}

function ResultCount({ label }: { label: string }) {
  return <p className="text-sm text-text-muted mb-4">{label}</p>;
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
        <div
          key={i}
          className="h-40 rounded-lg bg-surface-default animate-pulse mb-3"
        />
      ))}
    </>
  );
}

// ── Per-tab renderers ────────────────────────────────────────────────────────

function TrackResults({
  tracks = [],
  total,
  query,
}: {
  tracks: TrackCardProps[];
  total?: number;
  query: string;
}) {
  if (!tracks.length) return <EmptyState query={query} />;
  return (
    <>
      <ResultCount
        label={`Found ${total ? `${total.toLocaleString()}+` : tracks.length} tracks`}
      />
      {tracks.map((trackItem) => (
        <TrackCard key={trackItem.trackId} {...trackItem} />
      ))}
    </>
  );
}

function PlaylistResults({
  playlists = [],
  total,
  query,
}: {
  playlists: PlaylistHorizontalProps[];
  total?: number;
  query: string;
}) {
  if (!playlists.length) return <EmptyState query={query} />;
  return (
    <>
      <ResultCount
        label={`Found ${total ? `${total.toLocaleString()}` : playlists.length} playlists`}
      />
      {playlists.map((playlistItem) => (
        <PlaylistCard key={playlistItem.trackId} {...playlistItem} />
      ))}
    </>
  );
}

function PeopleResults({
  people = [],
  total,
  query,
  currentUserId,
}: {
  people: UserCardData[];
  total?: number;
  query: string;
  currentUserId?: string;
}) {
  if (!people.length) return <EmptyState query={query} />;
  return (
    <>
      <ResultCount
        label={`Found ${total ? `${total.toLocaleString()}` : people.length} people`}
      />
      <div className="flex flex-col  ">
        {people.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            variant="horizontal"
            showFollowButton
            isOwnProfile={currentUserId === user.id}
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
  everythingOrder = [],
  query,
  currentUserId,
}: {
  tracks: TrackCardProps[];
  playlists: PlaylistHorizontalProps[];
  people: UserCardData[];
  totalTracks?: number;
  totalPlaylists?: number;
  totalPeople?: number;
  everythingOrder?: EverythingOrderItem[];
  query: string;
  currentUserId?: string;
}) {
  const counts = [
    totalPlaylists && `${totalPlaylists.toLocaleString()} playlists`,
    totalTracks && `${totalTracks.toLocaleString()}+ tracks`,
    totalPeople && `${totalPeople.toLocaleString()} people`,
  ]
    .filter(Boolean)
    .join(', ');

  const tracksById = new Map(tracks.map((track) => [track.trackId, track]));
  const playlistsById = new Map(
    playlists.map((playlist) => [playlist.trackId, playlist])
  );
  const peopleById = new Map(people.map((person) => [person.id, person]));

  const orderedRows = everythingOrder
    .map((item) => {
      if (item.kind === 'track') {
        const track = tracksById.get(item.id);
        if (!track) {
          return null;
        }

        return <TrackCard key={`track-${item.id}`} {...track} />;
      }

      if (item.kind === 'playlist') {
        const playlist = playlistsById.get(item.id);
        if (!playlist) {
          return null;
        }

        return <PlaylistCard key={`playlist-${item.id}`} {...playlist} />;
      }

      if (item.kind === 'user') {
        const user = peopleById.get(item.id);
        if (!user) {
          return null;
        }

        return (
          <UserCard
            key={`user-${item.id}`}
            user={user}
            variant="horizontal"
            showFollowButton
            isOwnProfile={currentUserId === user.id}
          />
        );
      }

      return null;
    })
    .filter(Boolean);

  const hasOrderedEverything = orderedRows.length > 0;

  return (
    <>
      {counts && <ResultCount label={`Found ${counts}`} />}

      {hasOrderedEverything ? (
        <section className="flex flex-col gap-3">{orderedRows}</section>
      ) : (
        <>
          {tracks.length > 0 && (
            <section className="mb-6">
              {tracks.map((trackItem) => (
                <TrackCard key={trackItem.trackId} {...trackItem} />
              ))}
            </section>
          )}

          {playlists.length > 0 && (
            <section className="mb-6">
              {playlists.map((playlistItem) => (
                <PlaylistCard key={playlistItem.trackId} {...playlistItem} />
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
                    isOwnProfile={currentUserId === user.id}
                  />
                ))}
              </div>
            </section>
          )}
        </>
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
  currentUserId,
  tracks = [],
  playlists = [],
  people = [],
  totalTracks,
  totalPlaylists,
  totalPeople,
  isLoading,
  everythingOrder,
}: SearchResultsProps) {
  if (isLoading) return <SkeletonRows />;

  switch (tab) {
    case 'tracks':
      return <TrackResults tracks={tracks} total={totalTracks} query={query} />;
    case 'playlists':
      return (
        <PlaylistResults
          playlists={playlists}
          total={totalPlaylists}
          query={query}
        />
      );
    case 'people':
      return (
        <PeopleResults
          people={people}
          total={totalPeople}
          query={query}
          currentUserId={currentUserId}
        />
      );
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
          everythingOrder={everythingOrder}
          query={query}
          currentUserId={currentUserId}
        />
      );
  }
}
