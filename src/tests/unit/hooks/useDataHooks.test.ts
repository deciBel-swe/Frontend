import { act, renderHook, waitFor } from '@testing-library/react';
import { ApiError } from 'next/dist/server/api-utils';

import { useAuth } from '@/features/auth';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { normalizeApiError } from '@/hooks/useAPI';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useFollowers } from '@/hooks/useFollowers';
import { useFollowing } from '@/hooks/useFollowing';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useListeningHistoryTracks } from '@/hooks/useListeningHistoryTracks';
import { useSuggestedUsers } from '@/hooks/useSuggestedUsers';
import { useTrackEngagementPage } from '@/hooks/useTrackEngagementPage';
import { useTrackVisibility } from '@/hooks/useTrackVisibility';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserRepostPage } from '@/hooks/useUserRepostPage';
import { useUserTracks } from '@/hooks/useUserTracks';
import { playbackService, trackService, userService } from '@/services';

jest.mock('@/services', () => ({
  userService: {
    getSuggestedUsers: jest.fn(),
    getBlockedUsers: jest.fn(),
    unblockUser: jest.fn(),
    getPublicUserByUsername: jest.fn(),
    getPublicUserById: jest.fn(),
    getFollowers: jest.fn(),
    getFollowing: jest.fn(),
    getUsersWhoLikedTrack: jest.fn(),
    getUsersWhoRepostedTrack: jest.fn(),
    getUserMe: jest.fn(),
  },
  trackService: {
    getRepostUsers: jest.fn(),
    getTrackMetadata: jest.fn(),
    getMyLikedTracks: jest.fn(),
    getMyRepostedTracks: jest.fn(),
    getUserTracks: jest.fn(),
    getMyTracks: jest.fn(),
    getTrackVisibility: jest.fn(),
    updateTrackVisibility: jest.fn(),
  },
  playbackService: {
    getListeningHistory: jest.fn(),
  },
}));

jest.mock('@/features/prof/context/ProfileOwnerContext', () => ({
  useProfileOwnerContext: jest.fn(),
}));

jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useAPI', () => ({
  normalizeApiError: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseProfileOwnerContext = useProfileOwnerContext as jest.Mock;
const mockNormalizeApiError = normalizeApiError as jest.Mock;

const mockUserService = userService as jest.Mocked<typeof userService>;
const mockTrackService = trackService as jest.Mocked<typeof trackService>;
const mockPlaybackService = playbackService as jest.Mocked<typeof playbackService>;

describe('low-coverage data hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 77, username: 'owner-user', avatarUrl: '/me.png' },
      isLoading: false,
    });

    mockUseProfileOwnerContext.mockReturnValue(undefined);
    mockNormalizeApiError.mockReturnValue({ statusCode: 500, message: 'boom' });
  });

  describe('useSuggestedUsers', () => {
    it('maps suggested users into user cards', async () => {
      mockUserService.getSuggestedUsers.mockResolvedValue([
        { id: 1, username: 'alpha', avatarUrl: '/a.png', isFollowing: true },
        { id: null, username: null, displayName: 'Bravo', avatarUrl: null },
      ] as any);

      const { result } = renderHook(() => useSuggestedUsers({ size: 10 }));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockUserService.getSuggestedUsers).toHaveBeenCalledWith(10);
      expect(result.current.users).toEqual([
        {
          id: '1',
          username: 'alpha',
          avatarSrc: '/a.png',
          followerCount: 0,
          isFollowing: true,
        },
        {
          id: 'Bravo-1',
          username: 'Bravo',
          avatarSrc: undefined,
          followerCount: 0,
          isFollowing: false,
        },
      ]);
    });

    it('sets error state when request fails', async () => {
      mockUserService.getSuggestedUsers.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useSuggestedUsers());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(true);
      expect(result.current.users).toEqual([]);
    });
  });

  describe('useBlockedUsers', () => {
    it('loads blocked users, refreshes, and unblocks a user', async () => {
      mockUserService.getBlockedUsers
        .mockResolvedValueOnce({
          content: [
            { id: 1, username: 'blocked-a', avatarUrl: '/a.png' },
            { id: null, username: 'invalid' },
          ],
        } as any)
        .mockResolvedValueOnce({
          content: [{ id: 2, username: 'blocked-b', avatarUrl: '/b.png' }],
        } as any);
      mockUserService.unblockUser.mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useBlockedUsers(0, 5));

      await waitFor(() => expect(result.current.users).toHaveLength(1));

      expect(result.current.users[0]).toEqual({
        id: 1,
        username: 'blocked-a',
        avatarUrl: '/a.png',
      });

      await act(async () => {
        await result.current.unblockUser(1);
      });

      expect(result.current.users).toEqual([]);
      expect(result.current.pendingIds).toEqual([]);

      act(() => {
        result.current.refresh();
      });

      await waitFor(() =>
        expect(result.current.users).toEqual([
          { id: 2, username: 'blocked-b', avatarUrl: '/b.png' },
        ])
      );
    });
  });

  describe('useFollowers', () => {
    it('short-circuits when username is empty', async () => {
      const { result } = renderHook(() =>
        useFollowers({ username: '   ', page: 0, size: 5 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.users).toEqual([]);
      expect(mockUserService.getPublicUserByUsername).not.toHaveBeenCalled();
      expect(mockUserService.getFollowers).not.toHaveBeenCalled();
    });

    it('uses context user id when route is managed by context', async () => {
      mockUseProfileOwnerContext.mockReturnValue({
        routeUsername: 'Artist',
        publicUser: { profile: { id: 444 } },
      });

      mockUserService.getFollowers.mockResolvedValue({
        content: [{ id: 8, username: 'follower-1', avatarUrl: '/f.png' }],
      } as any);

      const { result } = renderHook(() =>
        useFollowers({ username: 'artist', page: 1, size: 3 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockUserService.getPublicUserByUsername).not.toHaveBeenCalled();
      expect(mockUserService.getFollowers).toHaveBeenCalledWith(444, {
        page: 1,
        size: 3,
      });
      expect(result.current.users[0].username).toBe('follower-1');
    });

    it('resolves user id by username and handles failures', async () => {
      mockUserService.getPublicUserByUsername.mockResolvedValue({
        profile: { id: 999 },
      } as any);
      mockUserService.getFollowers.mockRejectedValue(new Error('nope'));

      const { result } = renderHook(() =>
        useFollowers({ username: 'remote-user', page: 0, size: 2 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockUserService.getPublicUserByUsername).toHaveBeenCalledWith(
        'remote-user'
      );
      expect(result.current.isError).toBe(true);
      expect(result.current.users).toEqual([]);
    });
  });

  describe('useFollowing', () => {
    it('loads following users through public username lookup', async () => {
      mockUserService.getPublicUserByUsername.mockResolvedValue({
        profile: { id: 321 },
      } as any);
      mockUserService.getFollowing.mockResolvedValue({
        content: [{ id: 9, username: 'following-1', avatarUrl: '/x.png' }],
      } as any);

      const { result } = renderHook(() =>
        useFollowing({ username: 'remote-user', page: 2, size: 4 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockUserService.getFollowing).toHaveBeenCalledWith(321, {
        page: 2,
        size: 4,
      });
      expect(result.current.users[0].id).toBe('9');
      expect(result.current.isError).toBe(false);
    });

    it('sets error state when fetch fails', async () => {
      mockUserService.getPublicUserByUsername.mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() =>
        useFollowing({ username: 'remote-user', page: 0, size: 4 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(true);
      expect(result.current.users).toEqual([]);
    });
  });

  describe('useTrackEngagementPage', () => {
    it('loads users who liked the track', async () => {
      mockUserService.getUsersWhoLikedTrack.mockResolvedValue({
        content: [
          { id: 1, username: 'fan-a', avatarUrl: '/fan-a.png', isFollowing: true },
        ],
      } as any);

      const { result } = renderHook(() =>
        useTrackEngagementPage({ trackId: '42', type: 'likes' })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockUserService.getUsersWhoLikedTrack).toHaveBeenCalledWith(42, {
        page: 0,
        size: 48,
      });
      expect(result.current.users[0].username).toBe('fan-a');
      expect(result.current.isError).toBe(false);
    });

    it('falls back to repost users endpoint when repost API fails', async () => {
      mockUserService.getUsersWhoRepostedTrack.mockRejectedValue(new Error('no list'));
      mockTrackService.getRepostUsers.mockResolvedValue({
        content: [{ id: 2, displayName: 'Reposter', avatarUrl: '/r.png' }],
      } as any);

      const { result } = renderHook(() =>
        useTrackEngagementPage({ trackId: '13', type: 'reposts', page: 1, size: 5 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockTrackService.getRepostUsers).toHaveBeenCalledWith(13, {
        page: 1,
        size: 5,
      });
      expect(result.current.users[0].username).toBe('Reposter');
    });

    it('marks hook as error for invalid track id', async () => {
      const { result } = renderHook(() =>
        useTrackEngagementPage({ trackId: 'bad-id', type: 'likes' })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(true);
      expect(result.current.users).toEqual([]);
    });
  });

  describe('useListeningHistoryTracks', () => {
    it('maps listening history and filters invalid items', async () => {
      mockPlaybackService.getListeningHistory.mockResolvedValue({
        content: [
          { id: 1, title: 'One' },
          { id: 2, title: 'Two' },
          { id: null, title: 'Skip' },
        ],
      } as any);

      mockTrackService.getTrackMetadata
        .mockResolvedValueOnce({
          artist: { username: 'artist-1' },
          title: 'Meta One',
          coverUrl: '/c1.png',
          durationSeconds: 90,
          access: 'PREVIEW',
          waveformData: [0.1],
          releaseDate: '2025-01-01T00:00:00.000Z',
          playCount: 100,
          genre: 'techno',
          isLiked: true,
          isReposted: false,
          likeCount: 4,
          repostCount: 2,
          trackUrl: 'https://t1.mp3',
        } as any)
        .mockRejectedValueOnce(new Error('metadata failed'));

      const { result } = renderHook(() =>
        useListeningHistoryTracks({ page: 0, size: 20 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.tracks).toHaveLength(2);
      expect(result.current.tracks[0].track.title).toBe('Meta One');
      expect(result.current.tracks[0].access).toBe('BLOCKED');
      expect(result.current.tracks[1].track.title).toBe('Two');
      expect(result.current.isError).toBe(false);
    });

    it('sets error state when history call fails', async () => {
      mockPlaybackService.getListeningHistory.mockRejectedValue(new Error('down'));

      const { result } = renderHook(() => useListeningHistoryTracks());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(true);
      expect(result.current.tracks).toEqual([]);
    });
  });

  describe('useLikedTracks', () => {
    it('returns empty data for non-owners', async () => {
      mockUseProfileOwnerContext.mockReturnValue({
        routeUsername: 'other-user',
        isOwner: false,
      });

      const { result } = renderHook(() => useLikedTracks('owner-user'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.tracks).toEqual([]);
      expect(mockTrackService.getMyLikedTracks).not.toHaveBeenCalled();
    });

    it('maps liked tracks for owners and tolerates metadata failures', async () => {
      mockUseProfileOwnerContext.mockReturnValue({
        routeUsername: 'owner-user',
        isOwner: true,
      });

      mockTrackService.getMyLikedTracks.mockResolvedValue({
        content: [
          {
            id: 5,
            title: 'Liked One',
            artist: { username: 'artist-a' },
            coverUrl: '/cover-a.png',
            playCount: 10,
            releaseDate: '2024-04-01T00:00:00.000Z',
            genre: 'house',
            isLiked: true,
            isReposted: false,
            likeCount: 7,
            repostCount: 3,
            trackUrl: 'https://liked-a.mp3',
          },
          {
            id: 6,
            title: 'Liked Two',
            artist: { username: 'artist-b' },
            coverUrl: '/cover-b.png',
            playCount: 5,
            releaseDate: null,
            genre: 'electro',
            isLiked: false,
            isReposted: false,
            likeCount: 0,
            repostCount: 0,
            trackUrl: 'https://liked-b.mp3',
          },
        ],
      } as any);

      mockTrackService.getTrackMetadata
        .mockResolvedValueOnce({
          durationSeconds: 100,
          access: 'PLAYABLE',
          waveformData: [0.1, 0.2],
          coverUrl: '/meta-cover.png',
          trackUrl: 'https://meta-a.mp3',
        } as any)
        .mockRejectedValueOnce(new Error('no metadata'));

      const { result } = renderHook(() => useLikedTracks('owner-user'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.tracks).toHaveLength(2);
      expect(result.current.tracks[0].track.duration).toBe('1:40');
      expect(result.current.tracks[1].track.title).toBe('Liked Two');
    });
  });

  describe('useUserRepostPage', () => {
    it('loads and maps reposted tracks', async () => {
      mockTrackService.getMyRepostedTracks.mockResolvedValue({
        content: [
          {
            id: 11,
            title: 'Repost One',
            artist: { username: 'artist-r' },
            coverUrl: '/r-cover.png',
            playCount: 13,
            releaseDate: '2025-01-01T00:00:00.000Z',
            genre: 'drum and bass',
            isLiked: true,
            isReposted: true,
            likeCount: 10,
            repostCount: 5,
            trackUrl: 'https://r1.mp3',
          },
        ],
      } as any);

      mockTrackService.getTrackMetadata.mockResolvedValue({
        durationSeconds: 80,
        access: 'BLOCKED',
        waveformData: [0.3],
        coverUrl: '/meta-r-cover.png',
        trackUrl: 'https://meta-r1.mp3',
      } as any);

      const { result } = renderHook(() => useUserRepostPage());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].repostedBy).toBe('owner-user');
      expect(result.current.tracks[0].access).toBe('BLOCKED');
      expect(result.current.isError).toBe(false);
    });

    it('sets error state when fetching reposts fails', async () => {
      mockTrackService.getMyRepostedTracks.mockRejectedValue(new Error('bad'));

      const { result } = renderHook(() => useUserRepostPage());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(true);
      expect(result.current.tracks).toEqual([]);
    });
  });

  describe('useUserTracks', () => {
    it('loads owner tracks and refreshes on track-updated event', async () => {
      mockUseProfileOwnerContext.mockReturnValue({
        routeUsername: 'owner-user',
        isOwner: true,
      });

      mockTrackService.getMyTracks.mockResolvedValue([{ id: 101 }] as any);

      const { result } = renderHook(() =>
        useUserTracks({ username: 'owner-user' })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.tracks).toEqual([{ id: 101 }]);

      act(() => {
        window.dispatchEvent(new Event('track-updated'));
      });

      await waitFor(() =>
        expect(mockTrackService.getMyTracks).toHaveBeenCalledTimes(2)
      );
    });

    it('resolves by public user id and handles ApiError failures', async () => {
      mockUseProfileOwnerContext.mockReturnValue({
        routeUsername: 'owner-user',
        isOwner: false,
        publicUser: { profile: { id: 55 } },
      });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockTrackService.getUserTracks.mockRejectedValue(
        new ApiError(500, 'failed to fetch')
      );

      const { result } = renderHook(() =>
        useUserTracks({ username: 'owner-user' })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockTrackService.getUserTracks).toHaveBeenCalledWith(55);
      expect(result.current.isError).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('resolves username to id when no user id is available', async () => {
      mockUseProfileOwnerContext.mockReturnValue({
        routeUsername: 'different-route',
        isOwner: false,
      });

      mockUserService.getPublicUserByUsername.mockResolvedValue({
        profile: { id: 77 },
      } as any);
      mockTrackService.getUserTracks.mockResolvedValue([{ id: 777 }] as any);

      const { result } = renderHook(() =>
        useUserTracks({ username: 'target-user' })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockUserService.getPublicUserByUsername).toHaveBeenCalledWith(
        'target-user'
      );
      expect(result.current.tracks).toEqual([{ id: 777 }]);
    });
  });

  describe('useUserProfile', () => {
    it('uses context-backed profile state when route is managed by context', async () => {
      mockUseProfileOwnerContext.mockReturnValue({
        routeUsername: 'Owner-User',
        publicUser: { profile: { id: 77, username: 'owner-user' } },
        isPublicLoading: false,
        publicError: null,
        publicErrorStatusCode: null,
      });

      const { result } = renderHook(() => useUserProfile('owner-user'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockUserService.getPublicUserByUsername).not.toHaveBeenCalled();
      expect(result.current.profile?.profile.username).toBe('owner-user');
      expect(result.current.isOwner).toBe(true);
      expect(result.current.isError).toBe(false);
    });

    it('fetches profile and normalizes errors when request fails', async () => {
      mockUseProfileOwnerContext.mockReturnValue({ routeUsername: 'other' });
      mockUserService.getPublicUserByUsername.mockRejectedValue(new Error('no user'));
      mockNormalizeApiError.mockReturnValue({
        statusCode: 404,
        message: 'Not found',
      });

      const { result } = renderHook(() => useUserProfile('missing-user'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(true);
      expect(result.current.errorStatusCode).toBe(404);
      expect(result.current.profile).toBeNull();
    });
  });

  describe('useTrackVisibility', () => {
    it('skips loading when no track id is provided', async () => {
      const { result } = renderHook(() => useTrackVisibility(undefined));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.visibility).toBeUndefined();
      expect(result.current.isError).toBe(false);
      expect(mockTrackService.getTrackVisibility).not.toHaveBeenCalled();
    });

    it('fetches and updates visibility with rollback on failure', async () => {
      mockTrackService.getTrackVisibility.mockResolvedValue({
        isPrivate: false,
      } as any);

      const { result } = renderHook(() => useTrackVisibility(100));

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.visibility).toEqual({ isPrivate: false });

      mockTrackService.updateTrackVisibility
        .mockRejectedValueOnce(new Error('save failed'))
        .mockResolvedValueOnce({ isPrivate: true } as any);

      await act(async () => {
        await result.current.updateVisibility({ isPrivate: true } as any);
      });

      expect(result.current.visibility).toEqual({ isPrivate: false });
      expect(result.current.isError).toBe(true);

      await act(async () => {
        await result.current.updateVisibility({ isPrivate: true } as any);
      });

      expect(result.current.visibility).toEqual({ isPrivate: true });
      expect(result.current.isUpdating).toBe(false);
    });
  });
});
