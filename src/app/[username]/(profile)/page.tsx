'use client';
import PlaylistCard from '@/components/playlist/playlist-card/PlaylistCard';
import TrackCard from '@/components/tracks/track-card/TrackCard';
import TrackList from '@/components/tracks/TrackList';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { useUserPlaylistsPage } from '@/hooks/useUserPlaylistsPage';
import { useUserRepostPage } from '@/hooks/useUserRepostPage';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';

const TrackListFallback = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="bg-surface-default rounded-lg h-40 animate-pulse"
      />
    ))}
  </>
);

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="mb-4 text-base font-bold text-text-primary">{children}</h2>
);

export default function Page() {
  const { username } = useParams<{ username: string }>();
  const pageSize = 10;
  const { data: profileData } = usePublicUser(username);
  const {
    cards: playlistCards,
    isLoading: arePlaylistsLoading,
    isError: arePlaylistsError,
  } = useUserPlaylistsPage({
    username,
    page: 0,
    size: pageSize,
    infinite: false,
  });
  const {
    items: repostItems,
    isLoading: areRepostsLoading,
    isError: areRepostsError,
  } = useUserRepostPage(username, {
    page: 0,
    size: pageSize,
    infinite: false,
  });

  return (
    <div className="w-full min-w-0 space-y-12">
      <section>
        <SectionTitle>Tracks</SectionTitle>
        <Suspense fallback={<TrackListFallback />}>
          <TrackList
            username={username}
            artistAvatar={profileData?.profile.profilePic}
            fetchPage={0}
            fetchSize={pageSize}
            fetchInfinite={false}
          />
        </Suspense>
      </section>

      <section>
        <SectionTitle>Playlists</SectionTitle>
        {arePlaylistsLoading ? (
          <TrackListFallback />
        ) : arePlaylistsError ? (
          <p className="text-text-muted text-sm">
            Failed to load playlists. Please try again later.
          </p>
        ) : playlistCards.length === 0 ? (
          <p className="text-text-muted text-sm">No playlists published yet.</p>
        ) : (
          <>
            {playlistCards.map((card) => (
              <PlaylistCard key={card.trackId} {...card} />
            ))}
          </>
        )}
      </section>

      <section>
        <SectionTitle>Reposts</SectionTitle>
        {areRepostsLoading ? (
          <TrackListFallback />
        ) : areRepostsError ? (
          <p className="text-text-muted text-sm">
            Failed to load reposted resources. Please try again later.
          </p>
        ) : repostItems.length === 0 ? (
          <p className="text-text-muted text-sm">No reposts published yet.</p>
        ) : (
          <>
            {repostItems.map((item) => {
              if (item.kind === 'track') {
                return <TrackCard key={item.id} {...item.card} />;
              }

              return <PlaylistCard key={item.id} {...item.card} />;
            })}
          </>
        )}
      </section>
    </div>
  );
}
