import { act, renderHook, waitFor } from '@testing-library/react';

import { normalizeApiError } from '@/hooks/useAPI';
import {
  useMarkAllAsRead,
  useNotificationSettings,
  useNotifications,
  useRegisterDeviceToken,
  useUnreadCount,
  useUpdateNotificationSettings,
} from '@/features/notif/hooks';
import { notificationService } from '@/services';
import type {
  NotificationSettingsDTO,
  NotificationsPage,
  RegisterDeviceTokenRequest,
  UnreadCountResponse,
} from '@/types/notification';
import type { ApiErrorDTO } from '@/types';
import type { MessageResponse } from '@/types/user';

jest.mock('@/services', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    markAllAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
    getNotificationSettings: jest.fn(),
    updateNotificationSettings: jest.fn(),
    registerDeviceToken: jest.fn(),
  },
}));

jest.mock('@/hooks/useAPI', () => ({
  normalizeApiError: jest.fn(),
}));

const mockNotificationService = notificationService as jest.Mocked<
  typeof notificationService
>;
const mockNormalizeApiError = normalizeApiError as jest.MockedFunction<
  typeof normalizeApiError
>;

const sampleNotificationsPage: NotificationsPage = {
  content: [
    {
      id: 1,
      type: 'LIKE',
      user: {
        id: 99,
        username: 'sara',
        displayName: 'Sara',
        avatarUrl: 'https://cdn.example.com/avatar.jpg',
        isFollowing: false,
        followerCount: 10,
        trackCount: 3,
      },
      resource: {
        resourceType: 'TRACK',
        resourceId: 88,
      },
      isRead: false,
      createdAt: '2026-04-22T10:30:00.000Z',
    },
  ],
  pageNumber: 0,
  pageSize: 20,
  totalElements: 1,
  totalPages: 1,
  isLast: true,
};

const sampleUnreadCount: UnreadCountResponse = {
  unreadCount: 7,
};

const sampleSettings: NotificationSettingsDTO = {
  notifyOnFollow: true,
  notifyOnLike: true,
  notifyOnRepost: false,
  notifyOnComment: true,
  notifyOnDM: false,
};

const sampleMessage: MessageResponse = {
  message: 'ok',
};

const sampleDeviceTokenPayload: RegisterDeviceTokenRequest = {
  token: 'device-token-123',
  deviceType: 'MOBILE',
};

const normalizedError: ApiErrorDTO = {
  statusCode: 500,
  message: 'Server down',
  error: 'INTERNAL_SERVER_ERROR',
};

describe('notification hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNormalizeApiError.mockReturnValue(normalizedError);
  });

  describe('useNotifications', () => {
    it('loads notifications on mount with provided pagination params', async () => {
      mockNotificationService.getNotifications.mockResolvedValue(
        sampleNotificationsPage
      );

      const { result } = renderHook(() =>
        useNotifications({ page: 1, size: 10 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockNotificationService.getNotifications).toHaveBeenCalledWith({
        page: 1,
        size: 10,
      });
      expect(result.current.notifications).toEqual(sampleNotificationsPage);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('supports manual refetch with override params', async () => {
      const secondPage: NotificationsPage = {
        ...sampleNotificationsPage,
        pageNumber: 2,
      };
      mockNotificationService.getNotifications
        .mockResolvedValueOnce(sampleNotificationsPage)
        .mockResolvedValueOnce(secondPage);

      const { result } = renderHook(() =>
        useNotifications({ page: 0, size: 20 })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.getNotifications({ page: 2, size: 5 });
      });

      expect(mockNotificationService.getNotifications).toHaveBeenLastCalledWith(
        {
          page: 2,
          size: 5,
        }
      );
      expect(result.current.notifications?.pageNumber).toBe(2);
    });

    it('normalizes errors for manual notification fetch failures', async () => {
      mockNotificationService.getNotifications.mockResolvedValue(
        sampleNotificationsPage
      );

      const { result } = renderHook(() => useNotifications());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      mockNotificationService.getNotifications.mockRejectedValueOnce(
        new Error('boom')
      );

      await act(async () => {
        await expect(
          result.current.getNotifications({ page: 0, size: 1 })
        ).rejects.toEqual(normalizedError);
      });

      expect(mockNormalizeApiError).toHaveBeenCalled();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(normalizedError);
    });
  });

  describe('useUnreadCount', () => {
    it('loads unread count on mount', async () => {
      mockNotificationService.getUnreadCount.mockResolvedValue(
        sampleUnreadCount
      );

      const { result } = renderHook(() => useUnreadCount());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockNotificationService.getUnreadCount).toHaveBeenCalled();
      expect(result.current.unreadCount).toBe(7);
      expect(result.current.unreadCountResponse).toEqual(sampleUnreadCount);
    });

    it('normalizes errors for manual unread count fetch failures', async () => {
      mockNotificationService.getUnreadCount.mockResolvedValue(
        sampleUnreadCount
      );

      const { result } = renderHook(() => useUnreadCount());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      mockNotificationService.getUnreadCount.mockRejectedValueOnce(
        new Error('boom')
      );

      await act(async () => {
        await expect(result.current.getUnreadCount()).rejects.toEqual(
          normalizedError
        );
      });

      expect(mockNormalizeApiError).toHaveBeenCalled();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(normalizedError);
    });
  });

  describe('useNotificationSettings', () => {
    it('loads notification settings on mount', async () => {
      mockNotificationService.getNotificationSettings.mockResolvedValue(
        sampleSettings
      );

      const { result } = renderHook(() => useNotificationSettings());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(
        mockNotificationService.getNotificationSettings
      ).toHaveBeenCalled();
      expect(result.current.settings).toEqual(sampleSettings);
      expect(result.current.isError).toBe(false);
    });

    it('normalizes errors for manual settings fetch failures', async () => {
      mockNotificationService.getNotificationSettings.mockResolvedValue(
        sampleSettings
      );

      const { result } = renderHook(() => useNotificationSettings());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      mockNotificationService.getNotificationSettings.mockRejectedValueOnce(
        new Error('boom')
      );

      await act(async () => {
        await expect(result.current.getNotificationSettings()).rejects.toEqual(
          normalizedError
        );
      });

      expect(mockNormalizeApiError).toHaveBeenCalled();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(normalizedError);
    });
  });

  describe('useMarkAllAsRead', () => {
    it('marks all notifications as read', async () => {
      mockNotificationService.markAllAsRead.mockResolvedValue(sampleMessage);

      const { result } = renderHook(() => useMarkAllAsRead());

      await act(async () => {
        const response = await result.current.markAllAsRead();
        expect(response).toEqual(sampleMessage);
      });

      expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
      expect(result.current.markAllAsReadResponse).toEqual(sampleMessage);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('normalizes mark-all errors', async () => {
      mockNotificationService.markAllAsRead.mockRejectedValue(
        new Error('boom')
      );

      const { result } = renderHook(() => useMarkAllAsRead());

      await act(async () => {
        await expect(result.current.markAllAsRead()).rejects.toEqual(
          normalizedError
        );
      });

      expect(mockNormalizeApiError).toHaveBeenCalled();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(normalizedError);
    });
  });

  describe('useUpdateNotificationSettings', () => {
    it('updates notification settings', async () => {
      const updatedSettings: NotificationSettingsDTO = {
        ...sampleSettings,
        notifyOnDM: true,
      };
      mockNotificationService.updateNotificationSettings.mockResolvedValue(
        updatedSettings
      );

      const { result } = renderHook(() => useUpdateNotificationSettings());

      await act(async () => {
        const response =
          await result.current.updateNotificationSettings(updatedSettings);
        expect(response).toEqual(updatedSettings);
      });

      expect(
        mockNotificationService.updateNotificationSettings
      ).toHaveBeenCalledWith(updatedSettings);
      expect(result.current.updatedSettings).toEqual(updatedSettings);
      expect(result.current.isError).toBe(false);
    });

    it('normalizes update settings errors', async () => {
      mockNotificationService.updateNotificationSettings.mockRejectedValue(
        new Error('boom')
      );

      const { result } = renderHook(() => useUpdateNotificationSettings());

      await act(async () => {
        await expect(
          result.current.updateNotificationSettings(sampleSettings)
        ).rejects.toEqual(normalizedError);
      });

      expect(mockNormalizeApiError).toHaveBeenCalled();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(normalizedError);
    });
  });

  describe('useRegisterDeviceToken', () => {
    it('registers device token', async () => {
      mockNotificationService.registerDeviceToken.mockResolvedValue(
        sampleMessage
      );

      const { result } = renderHook(() => useRegisterDeviceToken());

      await act(async () => {
        const response = await result.current.registerDeviceToken(
          sampleDeviceTokenPayload
        );
        expect(response).toEqual(sampleMessage);
      });

      expect(mockNotificationService.registerDeviceToken).toHaveBeenCalledWith(
        sampleDeviceTokenPayload
      );
      expect(result.current.registerDeviceTokenResponse).toEqual(sampleMessage);
      expect(result.current.isError).toBe(false);
    });

    it('normalizes register device token errors', async () => {
      mockNotificationService.registerDeviceToken.mockRejectedValue(
        new Error('boom')
      );

      const { result } = renderHook(() => useRegisterDeviceToken());

      await act(async () => {
        await expect(
          result.current.registerDeviceToken(sampleDeviceTokenPayload)
        ).rejects.toEqual(normalizedError);
      });

      expect(mockNormalizeApiError).toHaveBeenCalled();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(normalizedError);
    });
  });
});
