import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  apiRequest,
  normalizeApiError,
} from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { MessageResponse } from '@/types/user';
import type {
  NotificationDTO,
  NotificationSettingsDTO,
  RegisterDeviceTokenRequest,
} from '@/types/notification';

export interface NotificationService {
  subscribeToNotifications(
    userId: number,
    onUpdate: (notifications: NotificationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;
  markAllAsRead(userId: number): Promise<void>;
  getNotificationSettings(): Promise<NotificationSettingsDTO>;
  updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO>;
  registerDeviceToken(
    payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse>;
}

export class FirebaseNotificationService implements NotificationService {
  subscribeToNotifications(
    userId: number,
    onUpdate: (notifications: NotificationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as unknown as NotificationDTO[];
        onUpdate(notifications);
      },
      onError
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  }

  async getNotificationSettings(): Promise<NotificationSettingsDTO> {
    try {
      return await apiRequest(API_CONTRACTS.NOTIFICATIONS_GET_SETTINGS);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO> {
    try {
      return await apiRequest(API_CONTRACTS.NOTIFICATIONS_UPDATE_SETTINGS, {
        payload,
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async registerDeviceToken(
    payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.DEVICE_TOKEN_REGISTER, { payload });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

export const notificationService = new FirebaseNotificationService();
