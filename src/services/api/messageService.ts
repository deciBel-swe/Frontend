import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';
import type { UserMe, UserPublic } from '@/types/user';

export interface MessageService {
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: ConversationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;

  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;

  sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    currentUserSummary: UserSummaryDTO
  ): Promise<void>;

  getOrCreateConversation(
    currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string>;

  markConversationRead(conversationId: string, userId: number): Promise<void>;
  markConversationUnread(
    conversationId: string,
    userId: number
  ): Promise<void>;
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

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const normalizeUnreadCounts = (
  value: unknown
): Record<string, number> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as FirestoreRecord).reduce<Record<string, number>>(
    (result, [key, entry]) => {
      const normalized = toNumber(entry);
      result[key] = normalized >= 0 ? normalized : 0;
      return result;
    },
    {}
  );
};

const normalizeBooleanRecord = (
  value: unknown
): Record<string, boolean> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as FirestoreRecord).reduce<Record<string, boolean>>(
    (result, [key, entry]) => {
      result[key] = Boolean(entry);
      return result;
    },
    {}
  );
};

const normalizeConversation = (
  id: string,
  value: unknown
): ConversationDTO => {
  const data = (value as FirestoreRecord | undefined) ?? {};
  const lastMessageRaw =
    data.lastMessage && typeof data.lastMessage === 'object'
      ? (data.lastMessage as FirestoreRecord)
      : null;

  return {
    id,
    participantIds: Array.isArray(data.participantIds)
      ? data.participantIds.map((entry) => String(entry))
      : [],
    participants: Array.isArray(data.participants)
      ? data.participants.map((entry) => {
          const participant = entry as FirestoreRecord;
          return {
            id: String(participant.id ?? ''),
            username: String(participant.username ?? ''),
            displayName:
              participant.displayName === null ||
              participant.displayName === undefined
                ? null
                : String(participant.displayName),
            avatarUrl:
              participant.avatarUrl === null || participant.avatarUrl === undefined
                ? null
                : String(participant.avatarUrl),
          };
        })
      : [],
    lastMessage: lastMessageRaw
      ? {
          content: String(lastMessageRaw.content ?? ''),
          senderId: String(lastMessageRaw.senderId ?? ''),
          createdAt: toIsoString(lastMessageRaw.createdAt),
        }
      : null,
    unreadCounts: normalizeUnreadCounts(data.unreadCounts),
    manuallyUnreadBy: normalizeBooleanRecord(data.manuallyUnreadBy),
    createdAt: data.createdAt ? toIsoString(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
  };
};

const normalizeMessage = (
  conversationId: string,
  id: string,
  value: unknown
): MessageDTO => {
  const data = (value as FirestoreRecord | undefined) ?? {};
  const sender = (data.sender as FirestoreRecord | undefined) ?? {};
  const resources = Array.isArray(data.resources) ? data.resources : [];

  return {
    messageId: id,
    conversationId,
    sender: {
      id: toNumber(sender.id),
      username: String(sender.username ?? ''),
      displayName:
        sender.displayName === null || sender.displayName === undefined
          ? null
          : String(sender.displayName),
      avatarUrl:
        sender.avatarUrl === null || sender.avatarUrl === undefined
          ? null
          : String(sender.avatarUrl),
      isFollowing: sender.isFollowing === undefined ? undefined : Boolean(sender.isFollowing),
      followerCount:
        sender.followerCount === undefined ? undefined : toNumber(sender.followerCount),
      trackCount:
        sender.trackCount === undefined ? undefined : toNumber(sender.trackCount),
    },
    content: String(data.content ?? ''),
    resources: resources as MessageDTO['resources'],
    isRead: Boolean(data.isRead),
    createdAt: toIsoString(data.createdAt),
  };
};

export class FirebaseMessageService implements MessageService {
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: ConversationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const userIdStr = String(userId);

    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userIdStr),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const conversations = snapshot.docs.map((docSnapshot) =>
          normalizeConversation(docSnapshot.id, docSnapshot.data())
        );
        onUpdate(conversations);
      },
      onError
    );
  }

  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((docSnapshot) =>
          normalizeMessage(conversationId, docSnapshot.id, docSnapshot.data())
        );
        onUpdate(messages);
      },
      onError
    );
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    currentUserSummary: UserSummaryDTO
  ): Promise<void> {
    const messageData = {
      conversationId,
      sender: {
        id: currentUserSummary.id,
        username: currentUserSummary.username,
        displayName: currentUserSummary.displayName || currentUserSummary.username,
        avatarUrl: currentUserSummary.avatarUrl || null,
      },
      content: payload.body,
      resources: payload.resources || [],
      isRead: false,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    };

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnapshot = await getDoc(conversationRef);
    const conversation = conversationSnapshot.exists()
      ? normalizeConversation(conversationId, conversationSnapshot.data())
      : null;

    const senderId = String(currentUserSummary.id);
    const participantIds = conversation?.participantIds ?? [senderId];
    const unreadCounts = { ...(conversation?.unreadCounts ?? {}) };
    const manuallyUnreadBy = { ...(conversation?.manuallyUnreadBy ?? {}) };

    participantIds.forEach((participantId) => {
      if (participantId === senderId) {
        unreadCounts[participantId] = 0;
        manuallyUnreadBy[participantId] = false;
        return;
      }

      unreadCounts[participantId] = (unreadCounts[participantId] ?? 0) + 1;
      manuallyUnreadBy[participantId] = false;
    });

    await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      messageData
    );

    await setDoc(
      conversationRef,
      {
        lastMessage: {
          content: payload.body,
          senderId,
          createdAt: new Date().toISOString(),
        },
        unreadCounts,
        manuallyUnreadBy,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async getOrCreateConversation(
    currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string> {
    const myId = String(currentUser.id);
    const theirId = String('profile' in otherUser ? otherUser.profile.id : otherUser.id);

    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', myId)
    );

    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find((docSnapshot) => {
      const ids = normalizeConversation(docSnapshot.id, docSnapshot.data()).participantIds;
      return ids.length === 2 && ids.includes(theirId);
    });

    if (existing) {
      return existing.id;
    }

    const otherUserData = 'profile' in otherUser ? {
      id: String(otherUser.profile.id),
      username: otherUser.profile.username,
      displayName: otherUser.profile.displayName || otherUser.profile.username,
      avatarUrl: otherUser.profile.profilePic || null,
    } : {
      id: String(otherUser.id),
      username: otherUser.username,
      displayName: otherUser.displayName || otherUser.username,
      avatarUrl: otherUser.avatarUrl || null,
    };

    const meData = {
      id: String(currentUser.id),
      username: currentUser.username,
      displayName: currentUser.displayName || currentUser.username,
      avatarUrl: currentUser.profile?.profilePic || null,
    };

    const newConv = {
      participantIds: [myId, theirId],
      participants: [meData, otherUserData],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      unreadCounts: {
        [myId]: 0,
        [theirId]: 0,
      },
      manuallyUnreadBy: {
        [myId]: false,
        [theirId]: false,
      },
    };

    const docRef = await addDoc(collection(db, 'conversations'), newConv);
    return docRef.id;
  }

  async markConversationRead(
    conversationId: string,
    userId: number
  ): Promise<void> {
    const userIdStr = String(userId);
    const conversationRef = doc(db, 'conversations', conversationId);
    const snapshot = await getDoc(conversationRef);

    if (!snapshot.exists()) {
      return;
    }

    const conversation = normalizeConversation(conversationId, snapshot.data());

    await setDoc(
      conversationRef,
      {
        unreadCounts: {
          ...conversation.unreadCounts,
          [userIdStr]: 0,
        },
        manuallyUnreadBy: {
          ...conversation.manuallyUnreadBy,
          [userIdStr]: false,
        },
      },
      { merge: true }
    );

    const messagesSnapshot = await getDocs(
      collection(db, 'conversations', conversationId, 'messages')
    );
    const batch = writeBatch(db);

    messagesSnapshot.docs.forEach((messageDoc) => {
      const senderId = String(
        ((messageDoc.data() as FirestoreRecord).sender as FirestoreRecord | undefined)
          ?.id ?? ''
      );

      if (senderId !== userIdStr && messageDoc.data().isRead !== true) {
        batch.update(messageDoc.ref, { isRead: true });
      }
    });

    await batch.commit();
  }

  async markConversationUnread(
    conversationId: string,
    userId: number
  ): Promise<void> {
    const userIdStr = String(userId);
    const conversationRef = doc(db, 'conversations', conversationId);
    const snapshot = await getDoc(conversationRef);

    if (!snapshot.exists()) {
      return;
    }

    const conversation = normalizeConversation(conversationId, snapshot.data());

    await setDoc(
      conversationRef,
      {
        unreadCounts: {
          ...conversation.unreadCounts,
          [userIdStr]: conversation.unreadCounts[userIdStr] ?? 0,
        },
        manuallyUnreadBy: {
          ...conversation.manuallyUnreadBy,
          [userIdStr]: true,
        },
      },
      { merge: true }
    );
  }
}

export const messageService = new FirebaseMessageService();
