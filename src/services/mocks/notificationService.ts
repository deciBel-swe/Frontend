import type {
  NotificationDTO,
  NotificationSettingsDTO,
} from '@/types/notification';
import type {
  NotificationService,
  PaginationParams,
} from '../api/notificationService';
import { MOCK_NOTIFICATIONS } from './mockData';

export class MockNotificationService implements NotificationService {
  private notifications: Record<string, NotificationDTO[]> = {
    ...MOCK_NOTIFICATIONS,
  };
  private settings: NotificationSettingsDTO = {
    notifyOnFollow: true,
    notifyOnLike: true,
    notifyOnRepost: true,
    notifyOnComment: true,
    notifyOnDM: true,
  };
  private listeners = new Map<
    string,
    {
      userId: string;
      onUpdate: (notifications: NotificationDTO[]) => void;
      timeoutId?: ReturnType<typeof setTimeout>;
      intervalId?: ReturnType<typeof setInterval>;
    }
  >();

  private emit(userId: string) {
    const notifications = [...(this.notifications[userId] || [])].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
    );

    this.listeners.forEach((listener) => {
      if (listener.userId !== userId) {
        return;
      }

      listener.onUpdate(notifications);
    });
  }

  subscribeToNotifications(
    userId: number,
    onUpdate: (notifications: NotificationDTO[]) => void,
    _onError: (error: Error) => void
  ): () => void {
    const userIdStr = String(userId);
    const listenerId = `notif_${Date.now()}_${Math.random()}`;
    const timeout = setTimeout(() => {
      this.emit(userIdStr);
    }, 500);

    const interval = setInterval(() => {
      const nextNotification: NotificationDTO = {
        id: `notif_live_${Date.now()}`,
        type: 'DM',
        user: {
          id: 2,
          username: 'jordan.smith',
          displayName: 'Jordan Smith',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=sara',
        },
        resource: {
          resourceType: 'USER',
          resourceId: 2,
        },
        isRead: false,
        createdAt: new Date().toISOString(),
        conversationId: 'conv_1',
      };

      this.notifications[userIdStr] = [
        nextNotification,
        ...(this.notifications[userIdStr] || []),
      ];
      this.emit(userIdStr);
    }, 60000);

    this.listeners.set(listenerId, {
      userId: userIdStr,
      onUpdate,
      timeoutId: timeout,
      intervalId: interval,
    });

    return () => {
      const listener = this.listeners.get(listenerId);
      if (listener?.timeoutId) {
        clearTimeout(listener.timeoutId);
      }
      if (listener?.intervalId) {
        clearInterval(listener.intervalId);
      }
      this.listeners.delete(listenerId);
    };
  }

  async markAllAsRead(userId: number): Promise<void> {
    const userIdStr = String(userId);
    if (this.notifications[userIdStr]) {
      this.notifications[userIdStr] = this.notifications[userIdStr].map((notification) => ({
        ...notification,
        isRead: true,
      }));
      this.emit(userIdStr);
    }
    return Promise.resolve();
  }

  async getNotifications(
    params?: PaginationParams
  ): Promise<NotificationDTO[]> {
    const size = params?.size ?? 50;
    const page = params?.page ?? 0;
    const allNotifications = Object.values(this.notifications)
      .flat()
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

    return allNotifications.slice(page * size, page * size + size);
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const unreadCount = Object.values(this.notifications)
      .flat()
      .filter((notification) => !notification.isRead).length;

    return { unreadCount };
  }

  async getNotificationSettings(): Promise<NotificationSettingsDTO> {
    return { ...this.settings };
  }

  async updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO> {
    this.settings = { ...payload };
    return { ...this.settings };
  }

  async registerDeviceToken(
    _payload: import('@/types/notification').RegisterDeviceTokenRequest
  ): Promise<import('@/types/user').MessageResponse> {
    return { message: 'Token registered' };
  }
}
