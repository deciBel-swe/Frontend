import { PaginatedTrackFeedResponse } from '@/types/feed';
import type { FeedItemDTO, ResourceRefFullDTO } from '@/types/discovery';
import type { UserSummaryDTO } from '@/types/user';
import type { FullTrackDTO } from '@/types/tracks';
import type { FullPlaylistDTO } from '@/types/playlists';
import { FeedService, PaginationParams } from '../api/feedService';
import {
  getMockTracksStore,
  getMockUsersStore,
  resolveCurrentMockUserId,
  syncAuthAccountsToMockUsers,
} from './mockSystemStore';
import {
  canAccessMockResource,
  resolveMockResourceAccess,
} from './mockResourceUtils';

const MOCK_DELAY_MS = 120;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export class MockFeedService implements FeedService {
  async getfeed(
    params?: PaginationParams
  ): Promise<PaginatedTrackFeedResponse> {
    await delay();
    syncAuthAccountsToMockUsers();

    const pageNumber = Math.max(0, params?.page ?? 0);
    const pageSize = Math.max(1, params?.size ?? 20);
    const currentUserId = resolveCurrentMockUserId();
    const currentUser = getMockUsersStore().find(
      (user) => user.id === currentUserId
    );
    const followedUsers = getMockUsersStore().filter((user) =>
      currentUser?.following.has(user.id)
    );
    const blockedUserIds = currentUser?.blocked ?? new Set<number>();

    const userSummaryFromId = (userId: number): UserSummaryDTO => {
      const user = getMockUsersStore().find((item) => item.id === userId);
      if (!user) {
        return {
          id: userId,
          username: 'unknown',
          displayName: 'unknown',
          avatarUrl: '',
          isFollowing: false,
          followerCount: 0,
          trackCount: 0,
        };
      }

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.profile.profilePic ?? '',
        isFollowing: currentUser?.following.has(user.id) ?? false,
        followerCount: user.followers.size,
        trackCount: user.tracks.length,
      };
    };

    const buildFullTrack = (trackId: number): FullTrackDTO | null => {
      const track = getMockTracksStore().find((item) => item.id === trackId);
      if (!track) {
        return null;
      }
      if (
        !canAccessMockResource({
          isPrivate: track.isPrivate,
          ownerId: track.artist.id,
          viewerId: currentUserId,
        })
      ) {
        return null;
      }

      return {
        id: track.id,
        title: track.title,
        trackSlug: track.trackSlug,
        artist: userSummaryFromId(track.artist.id),
        trackUrl: track.trackUrl,
        coverUrl: track.coverImageDataUrl ?? track.coverUrl,
        waveformUrl: track.waveformUrl,
        genre: track.genre,
        isReposted:
          currentUser?.reposts.some((repost) => repost.id === track.id) ?? false,
        isLiked:
          currentUser?.likedTracks.some((likedTrack) => likedTrack.id === track.id) ??
          false,
        tags: [...track.tags],
        releaseDate: track.releaseDate,
        playCount: (track.likes ?? track.likeCount) * 25,
        CompletedPlayCount: 0,
        likeCount: track.likes ?? track.likeCount,
        repostCount: track.reposters ?? track.repostCount,
        commentCount: 0,
        isPrivate: track.isPrivate,
        trackDurationSeconds: track.durationSeconds ?? 0,
        uploadDate: track.releaseDate,
        description: track.description ?? '',
        trendingRank: 0,
        access: resolveMockResourceAccess({
          isPrivate: track.isPrivate,
          ownerId: track.artist.id,
          viewerId: currentUserId,
        }),
        secretToken: track.secretLink ?? '',
        trackPreviewUrl: track.trackUrl,
      };
    };

    const buildFullPlaylist = (playlistId: number): FullPlaylistDTO | null => {
      const users = getMockUsersStore();
      for (const user of users) {
        const playlist = user.playlists.find((item) => item.id === playlistId);
        if (!playlist) {
          continue;
        }
        if (
          !canAccessMockResource({
            isPrivate: playlist.isPrivate,
            ownerId: user.id,
            viewerId: currentUserId,
          })
        ) {
          continue;
        }

        const totalDurationSeconds = playlist.tracks.reduce(
          (sum, item) => sum + (item.durationSeconds ?? 0),
          0
        );

        const playlistTracks = playlist.tracks
          .map((item) => buildFullTrack(item.trackId))
          .filter((item): item is FullTrackDTO => Boolean(item));

        const firstTrack = playlistTracks[0];
        const firstTrackRecord = getMockTracksStore().find(
          (track) => track.id === playlist.tracks[0]?.trackId
        );

        return {
          id: playlist.id,
          title: playlist.title,
          playlistSlug: playlist.playlistSlug,
          isLiked: playlist.isLiked,
          description: playlist.description ?? '',
          isPrivate: playlist.isPrivate,
          coverArtUrl: playlist.CoverArt ?? '',
          totalDurationSeconds,
          trackCount: playlistTracks.length,
          owner: userSummaryFromId(user.id),
          genre: 'playlist-genre',
          createdAt: new Date().toISOString(),
          tracks: playlistTracks,
          secretToken: playlist.secretLink ?? '',
          firstTrackWaveformUrl:
            firstTrack?.waveformUrl ?? '/images/default-waveform.json',
          firstTrackWaveformData: firstTrackRecord?.waveformData ?? [],
        };
      }

      return null;
    };

    const buildResource = (
      type: 'TRACK' | 'PLAYLIST',
      id: number
    ): ResourceRefFullDTO | null => {
      if (type === 'TRACK') {
        const track = buildFullTrack(id);
        if (!track) {
          return null;
        }
        return {
          type: 'TRACK',
          id: id,
          playlist: null,
          track,
          user: null,
        };
      }

      const playlist = buildFullPlaylist(id);
      if (!playlist) {
        return null;
      }
      return {
        type: 'PLAYLIST',
        id: id,
        playlist,
        track: null,
        user: null,
      };
    };

    const feedItems: FeedItemDTO[] = [];
    let index = 0;
    const nextDate = () =>
      new Date(Date.now() - index++ * 60000).toISOString();

    for (const user of followedUsers) {
      if (blockedUserIds.has(user.id)) {
        continue;
      }

      const userTracks = getMockTracksStore().filter(
        (track) => track.artist.id === user.id
      );
      for (const track of userTracks) {
        const resource = buildResource('TRACK', track.id);
        if (!resource) {
          continue;
        }
        feedItems.push({
          id: track.id,
          type: 'TRACK_POSTED',
          resource,
          createdAt: nextDate(),
        });
      }

      for (const playlist of user.playlists) {
        const resource = buildResource('PLAYLIST', playlist.id);
        if (!resource) {
          continue;
        }
        feedItems.push({
          id: playlist.id,
          type: 'PLAYLIST_POSTED',
          resource,
          createdAt: nextDate(),
        });
      }

      for (const likedTrack of user.likedTracks) {
        const resource = buildResource('TRACK', likedTrack.id);
        if (!resource) {
          continue;
        }
        feedItems.push({
          id: likedTrack.id,
          type: 'TRACK_LIKED',
          resource,
          likedBy: userSummaryFromId(user.id),
          createdAt: nextDate(),
        });
      }

      for (const repost of user.reposts) {
        const resource = buildResource('TRACK', repost.id);
        if (!resource) {
          continue;
        }
        feedItems.push({
          id: repost.id,
          type: 'TRACK_REPOSTED',
          resource,
          repostedBy: userSummaryFromId(user.id),
          createdAt: nextDate(),
        });
      }

      for (const repostedPlaylistId of user.repostedPlaylists ?? []) {
        const resource = buildResource('PLAYLIST', repostedPlaylistId);
        if (!resource) {
          continue;
        }

        feedItems.push({
          id: repostedPlaylistId,
          type: 'PLAYLIST_REPOSTED',
          resource,
          repostedBy: userSummaryFromId(user.id),
          createdAt: nextDate(),
        });
      }

      for (const likedPlaylistId of user.likedPlaylists) {
        const resource = buildResource('PLAYLIST', likedPlaylistId);
        if (!resource) {
          continue;
        }
        feedItems.push({
          id: likedPlaylistId,
          type: 'PLAYLIST_LIKED',
          resource,
          likedBy: userSummaryFromId(user.id),
          createdAt: nextDate(),
        });
      }
    }

    const sorted = [...feedItems].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    const totalElements = sorted.length;
    const totalPages =
      totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
    const start = pageNumber * pageSize;
    const content = sorted.slice(start, start + pageSize);
    const isLast = pageNumber >= totalPages - 1;

    return {
      content,
      pageNumber,
      pageSize,
      totalElements,
      totalPages,
      isLast,
    };
  }
}
