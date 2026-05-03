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

type FirestoreRecord = Record<string, unknown>;

const toIsoString = (value: unknown): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (
    value &&
    typeof value === 'object' &&
    'seconds' in value &&
    typeof (value as { seconds: number }).seconds === 'number'
  ) {
    return new Date((value as { seconds: number }).seconds * 1000).toISOString();
  }

  return new Date().toISOString();
};

const normalizeNotification = (
  id: string,
  value: unknown
): NotificationDTO => {
  const data = (value as FirestoreRecord | undefined) ?? {};
  const user = (data.user as FirestoreRecord | undefined) ?? {};
  const resource = (data.resource as FirestoreRecord | undefined) ?? {};

  return {
    id,
    type: String(data.type ?? 'FOLLOW') as NotificationDTO['type'],
    user: {
      id: Number(user.id ?? 0),
      username: String(user.username ?? ''),
      displayName: String(user.displayName ?? user.username ?? ''),
      avatarUrl:
        user.avatarUrl === null || user.avatarUrl === undefined
          ? null
          : String(user.avatarUrl),
      isFollowing:
        user.isFollowing === undefined ? undefined : Boolean(user.isFollowing),
      followerCount:
        user.followerCount === undefined
          ? undefined
          : Number(user.followerCount),
      trackCount:
        user.trackCount === undefined ? undefined : Number(user.trackCount),
    },
    resource: {
      resourceType: String(resource.resourceType ?? 'USER') as NotificationDTO['resource']['resourceType'],
      resourceId: Number(resource.resourceId ?? 0),
    },
    isRead: Boolean(data.isRead),
    createdAt: toIsoString(data.createdAt),
    targetTitle:
      typeof data.targetTitle === 'string' ? data.targetTitle : undefined,
    targetUrl: typeof data.targetUrl === 'string' ? data.targetUrl : undefined,
    conversationId:
      typeof data.conversationId === 'string' ? data.conversationId : undefined,
  };
};

export class FirebaseNotificationService implements NotificationService {
  subscribeToNotifications(
    userId: number,
    onUpdate: (notifications: NotificationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const recipientId = String(userId);
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((docSnapshot) =>
          normalizeNotification(docSnapshot.id, docSnapshot.data())
        );
        onUpdate(notifications);
      },
      onError
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    const recipientId = String(userId);
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId),
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
