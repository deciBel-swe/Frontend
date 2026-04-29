import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

import type { LoginUserDTO } from '@/types';
import type {
  NotificationDTO,
  NotificationSettingsDTO,
} from '@/types/notification';
import { auth, db } from '@/lib/firebase';

const AUTH_USER_STORAGE_KEY = 'user';
const NOTIFICATIONS_COLLECTION = 'notifications';
const NOTIFICATION_SETTINGS_COLLECTION = 'notificationSettings';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsDTO = {
  notifyOnFollow: true,
  notifyOnLike: true,
  notifyOnRepost: true,
  notifyOnComment: true,
  notifyOnDM: true,
};

type RealtimeActor = NotificationDTO['user'];

type RealtimeNotificationInput = {
  type: NotificationDTO['type'];
  recipientId: number;
  resource: NotificationDTO['resource'];
  targetTitle?: string;
  targetUrl?: string;
  conversationId?: string;
  actor?: RealtimeActor | null;
};

let pendingRealtimeSession: Promise<void> | null = null;

const normalizeBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const normalizeNotificationSettings = (
  value: unknown
): NotificationSettingsDTO => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  const data = value as Record<string, unknown>;

  return {
    notifyOnFollow: normalizeBoolean(
      data.notifyOnFollow,
      DEFAULT_NOTIFICATION_SETTINGS.notifyOnFollow
    ),
    notifyOnLike: normalizeBoolean(
      data.notifyOnLike,
      DEFAULT_NOTIFICATION_SETTINGS.notifyOnLike
    ),
    notifyOnRepost: normalizeBoolean(
      data.notifyOnRepost,
      DEFAULT_NOTIFICATION_SETTINGS.notifyOnRepost
    ),
    notifyOnComment: normalizeBoolean(
      data.notifyOnComment,
      DEFAULT_NOTIFICATION_SETTINGS.notifyOnComment
    ),
    notifyOnDM: normalizeBoolean(
      data.notifyOnDM,
      DEFAULT_NOTIFICATION_SETTINGS.notifyOnDM
    ),
  };
};

const getStoredLoginUser = (): LoginUserDTO | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser) as LoginUserDTO;
  } catch {
    return null;
  }
};

const isNotificationEnabled = (
  settings: NotificationSettingsDTO,
  type: NotificationDTO['type']
): boolean => {
  switch (type) {
    case 'FOLLOW':
      return settings.notifyOnFollow;
    case 'LIKE':
      return settings.notifyOnLike;
    case 'REPOST':
      return settings.notifyOnRepost;
    case 'COMMENT':
    case 'REPLY':
      return settings.notifyOnComment;
    case 'DM':
      return settings.notifyOnDM;
    default:
      return true;
  }
};

const getSettingsRef = (userId: number) =>
  doc(db, NOTIFICATION_SETTINGS_COLLECTION, String(userId));

const getRecipientSettings = async (
  userId: number
): Promise<NotificationSettingsDTO> => {
  try {
    const snapshot = await getDoc(getSettingsRef(userId));
    if (!snapshot.exists()) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }

    return normalizeNotificationSettings(snapshot.data());
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

export const getCurrentRealtimeActor = (): RealtimeActor | null => {
  const storedUser = getStoredLoginUser();
  if (!storedUser) {
    return null;
  }

  return {
    id: storedUser.id,
    username: storedUser.username,
    displayName: storedUser.displayName || storedUser.username,
    avatarUrl: storedUser.avatarUrl || null,
    isFollowing: false,
    followerCount: 0,
    trackCount: 0,
  };
};

export const getCurrentRealtimeUserId = (): number | null =>
  getStoredLoginUser()?.id ?? null;

export const ensureRealtimeSession = async (): Promise<void> => {
  if (!auth || auth.currentUser) {
    return;
  }

  if (!pendingRealtimeSession) {
    pendingRealtimeSession = signInAnonymously(auth)
      .then(() => undefined)
      .finally(() => {
        pendingRealtimeSession = null;
      });
  }

  await pendingRealtimeSession;
};

export const syncRealtimeNotificationSettings = async (
  userId: number,
  settings: NotificationSettingsDTO
): Promise<void> => {
  await ensureRealtimeSession();
  await setDoc(getSettingsRef(userId), settings, { merge: true });
};

export const createRealtimeNotification = async ({
  type,
  recipientId,
  resource,
  targetTitle,
  targetUrl,
  conversationId,
  actor = getCurrentRealtimeActor(),
}: RealtimeNotificationInput): Promise<void> => {
  if (!actor || !Number.isFinite(recipientId) || recipientId <= 0) {
    return;
  }

  await ensureRealtimeSession();

  if (actor.id === recipientId) {
    return;
  }

  const recipientSettings = await getRecipientSettings(recipientId);
  if (!isNotificationEnabled(recipientSettings, type)) {
    return;
  }

  const createdAt = new Date().toISOString();

  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    recipientId: String(recipientId),
    type,
    user: {
      id: actor.id,
      username: actor.username,
      displayName: actor.displayName || actor.username,
      avatarUrl: actor.avatarUrl || null,
      isFollowing: actor.isFollowing ?? false,
      followerCount: actor.followerCount ?? 0,
      trackCount: actor.trackCount ?? 0,
    },
    resource,
    isRead: false,
    createdAt,
    serverCreatedAt: serverTimestamp(),
    ...(targetTitle ? { targetTitle } : {}),
    ...(targetUrl ? { targetUrl } : {}),
    ...(conversationId ? { conversationId } : {}),
  });
};
