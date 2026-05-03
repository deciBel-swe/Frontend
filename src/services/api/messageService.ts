import { type Unsubscribe } from 'firebase/firestore';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { apiRequest } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
  PaginatedConversationsResponseDTO,
  PaginatedMessagesResponseDTO,
  ConversationResponseDTO,
  MessageObjectDTO,
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
  markConversationUnread(conversationId: string, userId: number): Promise<void>;
}

const mapConversation = (
  dto: ConversationResponseDTO,
  currentUserId: number
): ConversationDTO => ({
  id: String(dto.id),
  participantIds: [String(dto.user1.id), String(dto.user2.id)],
  participants: [
    { id: String(dto.user1.id), username: dto.user1.username },
    { id: String(dto.user2.id), username: dto.user2.username },
  ],
  unreadCounts: { [String(currentUserId)]: dto.unreadCount },
  manuallyUnreadBy: {},
  updatedAt: dto.lastMessageAt || undefined,
});

const mapMessage = (dto: MessageObjectDTO): MessageDTO => {
  const senderId = dto.senderId ?? dto.sender?.id ?? 0;
  return {
    messageId: String(dto.id),
    conversationId: dto.conversationId ? String(dto.conversationId) : '',
    sender: {
      id: Number(senderId),
      username: dto.sender?.username || 'User',
      displayName: dto.sender?.displayName || null,
      avatarUrl: dto.sender?.avatarUrl || null,
    },
    content: dto.content,
    resources:
      dto.resourceType && dto.resourceId
        ? [{ resourceType: dto.resourceType, resourceId: Number(dto.resourceId) }]
        : [],
    isRead: dto.isRead ?? false,
    createdAt: dto.createdAt || dto.timestamp || new Date().toISOString(),
  };
};

export class FirebaseMessageService implements MessageService {
  private chatRefreshCallbacks = new Map<string, Set<() => void>>();
  private inboxRefreshCallbacks = new Set<() => void>();

  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: ConversationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    let isCancelled = false;

    const fetchInbox = async () => {
      try {
        const response: PaginatedConversationsResponseDTO = await apiRequest(
          API_CONTRACTS.MESSAGES_LIST_CONVERSATIONS
        );
        if (!isCancelled) {
          onUpdate(response.content.map((c) => mapConversation(c, userId)));
        }
      } catch (err) {
        if (!isCancelled) onError(err as Error);
      }
    };

    void fetchInbox();
    this.inboxRefreshCallbacks.add(fetchInbox);

    let unsubscribeFcm: Unsubscribe | undefined;
    if (messaging) {
      unsubscribeFcm = onMessage(messaging, () => {
        if (!isCancelled) void fetchInbox();
      });
    }

    return () => {
      isCancelled = true;
      this.inboxRefreshCallbacks.delete(fetchInbox);
      if (unsubscribeFcm) unsubscribeFcm();
    };
  }

  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    let isCancelled = false;

    const fetchChat = async () => {
      try {
        const response: PaginatedMessagesResponseDTO = await apiRequest(
          API_CONTRACTS.MESSAGES_LIST_MESSAGES(conversationId)
        );
        if (!isCancelled) {
          onUpdate(response.content.map(mapMessage));
        }
      } catch (err) {
        if (!isCancelled) onError(err as Error);
      }
    };

    void fetchChat();
    
    if (!this.chatRefreshCallbacks.has(conversationId)) {
      this.chatRefreshCallbacks.set(conversationId, new Set());
    }
    this.chatRefreshCallbacks.get(conversationId)!.add(fetchChat);

    let unsubscribeFcm: Unsubscribe | undefined;
    if (messaging) {
      unsubscribeFcm = onMessage(messaging, () => {
        if (!isCancelled) void fetchChat();
      });
    }

    return () => {
      isCancelled = true;
      const callbacks = this.chatRefreshCallbacks.get(conversationId);
      if (callbacks) {
        callbacks.delete(fetchChat);
        if (callbacks.size === 0) {
          this.chatRefreshCallbacks.delete(conversationId);
        }
      }
      if (unsubscribeFcm) unsubscribeFcm();
    };
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    _currentUserSummary: UserSummaryDTO
  ): Promise<void> {
    await apiRequest(API_CONTRACTS.MESSAGES_SEND(conversationId), {
      payload,
    });

    // Trigger local refetch immediately for the sender
    const chatCallbacks = this.chatRefreshCallbacks.get(conversationId);
    if (chatCallbacks) {
      chatCallbacks.forEach(cb => void cb());
    }
    this.inboxRefreshCallbacks.forEach(cb => void cb());
  }

  async getOrCreateConversation(
    _currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string> {
    const otherUserId =
      'profile' in otherUser && otherUser.profile?.id !== undefined
        ? otherUser.profile.id
        : Number(otherUser.id);

    const response = await apiRequest(
      API_CONTRACTS.MESSAGES_START_CONVERSATION(otherUserId)
    );

    const conversationId =
      (response as { conversationId?: string; id?: string }).conversationId ??
      (response as { conversationId?: string; id?: string }).id;

    if (!conversationId) {
      throw new Error('Failed to create conversation: missing id');
    }

    return String(conversationId);
  }

  async markConversationRead(
    _conversationId: string,
    _userId: number
  ): Promise<void> {
    console.warn('markConversationRead via REST is not implemented yet.');
  }

  async markConversationUnread(
    _conversationId: string,
    _userId: number
  ): Promise<void> {
    console.warn('markConversationUnread via REST is not implemented yet.');
  }
}

export const messageService = new FirebaseMessageService();
