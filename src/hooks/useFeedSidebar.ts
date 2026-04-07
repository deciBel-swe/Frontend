import { useEffect, useMemo, useState } from 'react';

import type { PlayerTrack } from '@/features/player/contracts/playerContracts';
import { playerTrackMappers } from '@/features/player/utils/playerTrackMappers';
import { userService } from '@/services';
import type { SearchUser } from '@/types/user';
import { useListeningHistoryTracks } from '@/hooks/useListeningHistoryTracks';

type SidebarArtist = {
  id?: number;
  username: string;
  displayName?: string;
  followers: number;
  tracks: number;
  isFollowing?: boolean;
  imageUrl?: string;
  artistUrl?: string;
};

type SidebarHistoryRow = {
  trackId?: string | number;
  image: string;
  artist: string;
  artistUsername?: string;
  title: string;
  playback?: PlayerTrack;
  stats: {
    plays: string;
    likes: string;
    reposts: string;
    comments: string;
  };
};

const compactCount = (value: number | undefined): string => {
  if (!value || value <= 0) {
    return '0';
  }

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export function useFeedSidebar() {
  const [artists, setArtists] = useState<SidebarArtist[]>([]);
  const [isArtistsLoading, setIsArtistsLoading] = useState(false);
  const [isArtistsError, setIsArtistsError] = useState(false);

  const {
    tracks: historyTracks,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useListeningHistoryTracks({ page: 0, size: 8 });

  useEffect(() => {
    let isCancelled = false;

    const loadSuggestedArtists = async () => {
      setIsArtistsLoading(true);
      setIsArtistsError(false);

      try {
        const suggestedUsers = await userService.getSuggestedUsers(5);

        const mappedArtists = await Promise.all(
          suggestedUsers.map(async (user: SearchUser) => {
            const profileUsername = user.username?.trim() || 'unknown';
            const profileDisplayName = user.displayName?.trim() || undefined;
            const profilePath = `/${encodeURIComponent(profileUsername)}`;

            if (typeof user.id !== 'number') {
              return {
                id: undefined,
                username: profileUsername,
                displayName: profileDisplayName,
                followers: 0,
                tracks: 0,
                isFollowing: user.isFollowing ?? false,
                imageUrl: user.avatarUrl ?? undefined,
                artistUrl: profilePath,
              } satisfies SidebarArtist;
            }

            try {
              const publicUser = await userService.getPublicUserById(user.id);

              return {
                id: user.id,
                username: publicUser.profile.username,
                displayName: publicUser.profile.displayName || undefined,
                followers: publicUser.profile.followerCount,
                tracks: publicUser.profile.trackCount,
                isFollowing: publicUser.profile.isFollowing,
                imageUrl: publicUser.profile.profilePic,
                artistUrl: `/${encodeURIComponent(publicUser.profile.username)}`,
              } satisfies SidebarArtist;
            } catch {
              return {
                id: user.id,
                username: profileUsername,
                displayName: profileDisplayName,
                followers: 0,
                tracks: 0,
                isFollowing: user.isFollowing ?? false,
                imageUrl: user.avatarUrl ?? undefined,
                artistUrl: profilePath,
              } satisfies SidebarArtist;
            }
          })
        );

        if (!isCancelled) {
          setArtists(mappedArtists);
        }
      } catch {
        if (!isCancelled) {
          setArtists([]);
          setIsArtistsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsArtistsLoading(false);
        }
      }
    };

    void loadSuggestedArtists();

    return () => {
      isCancelled = true;
    };
  }, []);

  const history = useMemo<SidebarHistoryRow[]>(
    () =>
      historyTracks.map((track) => {
        const playback = track.playback ?? (
          track.trackUrl
            ? playerTrackMappers.fromAdapterInput(
                {
                  id: track.track.id,
                  title: track.track.title,
                  trackUrl: track.trackUrl,
                  artist: track.track.artist,
                  coverUrl: track.track.cover,
                  waveformData: track.waveform,
                  durationSeconds: track.track.durationSeconds,
                },
                { access: track.access ?? 'PLAYABLE' }
              )
            : undefined
        );

        return {
          trackId: track.track.id,
          image: track.track.cover,
          artist: track.track.artist,
          artistUsername: track.user.username,
          title: track.track.title,
          playback,
          stats: {
            plays: compactCount(track.track.plays),
            likes: compactCount(track.track.likeCount),
            reposts: compactCount(track.track.repostCount),
            comments: compactCount(track.track.comments),
          },
        };
      }),
    [historyTracks]
  );

  return {
    artists,
    history,
    isLoading: isArtistsLoading || isHistoryLoading,
    isError: isArtistsError || isHistoryError,
  };
}
