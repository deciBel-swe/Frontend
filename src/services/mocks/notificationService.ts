import {
  NotificationService,
  PaginationParams,
} from '../api/notificationService';
import type { MessageResponse } from '@/types/user';

import type {
  NotificationsPage,
  UnreadCountResponse,
  NotificationSettingsDTO,
  RegisterDeviceTokenRequest,
} from '@/types/notification';

export class MockNotificationService implements NotificationService {
  async getNotifications(
    _params?: PaginationParams
  ): Promise<NotificationsPage> {
    return {
      content: [
        {
          id: 1,
          type: 'LIKE',
          user: {
            id: 12,
            username: 'sara',
            displayName: 'Sara',
            avatarUrl: 'https://cdn.example.com/avatars/sara.jpg',
            isFollowing: false,
            followerCount: 100,
            trackCount: 24,
          },
          resource: {
            resourceType: 'TRACK',
            resourceId: 99,
          },
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      isLast: true,
    };
  }

  async markAllAsRead(): Promise<MessageResponse> {
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return { unreadCount: 7 };
  }

  async getNotificationSettings(): Promise<NotificationSettingsDTO> {
    return {
      notifyOnFollow: true,
      notifyOnLike: true,
      notifyOnRepost: true,
      notifyOnComment: true,
      notifyOnDM: true,
    };
  }

  async updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO> {
    return payload; // Echo back the updated settings
  }

  async registerDeviceToken(
    _payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse> {
    return { message: 'Device registered successfully' };
  }
}
