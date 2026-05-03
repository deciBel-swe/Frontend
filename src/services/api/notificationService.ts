import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { apiRequest, normalizeApiError } from '@/hooks/useAPI';
import {
  ensureRealtimeSession,
  getCurrentRealtimeUserId,
  syncRealtimeNotificationSettings,
} from '@/services/firebase/realtimeSocial';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  NotificationDTO,
  NotificationSettingsDTO,
  UnreadCountResponse,
  RegisterDeviceTokenRequest,
} from '@/types/notification';
import type { MessageResponse } from '@/types/user';

type FirestoreRecord = Record<string, unknown>;

export interface PaginationParams {
  page?: number;
  size?: number;
}

/**
 * NotificationService Interface
 *
 * Manages notification functionality with hybrid Firebase + REST API approach:
 * - Real-time notifications from Firestore
 * - Notification settings via REST API
 * - Proper respect for user notification preferences
 */
export interface NotificationService {
  /**
   * Register a device token for push notifications
   *
   * @param payload - The device token payload
   */
  registerDeviceToken(
    payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse>;

  /**
   * Unregister a previously registered device token
   * @param token - Device token string to remove
   */
  unregisterDeviceToken(token: string): Promise<MessageResponse>;

  /**
   * Subscribe to real-time notifications
   *
   * Establishes a persistent listener to the user's notifications.
   * Emits the full notification list whenever any notification changes.
   * Notifications are automatically sorted by creation time (newest first).
   * Respects user notification preferences.
   *
   * @param userId - Numeric user ID to filter notifications
   * @param onUpdate - Callback when notification list changes
   * @param onError - Callback if connection fails
   * @returns Unsubscribe function to stop listening
   */
  subscribeToNotifications(
    userId: number,
    onUpdate: (notifications: NotificationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;

  /**
   * Fetch paginated notifications from Firestore
   *
   * Retrieves notifications for the current user with pagination support.
   * Useful when you need a specific page or want to load paginated data.
   * Sorts by creation time (newest first).
   *
   * Default pagination: page 0, size 50
   *
   * @param params - Optional pagination parameters (page, size)
   * @returns Promise resolving to paginated notification list
   * @throws {Error} If Firestore operation fails or not authenticated
   */
  getNotifications(params?: PaginationParams): Promise<NotificationDTO[]>;

  /**
   * Get unread notification count
   *
   * Quick query to get just the count of unread notifications.
   * Useful for UI badges.
   *
   * @returns Promise resolving to { unreadCount: number }
   * @throws {Error} If Firestore operation fails or not authenticated
   */
  getUnreadCount(): Promise<UnreadCountResponse>;

  /**
   * Mark all notifications as read
   *
   * Atomically sets isRead=true on all unread notifications for the user.
   *
   * @param userId - User marking notifications as read
   * @throws {Error} If Firestore operation fails
   */
  markAllAsRead(userId: number): Promise<void>;

  /**
   * Get user's notification preferences
   *
   * Fetches the user's notification settings from the backend.
   * Also syncs settings to Firestore for offline access.
   *
   * Settings include flags for:
   * - notifyOnFollow
   * - notifyOnLike
   * - notifyOnRepost
   * - notifyOnComment
   * - notifyOnDM
   *
   * @returns Promise resolving to notification settings
   * @throws {Error} If API request fails
   */
  getNotificationSettings(): Promise<NotificationSettingsDTO>;

  /**
   * Update user's notification preferences
   *
   * Updates settings on backend and syncs to Firestore.
   *
   * @param payload - Updated settings
   * @returns Promise resolving to updated settings
   * @throws {Error} If API request fails
   */
  updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO>;
}

const DEFAULT_PAGINATION: Required<PaginationParams> = {
  page: 0,
  size: 50,
};

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
    return new Date(
      (value as { seconds: number }).seconds * 1000
    ).toISOString();
  }

  return new Date().toISOString();
};

const normalizeNotificationType = (value: unknown): NotificationDTO['type'] => {
  const normalized = String(value ?? 'FOLLOW')
    .trim()
    .toUpperCase();

  if (normalized.includes('FOLLOW')) {
    return 'FOLLOW';
  }

  if (normalized.includes('REPOST')) {
    return 'REPOST';
  }

  if (normalized.includes('REPLY')) {
    return 'REPLY';
  }

  if (normalized.includes('COMMENT')) {
    return 'COMMENT';
  }

  if (normalized.includes('DM') || normalized.includes('MESSAGE')) {
    return 'DM';
  }

  return 'LIKE';
};

const normalizeNotification = (id: string, value: unknown): NotificationDTO => {
  const data = (value as FirestoreRecord | undefined) ?? {};
  const user = (data.user as FirestoreRecord | undefined) ?? {};
  const resource = (data.resource as FirestoreRecord | undefined) ?? {};

  return {
    id,
    type: normalizeNotificationType(data.type),
    user: {
      id:
        typeof user.id === 'number'
          ? user.id
          : Number.parseInt(String(user.id ?? 0), 10) || 0,
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
      resourceType: String(
        resource.resourceType ?? 'USER'
      ) as NotificationDTO['resource']['resourceType'],
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

const sortNotifications = (
  notifications: NotificationDTO[]
): NotificationDTO[] =>
  [...notifications].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  );

const paginateNotifications = (
  notifications: NotificationDTO[],
  params: PaginationParams
): NotificationDTO[] => {
  const page = Math.max(0, params.page ?? DEFAULT_PAGINATION.page);
  const size = Math.max(1, params.size ?? DEFAULT_PAGINATION.size);
  const start = page * size;
  return notifications.slice(start, start + size);
};

/**
 * Firebase-backed implementation of NotificationService
 *
 * Hybrid architecture:
 * - Real-time notifications from Firestore collection `/notifications`
 * - Settings and device tokens managed via REST API
 *
 * Firestore structure:
 * - `/notifications` - Collection of all notifications, filtered by recipientId
 * - `/notificationSettings/{userId}` - Per-user notification preferences
 *
 * Real-time listeners automatically respect notification settings via
 * createRealtimeNotification() which checks settings before creating.
 */
export class FirebaseNotificationService implements NotificationService {
  /**
   * Real-time notifications subscription
   *
   * Filters notifications where the user is the recipient and sorts by recency.
   * Handles setup lifecycle: ensures Firebase session, handles cancellation,
   * and properly cleans up listeners on unsubscribe.
   */
  subscribeToNotifications(
    userId: number,
    onUpdate: (notifications: NotificationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const recipientId = String(userId);
    let unsubscribeSnapshot: Unsubscribe | null = null;
    let isCancelled = false;

    void ensureRealtimeSession()
      .then(() => {
        if (isCancelled) {
          return;
        }

        const q = query(
          collection(db, 'notifications'),
          where('recipientId', '==', recipientId)
        );

        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            try {
              const notifications = sortNotifications(
                snapshot.docs.map((docSnapshot) =>
                  normalizeNotification(docSnapshot.id, docSnapshot.data())
                )
              );
              onUpdate(notifications);
            } catch (error) {
              onError(
                error instanceof Error
                  ? error
                  : new Error('Failed to process notifications snapshot')
              );
            }
          },
          onError
        );
      })
      .catch((error) => {
        onError(
          error instanceof Error
            ? error
            : new Error('Failed to connect to realtime notifications.')
        );
      });

    return () => {
      isCancelled = true;
      unsubscribeSnapshot?.();
    };
  }

  /**
   * Fetch paginated notifications from Firestore
   *
   * Queries all notifications for the current user from Firestore storage.
   * Paginates in-memory after fetching to support any page size.
   *
   * @param params - Pagination parameters (defaults to page 0, size 50)
   * @returns Promise resolving to paginated notification list
   * @throws {Error} If Firestore operation fails or user not authenticated
   */
  async getNotifications(
    params: PaginationParams = DEFAULT_PAGINATION
  ): Promise<NotificationDTO[]> {
    try {
      await ensureRealtimeSession();

      const currentUserId = getCurrentRealtimeUserId();
      if (!currentUserId) {
        return [];
      }

      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', String(currentUserId))
      );
      const snapshot = await getDocs(q);

      const notifications = sortNotifications(
        snapshot.docs.map((docSnapshot) =>
          normalizeNotification(docSnapshot.id, docSnapshot.data())
        )
      );

      return paginateNotifications(notifications, params);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get unread notification count
   *
   * Queries Firestore for count of unread notifications for the current user.
   * More efficient than fetching all notifications just to count unread.
   *
   * @returns Promise resolving to { unreadCount: number }
   * @throws {Error} If Firestore operation fails or user not authenticated
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      await ensureRealtimeSession();

      const currentUserId = getCurrentRealtimeUserId();
      if (!currentUserId) {
        return { unreadCount: 0 };
      }

      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', String(currentUserId)),
        where('isRead', '==', false)
      );
      const snapshot = await getDocs(q);

      return { unreadCount: snapshot.size };
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to get unread count');
    }
  }

  /**
   * Mark all notifications as read
   *
   * Batch updates all unread notifications for the user to set isRead=true.
   * Uses write batch for atomic operation.
   *
   * @param userId - User marking notifications as read
   * @throws {Error} If Firestore operation fails
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      await ensureRealtimeSession();

      const recipientId = String(userId);
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', recipientId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((docSnapshot) => {
        batch.update(docSnapshot.ref, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to mark notifications as read');
    }
  }

  /**
   * Fetch notification preferences from backend
   *
   * Retrieves user's notification settings from the REST API and syncs
   * to Firestore for offline access and use by notification creation logic.
   *
   * Settings are checked by createRealtimeNotification() before creating
   * notification documents, so users won't receive notifications they've disabled.
   *
   * @returns Promise resolving to user's notification settings
   * @throws {Error} If API request fails
   */
  async getNotificationSettings(): Promise<NotificationSettingsDTO> {
    try {
      const response = await apiRequest(
        API_CONTRACTS.NOTIFICATIONS_GET_SETTINGS
      );
      const currentUserId = getCurrentRealtimeUserId();

      if (currentUserId) {
        await syncRealtimeNotificationSettings(currentUserId, response);
      }

      return response;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  /**
   * Update notification preferences
   *
   * Updates settings on the backend API and syncs to Firestore.
   * After update, createRealtimeNotification() will respect the new settings.
   *
   * @param payload - New notification settings
   * @returns Promise resolving to updated settings
   * @throws {Error} If API request fails
   */
  async updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO> {
    try {
      const response = await apiRequest(
        API_CONTRACTS.NOTIFICATIONS_UPDATE_SETTINGS,
        {
          payload,
        }
      );
      const currentUserId = getCurrentRealtimeUserId();

      if (currentUserId) {
        await syncRealtimeNotificationSettings(currentUserId, response);
      }

      return response;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  /**
   * Register device token for push notifications
   *
   * Sends a device token (typically Firebase Cloud Messaging token) to the backend
   * so the server can send push notifications to this device.
   *
   * Should be called once per device after user logs in.
   *
   * @param payload - Device token and device type (DESKTOP, MOBILE, etc.)
   * @returns Promise resolving to success response
   * @throws {Error} If API request fails
   */
  async registerDeviceToken(
    payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.DEVICE_TOKEN_REGISTER, { payload });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async unregisterDeviceToken(token: string): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.DEVICE_TOKEN_UNREGISTER, {
        params: { token },
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

export const notificationService = new FirebaseNotificationService();
