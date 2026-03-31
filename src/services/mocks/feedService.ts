import { config } from '@/config';
import { PaginatedTrackFeedResponse } from '@/types/feed';
import { FeedService, PaginationParams } from '../api/feedService';
import {
  getMockTracksStore,
  getMockUsersStore,
  resolveCurrentMockUserId,
  syncAuthAccountsToMockUsers,
} from './mockSystemStore';

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
    const followedUserIds = new Set(followedUsers.map((user) => user.id));
    const followedUsernames = new Set(
      followedUsers.map((user) => user.username.toLowerCase())
    );
    const blockedUserIds = currentUser?.blocked ?? new Set<number>();
    const blockedUsernames = new Set(
      getMockUsersStore()
        .filter((user) => blockedUserIds.has(user.id))
        .map((user) => user.username.toLowerCase())
    );
    const repostedIds = new Set(
      currentUser?.reposts.map((track) => track.id) ?? []
    );

    const followedUsersTracks = getMockTracksStore()
      .filter((track) => {
        const artistId = track.artist.id;
        const artistUsername = track.artist.username.toLowerCase();
        const isFollowedArtist =
          followedUserIds.has(artistId) ||
          followedUsernames.has(artistUsername);

        if (!isFollowedArtist) {
          return false;
        }

        const isBlockedArtist =
          blockedUserIds.has(artistId) || blockedUsernames.has(artistUsername);
        return !isBlockedArtist;
      })
      .map((track) => ({
        id: track.id,
        title: track.title,
        artist: {
          id: track.artist.id,
          username: track.artist.username,
        },
        trackUrl: track.trackUrl,
        coverUrl: track.coverImageDataUrl ?? track.coverUrl,
        waveformUrl: track.waveformUrl,
        genre: track.genre,
        tags: [...track.tags],
        description: track.description,
        releaseDate: track.releaseDate,
        uploadDate: track.releaseDate,
        likeCount: track.likes.size,
        repostCount: repostedIds.has(track.id) ? 1 : 0,
        playCount: track.likes.size * 25,
        isLiked: track.likes.has(currentUserId),
        isReposted: repostedIds.has(track.id),
      }));

    const totalElements = followedUsersTracks.length;
    const totalPages =
      totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
    const start = pageNumber * pageSize;
    const content = followedUsersTracks.slice(start, start + pageSize);
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
