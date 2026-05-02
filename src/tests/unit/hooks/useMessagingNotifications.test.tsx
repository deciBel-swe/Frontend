import { act, renderHook, waitFor } from '@testing-library/react';

import { useInbox } from '@/hooks/useInbox';
import { useNotifications } from '@/hooks/useNotifications';

const mockUseAuth = jest.fn();
const mockSubscribeToInbox = jest.fn();
const mockSubscribeToNotifications = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockGetTrackMetadata = jest.fn();

jest.mock('@/features/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/services', () => ({
  messageService: {
    subscribeToInbox: (...args: unknown[]) => mockSubscribeToInbox(...args),
  },
  notificationService: {
    subscribeToNotifications: (...args: unknown[]) =>
      mockSubscribeToNotifications(...args),
    markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
  },
  trackService: {
    getTrackMetadata: (...args: unknown[]) => mockGetTrackMetadata(...args),
  },
  playlistService: {
    getPlaylist: jest.fn(),
  },
}));

describe('messaging and notifications hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        username: 'alex.johnson',
        displayName: 'Alex Johnson',
        avatarUrl: null,
      },
    });
  });

  it('maps inbox conversations to unread-aware inbox items', async () => {
    mockSubscribeToInbox.mockImplementation(
      (
        _userId: number,
        onUpdate: (
          conversations: Array<{
            id: string;
            participantIds: string[];
            participants: Array<{
              id: string;
              username: string;
              displayName?: string | null;
              avatarUrl?: string | null;
            }>;
            lastMessage: { content: string; senderId: string; createdAt: string };
            unreadCounts: Record<string, number>;
            manuallyUnreadBy: Record<string, boolean>;
          }>
        ) => void
      ) => {
        onUpdate([
          {
            id: 'conv_1',
            participantIds: ['1', '2'],
            participants: [
              { id: '1', username: 'alex.johnson', displayName: 'Alex Johnson' },
              { id: '2', username: 'jordan.smith', displayName: 'Jordan Smith' },
            ],
            lastMessage: {
              content: 'Check this out',
              senderId: '2',
              createdAt: '2026-04-21T08:00:00Z',
            },
            unreadCounts: { '1': 2, '2': 0 },
            manuallyUnreadBy: { '1': false, '2': false },
          },
        ]);

        return jest.fn();
      }
    );

    const { result } = renderHook(() => useInbox());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.inboxItems).toHaveLength(1);
    expect(result.current.inboxItems[0]).toMatchObject({
      conversationId: 'conv_1',
      unreadCount: 2,
      lastMessagePreview: 'Check this out',
    });
    expect(result.current.unreadCount).toBe(2);
  });

  it('enriches notifications with routes and clears unread count on mark-all-read', async () => {
    mockSubscribeToNotifications.mockImplementation(
      (
        _userId: number,
        onUpdate: (
          notifications: Array<{
            id: string;
            type: 'FOLLOW' | 'LIKE' | 'DM';
            user: {
              id: number;
              username: string;
              displayName: string;
              avatarUrl: string | null;
              isFollowing?: boolean;
              followerCount?: number;
            };
            resource: {
              resourceType: 'USER' | 'TRACK' | 'PLAYLIST';
              resourceId: number;
            };
            isRead: boolean;
            createdAt: string;
            conversationId?: string;
          }>
        ) => void
      ) => {
        onUpdate([
          {
            id: 'notif_follow',
            type: 'FOLLOW',
            user: {
              id: 2,
              username: 'jordan.smith',
              displayName: 'Jordan Smith',
              avatarUrl: null,
              isFollowing: false,
              followerCount: 10,
            },
            resource: {
              resourceType: 'USER',
              resourceId: 2,
            },
            isRead: false,
            createdAt: '2026-04-21T09:00:00Z',
          },
          {
            id: 'notif_like',
            type: 'LIKE',
            user: {
              id: 3,
              username: 'musicapp',
              displayName: 'Music App',
              avatarUrl: null,
            },
            resource: {
              resourceType: 'TRACK',
              resourceId: 42,
            },
            isRead: false,
            createdAt: '2026-04-21T08:45:00Z',
          },
          {
            id: 'notif_dm',
            type: 'DM',
            user: {
              id: 2,
              username: 'jordan.smith',
              displayName: 'Jordan Smith',
              avatarUrl: null,
            },
            resource: {
              resourceType: 'USER',
              resourceId: 2,
            },
            isRead: true,
            createdAt: '2026-04-21T08:30:00Z',
            conversationId: 'conv_1',
          },
        ]);

        return jest.fn();
      }
    );

    mockGetTrackMetadata.mockResolvedValue({
      id: 42,
      title: 'Ocean Echoes',
      trackSlug: 'ocean-echoes',
      artist: {
        id: 5,
        username: 'artist.one',
        displayName: 'Artist One',
        avatarUrl: null,
      },
      trackUrl: 'https://example.com/tracks/42',
      durationSeconds: 120,
      access: 'PLAYABLE',
      coverUrl: 'https://example.com/cover.jpg',
      waveformUrl: 'https://example.com/wave.json',
      waveformData: [],
      genre: 'Ambient',
      tags: [],
      description: '',
      releaseDate: '',
      isLiked: false,
      isReposted: false,
      likeCount: 0,
      repostCount: 0,
      playCount: 0,
      uploadDate: '2026-04-20T00:00:00Z',
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await waitFor(() => expect(mockGetTrackMetadata).toHaveBeenCalledWith(42));

    const followNotification = result.current.notifications.find(
      (notification) => notification.id === 'notif_follow'
    );
    const likeNotification = result.current.notifications.find(
      (notification) => notification.id === 'notif_like'
    );
    const dmNotification = result.current.notifications.find(
      (notification) => notification.id === 'notif_dm'
    );

    expect(followNotification?.targetUrl).toBe('/jordan.smith');
    expect(dmNotification?.targetUrl).toBe('/messages?conversation=conv_1');
    await waitFor(() =>
      expect(
        result.current.notifications.find(
          (notification) => notification.id === 'notif_like'
        )?.targetUrl
      ).toBe('/artist.one/ocean-echoes')
    );
    expect(result.current.unreadCount).toBe(2);

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(mockMarkAllAsRead).toHaveBeenCalledWith(1);
    expect(result.current.unreadCount).toBe(0);
  });
});
