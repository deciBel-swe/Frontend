import type {
  NotificationDTO,
  NotificationSettingsDTO,
  RegisterDeviceTokenRequest,
} from '@/types/notification';
import type { MessageResponse } from '@/types/user';
import type { NotificationService } from '../api/notificationService';
import { MOCK_NOTIFICATIONS } from './mockData';

export class MockNotificationService implements NotificationService {
  private notifications: Record<number, NotificationDTO[]> = { ...MOCK_NOTIFICATIONS } as any;

  subscribeToNotifications(
    userId: number,
    onUpdate: (notifications: NotificationDTO[]) => void,
    _onError: (error: Error) => void
  ): () => void {
    const timeout = setTimeout(() => {
      onUpdate(this.notifications[userId] || []);
    }, 500);

    return () => clearTimeout(timeout);
  }

  async markAllAsRead(userId: number): Promise<void> {
    if (this.notifications[userId]) {
      this.notifications[userId] = this.notifications[userId].map(n => ({ ...n, isRead: true }));
    }
    return Promise.resolve();
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
    return payload;
  }

  async registerDeviceToken(
    _payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse> {
    return { message: 'Token registered successfully' };
  }
}
