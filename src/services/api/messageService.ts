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

const mapConversation = (dto: ConversationResponseDTO, currentUserId: number): ConversationDTO => ({
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

const mapMessage = (dto: MessageObjectDTO): MessageDTO => ({
  messageId: String(dto.id),
  conversationId: String(dto.conversationId),
  sender: {
    id: dto.senderId,
    username: 'User', // Fallback
  },
  content: dto.content,
  resources: dto.resourceType && dto.resourceId ? [{ resourceType: dto.resourceType, resourceId: dto.resourceId }] : [],
  isRead: dto.isRead,
  createdAt: dto.createdAt,
});

export class FirebaseMessageService implements MessageService {
  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: ConversationDTO[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    let isCancelled = false;

    const fetchInbox = async () => {
      try {
        const response: PaginatedConversationsResponseDTO = await apiRequest(API_CONTRACTS.MESSAGES_LIST_CONVERSATIONS);
        if (!isCancelled) {
          onUpdate(response.content.map(c => mapConversation(c, userId)));
        }
      } catch (err) {
        if (!isCancelled) onError(err as Error);
      }
    };

    void fetchInbox();

    let unsubscribeFcm: Unsubscribe | undefined;
    if (messaging) {
      unsubscribeFcm = onMessage(messaging, () => {
        if (!isCancelled) void fetchInbox();
      });
    }

    return () => {
      isCancelled = true;
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
        const response: PaginatedMessagesResponseDTO = await apiRequest(API_CONTRACTS.MESSAGES_LIST_MESSAGES(conversationId));
        if (!isCancelled) {
          onUpdate(response.content.map(mapMessage));
        }
      } catch (err) {
        if (!isCancelled) onError(err as Error);
      }
    };

    void fetchChat();

    let unsubscribeFcm: Unsubscribe | undefined;
    if (messaging) {
      unsubscribeFcm = onMessage(messaging, () => {
        if (!isCancelled) void fetchChat();
      });
    }

    return () => {
      isCancelled = true;
      if (unsubscribeFcm) unsubscribeFcm();
    };
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    _currentUserSummary: UserSummaryDTO
  ): Promise<void> {
    await apiRequest(API_CONTRACTS.MESSAGES_SEND(conversationId), {
      payload: {
        content: payload.body,
        recipientId: Number(conversationId),
      } as unknown as SendMessageRequest
    });
  }

  async getOrCreateConversation(
    _currentUser: UserMe,
    otherUser: UserPublic | UserSummaryDTO
  ): Promise<string> {
    await apiRequest(API_CONTRACTS.MESSAGES_START_CONVERSATION(Number(otherUser.id)));
    return String(otherUser.id);
  }

  async markConversationRead(_conversationId: string, _userId: number): Promise<void> {
    console.warn('markConversationRead via REST is not implemented yet.');
  }

  async markConversationUnread(_conversationId: string, _userId: number): Promise<void> {
    console.warn('markConversationUnread via REST is not implemented yet.');
  }
}

export const messageService = new FirebaseMessageService();
