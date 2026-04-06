'use client';
import { useParams } from 'next/navigation';
import { useUserPlaylists } from '@/hooks/usePlaylists';
import PlaylistCardWide from '@/components/PlaylistCardWide';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';

interface PlaylistWithMetadata {
  id: number;
  title: string;
  updatedAt?: string;
  likeCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  isReposted?: boolean;
  tracks?: Array<{
    trackId: number;
    title: string;
    durationSeconds: number;
    trackUrl: string;
    coverUrl?: string; // Add optional coverUrl for the tracks
  }>;
}

const TrackListFallback = () => (
  <div className="flex flex-col w-full">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="w-full h-40 bg-surface-default rounded-lg animate-pulse mb-4"
      />
    ))}
  </div>
);

export default function Page() {
  const { username } = useParams<{ username: string }>();

  const { data: profileData } = usePublicUser(username);
  const userId = profileData?.profile.id;

  const {
    data: playlists,
    isLoading: isPlaylistsLoading,
    isError,
  } = useUserPlaylists(userId as number);

  const isLoading = !profileData || isPlaylistsLoading;

  if (isLoading) return <TrackListFallback />;

  if (isError)
    return (
      <p className="text-text-muted text-sm px-4">Failed to load playlists.</p>
    );

  if (!playlists || playlists.length === 0) {
    return <p className="text-text-muted text-sm px-4">No playlists found.</p>;
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col">
        {playlists.map((item) => {
          const playlist = item as unknown as PlaylistWithMetadata;

          return (
            <PlaylistCardWide
              key={playlist.id}
              playlistId={String(playlist.id)}
              user={{
                name: username,
                avatar:
                  profileData?.profile.profilePic ||
                  '/images/default_song_image.png',
              }}
              playlist={{
                id: playlist.id,
                title: playlist.title,
                cover:
                  playlist.tracks?.[0]?.coverUrl ||
                  '/images/default_song_image.png',
                trackCount: playlist.tracks?.length || 0,
                updatedAt: playlist.updatedAt,
                likeCount: playlist.likeCount,
                repostCount: playlist.repostCount,
                isLiked: playlist.isLiked,
                isReposted: playlist.isReposted,
                tracks: playlist.tracks,
              }}
              showEditButton={userId === profileData?.profile.id}
              showHeader={false}
            />
          );
        })}{' '}
      </div>
    </div>
  );
}
