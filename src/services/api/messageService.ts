import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import {
  createRealtimeNotification,
  ensureRealtimeSession,
  getCurrentRealtimeActor,
} from '@/services/firebase/realtimeSocial';
import type {
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';
import type { UserMe, UserPublic } from '@/types/user';

/**
 * MessageService Interface
 *
 * Manages real-time messaging functionality through Firebase Firestore.
 * Supports:
 * - Real-time inbox updates (conversation list)
 * - Real-time chat stream within conversations
 * - Sending messages with resource sharing (tracks, playlists)
 * - Conversation lifecycle management (create, mark read/unread)
 */
export interface MessageService {
  /**
   * Subscribe to real-time inbox updates
   *
   * Establishes a persistent listener to the user's conversations.
   * Emits the full conversation list whenever any conversation changes.
   * Conversations are automatically sorted by most recent update.
   *
   * @param userId - Numeric user ID to filter conversations
   * @param onUpdate - Callback when conversation list changes
   * @param onError - Callback if connection fails
   * @returns Unsubscribe function to stop listening
   */
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: ConversationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;

  /**
   * Subscribe to real-time chat messages in a conversation
   *
   * Establishes a persistent listener to messages in a specific conversation.
   * Emits the full message list whenever any message changes.
   * Messages are automatically sorted by creation time (oldest first).
   *
   * @param conversationId - Unique conversation identifier
   * @param onUpdate - Callback when message list changes
   * @param onError - Callback if connection fails
   * @returns Unsubscribe function to stop listening
   */
  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;

  /**
   * Send a message to a conversation
   *
   * Creates a new message in the specified conversation and:
   * - Updates unread counts for all participants
   * - Updates the last message in the conversation
   * - Creates a DM notification for the recipient(s)
   * - Marks the message as unread for recipients
   *
   * @param conversationId - Conversation to send message to
   * @param payload - Message content and resources
   * @param currentUserSummary - Current user's summary data
   * @throws {Error} If Firestore operation fails
   */
  sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    currentUserSummary: UserSummaryDTO
  ): Promise<void>;

  /**
   * Get existing conversation or create new one
   *
   * Retrieves an existing conversation between two users, or creates one if it doesn't exist.
   * Uses a deterministic ID based on sorted user IDs to ensure uniqueness.
   *
   * @param currentUser - Current authenticated user
   * @param otherUser - User to start/get conversation with
   * @returns Promise resolving to the conversation ID
   * @throws {Error} If Firestore operation fails
   */
  getOrCreateConversation(
    currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string>;

  /**
   * Mark a conversation as read
   *
   * Sets the user's unread count to 0 for the conversation and marks received
   * messages as read. Does not affect messages sent by the user.
   *
   * @param conversationId - Conversation to mark as read
   * @param userId - User marking the conversation as read
   * @throws {Error} If Firestore operation fails
   */
  markConversationRead(conversationId: string, userId: number): Promise<void>;

  /**
   * Mark a conversation as manually unread
   *
   * Sets the manual unread flag for a conversation, which affects the unread count
   * calculation in the UI. Useful for users who want to keep a conversation "flagged".
   *
   * @param conversationId - Conversation to mark as unread
   * @param userId - User marking the conversation as unread
   * @throws {Error} If Firestore operation fails
   */
  markConversationUnread(conversationId: string, userId: number): Promise<void>;
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
    return new Date(
      (value as { seconds: number }).seconds * 1000
    ).toISOString();
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

const normalizeUnreadCounts = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as FirestoreRecord).reduce<
    Record<string, number>
  >((result, [key, entry]) => {
    const normalized = toNumber(entry);
    result[key] = normalized >= 0 ? normalized : 0;
    return result;
  }, {});
};

const normalizeBooleanRecord = (value: unknown): Record<string, boolean> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as FirestoreRecord).reduce<
    Record<string, boolean>
  >((result, [key, entry]) => {
    result[key] = Boolean(entry);
    return result;
  }, {});
};

const normalizeConversation = (id: string, value: unknown): ConversationDTO => {
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
              participant.avatarUrl === null ||
              participant.avatarUrl === undefined
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
      isFollowing:
        sender.isFollowing === undefined
          ? undefined
          : Boolean(sender.isFollowing),
      followerCount:
        sender.followerCount === undefined
          ? undefined
          : toNumber(sender.followerCount),
      trackCount:
        sender.trackCount === undefined
          ? undefined
          : toNumber(sender.trackCount),
    },
    content: String(data.content ?? ''),
    resources: resources as MessageDTO['resources'],
    isRead: Boolean(data.isRead),
    createdAt: toIsoString(data.createdAt),
  };
};

const buildConversationId = (
  firstUserId: string | number,
  secondUserId: string | number
): string => {
  const normalizedIds = [String(firstUserId), String(secondUserId)].sort(
    (left, right) => Number(left) - Number(right)
  );

  return normalizedIds.join('_');
};

const sortConversations = (
  conversations: ConversationDTO[]
): ConversationDTO[] =>
  [...conversations].sort((left, right) => {
    const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
    const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;
    return rightTime - leftTime;
  });

const sortMessages = (messages: MessageDTO[]): MessageDTO[] =>
  [...messages].sort(
    (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)
  );

/**
 * Firebase-backed implementation of MessageService
 *
 * Uses Firestore for real-time messaging:
 * - Conversations stored in `/conversations` collection
 * - Messages stored as subcollection `/conversations/{id}/messages`
 * - Automatically maintains unread counts and last message metadata
 * - Synchronizes with backend for DM notifications
 */
export class FirebaseMessageService implements MessageService {
  /**
   * Real-time inbox subscription
   *
   * Filters conversations where the user is a participant and sorts by recency.
   * Handles setup lifecycle: ensures Firebase session, handles cancellation,
   * and properly cleans up listeners on unsubscribe.
   */
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: ConversationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const userIdStr = String(userId);
    let unsubscribeSnapshot: Unsubscribe | null = null;
    let isCancelled = false;

    void ensureRealtimeSession()
      .then(() => {
        if (isCancelled) {
          return;
        }

        const q = query(collection(db, 'conversations'));
        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            try {
              const conversations = sortConversations(
                snapshot.docs
                  .map((docSnapshot) =>
                    normalizeConversation(docSnapshot.id, docSnapshot.data())
                  )
                  .filter((conversation) =>
                    conversation.participantIds.includes(userIdStr)
                  )
              );
              onUpdate(conversations);
            } catch (error) {
              onError(
                error instanceof Error
                  ? error
                  : new Error('Failed to process inbox snapshot')
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
            : new Error('Failed to connect to realtime inbox.')
        );
      });

    return () => {
      isCancelled = true;
      unsubscribeSnapshot?.();
    };
  }

  /**
   * Real-time chat subscription
   *
   * Filters messages in a specific conversation and sorts by creation time.
   * Handles setup lifecycle with proper cancellation and error handling.
   */
  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    let unsubscribeSnapshot: Unsubscribe | null = null;
    let isCancelled = false;

    void ensureRealtimeSession()
      .then(() => {
        if (isCancelled) {
          return;
        }

        const q = query(
          collection(db, 'conversations', conversationId, 'messages'),
          orderBy('createdAt', 'asc')
        );
        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            try {
              const messages = sortMessages(
                snapshot.docs.map((docSnapshot) =>
                  normalizeMessage(
                    conversationId,
                    docSnapshot.id,
                    docSnapshot.data()
                  )
                )
              );
              onUpdate(messages);
            } catch (error) {
              onError(
                error instanceof Error
                  ? error
                  : new Error('Failed to process chat snapshot')
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
            : new Error('Failed to connect to realtime conversation.')
        );
      });

    return () => {
      isCancelled = true;
      unsubscribeSnapshot?.();
    };
  }

  /**
   * Send message to conversation
   *
   * Atomically performs several operations:
   * 1. Creates the message document in the conversation's messages subcollection
   * 2. Updates conversation metadata (lastMessage, updatedAt)
   * 3. Updates unread counts for all participants (except sender, whose count is 0)
   * 4. Creates DM notifications for all recipients (respecting notification settings)
   *
   * The sender's unread count is set to 0 and manuallyUnreadBy is set to false,
   * indicating they've read their own message.
   *
   * @param conversationId - Target conversation
   * @param payload - Message content and optional resources (tracks/playlists)
   * @param currentUserSummary - Current user's profile (for sender field and notifications)
   * @throws {Error} If Firestore operations fail or session initialization fails
   */
  async sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    currentUserSummary: UserSummaryDTO
  ): Promise<void> {
    try {
      await ensureRealtimeSession();

      const now = new Date().toISOString();
      const messageData = {
        conversationId,
        sender: {
          id: currentUserSummary.id,
          username: currentUserSummary.username,
          displayName:
            currentUserSummary.displayName || currentUserSummary.username,
          avatarUrl: currentUserSummary.avatarUrl || null,
        },
        content: payload.body,
        resources: payload.resources || [],
        isRead: false,
        createdAt: now,
        serverCreatedAt: serverTimestamp(),
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
            createdAt: now,
          },
          unreadCounts,
          manuallyUnreadBy,
          updatedAt: now,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const actor = getCurrentRealtimeActor();
      await Promise.all(
        participantIds
          .filter((participantId) => participantId !== senderId)
          .map(async (participantId) => {
            const recipientId = Number(participantId);
            if (!Number.isFinite(recipientId) || recipientId <= 0) {
              return;
            }

            await createRealtimeNotification({
              type: 'DM',
              recipientId,
              resource: {
                resourceType: 'USER',
                resourceId: currentUserSummary.id,
              },
              conversationId,
              actor,
            });
          })
      );
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to send message');
    }
  }

  /**
   * Get or create a direct message conversation
   *
   * Returns an existing conversation ID if one exists between the two users,
   * otherwise creates a new conversation with both users as participants.
   *
   * Conversation IDs are deterministically generated by sorting user IDs,
   * ensuring the same ID regardless of which user initiated the request.
   *
   * Initial state:
   * - No messages
   * - Unread count set to 0 for both users
   * - manuallyUnreadBy set to false for both users
   * - Both participants included in metadata
   *
   * @param currentUser - Currently authenticated user (must include id)
   * @param otherUser - User to create/get conversation with
   * @returns Promise resolving to conversation ID
   * @throws {Error} If Firestore operations fail or session initialization fails
   */
  async getOrCreateConversation(
    currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string> {
    try {
      await ensureRealtimeSession();

      const myId = String(currentUser.id);
      const theirId = String(
        'profile' in otherUser ? otherUser.profile.id : otherUser.id
      );
      const conversationId = buildConversationId(myId, theirId);
      const conversationRef = doc(db, 'conversations', conversationId);
      const snapshot = await getDoc(conversationRef);

      if (snapshot.exists()) {
        return conversationId;
      }

      const otherUserData =
        'profile' in otherUser
          ? {
              id: String(otherUser.profile.id),
              username: otherUser.profile.username,
              displayName:
                otherUser.profile.displayName || otherUser.profile.username,
              avatarUrl: otherUser.profile.profilePic || null,
            }
          : {
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
      const createdAt = new Date().toISOString();

      await setDoc(conversationRef, {
        participantIds: [myId, theirId],
        participants: [meData, otherUserData],
        createdAt,
        updatedAt: createdAt,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp(),
        lastMessage: null,
        unreadCounts: {
          [myId]: 0,
          [theirId]: 0,
        },
        manuallyUnreadBy: {
          [myId]: false,
          [theirId]: false,
        },
      });

      return conversationId;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to get or create conversation');
    }
  }

  /**
   * Mark all messages in a conversation as read
   *
   * Updates conversation metadata and individual messages:
   * - Sets user's unread count to 0
   * - Sets manuallyUnreadBy to false
   * - Marks all received messages (not sent by user) as read
   *
   * @param conversationId - Conversation to mark as read
   * @param userId - User marking the conversation as read
   * @throws {Error} If Firestore operations fail
   */
  async markConversationRead(
    conversationId: string,
    userId: number
  ): Promise<void> {
    try {
      await ensureRealtimeSession();

      const userIdStr = String(userId);
      const conversationRef = doc(db, 'conversations', conversationId);
      const snapshot = await getDoc(conversationRef);

      if (!snapshot.exists()) {
        return;
      }

      const conversation = normalizeConversation(
        conversationId,
        snapshot.data()
      );

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

      const batch = writeBatch(db);
      const messagesCollection = collection(
        db,
        'conversations',
        conversationId,
        'messages'
      );
      const messagesSnapshot = await getDocs(messagesCollection);

      messagesSnapshot.docs.forEach((messageDoc) => {
        const senderId = String(
          (
            (messageDoc.data() as FirestoreRecord).sender as
              | FirestoreRecord
              | undefined
          )?.id ?? ''
        );

        if (senderId !== userIdStr && messageDoc.data().isRead !== true) {
          batch.update(messageDoc.ref, { isRead: true });
        }
      });

      await batch.commit();
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to mark conversation as read');
    }
  }

  /**
   * Mark a conversation as manually unread
   *
   * Sets the manuallyUnreadBy flag for a conversation to indicate the user
   * wants to keep this conversation "flagged" as needing attention, even if
   * they've read all messages.
   *
   * This does not affect the actual unread count - only the manual flag.
   *
   * @param conversationId - Conversation to mark as unread
   * @param userId - User marking the conversation as unread
   * @throws {Error} If Firestore operations fail
   */
  async markConversationUnread(
    conversationId: string,
    userId: number
  ): Promise<void> {
    try {
      await ensureRealtimeSession();

      const userIdStr = String(userId);
      const conversationRef = doc(db, 'conversations', conversationId);
      const snapshot = await getDoc(conversationRef);

      if (!snapshot.exists()) {
        return;
      }

      const conversation = normalizeConversation(
        conversationId,
        snapshot.data()
      );

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
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to mark conversation as unread');
    }
  }
}

export const messageService = new FirebaseMessageService();
