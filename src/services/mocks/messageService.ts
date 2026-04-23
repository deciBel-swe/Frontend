import type {
  ConversationDTO,
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';
import type { MessageService } from '../api/messageService';
import { MOCK_MESSAGES, MOCK_CONVERSATIONS } from './mockData';

export class MockMessageService implements MessageService {
  private messages: Record<string, MessageDTO[]> = { ...MOCK_MESSAGES };
  private conversations: ConversationDTO[] = [...MOCK_CONVERSATIONS];
  private inboxListeners = new Map<
    string,
    {
      userId: string;
      onUpdate: (conversations: ConversationDTO[]) => void;
      timeoutId?: ReturnType<typeof setTimeout>;
    }
  >();
  private chatListeners = new Map<
    string,
    {
      conversationId: string;
      onUpdate: (messages: MessageDTO[]) => void;
      timeoutId?: ReturnType<typeof setTimeout>;
    }
  >();

  private emitInbox(userId: string) {
    const conversations = this.conversations
      .filter((conversation) => conversation.participantIds.includes(userId))
      .sort((left, right) => {
        const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
        const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;
        return rightTime - leftTime;
      });

    this.inboxListeners.forEach((listener) => {
      if (listener.userId !== userId) {
        return;
      }

      listener.onUpdate(conversations);
    });
  }

  private emitChat(conversationId: string) {
    const messages = [...(this.messages[conversationId] || [])];

    this.chatListeners.forEach((listener) => {
      if (listener.conversationId !== conversationId) {
        return;
      }

      listener.onUpdate(messages);
    });
  }

  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: ConversationDTO[]) => void,
    _onError: (error: Error) => void
  ): () => void {
    const userIdStr = String(userId);
    const listenerId = `inbox_${Date.now()}_${Math.random()}`;
    const timeout = setTimeout(() => {
      this.emitInbox(userIdStr);
    }, 500);

    this.inboxListeners.set(listenerId, {
      userId: userIdStr,
      onUpdate,
      timeoutId: timeout,
    });

    return () => {
      const listener = this.inboxListeners.get(listenerId);
      if (listener?.timeoutId) {
        clearTimeout(listener.timeoutId);
      }
      this.inboxListeners.delete(listenerId);
    };
  }

  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    _onError: (error: Error) => void
  ): () => void {
    const listenerId = `chat_${Date.now()}_${Math.random()}`;
    const timeout = setTimeout(() => {
      this.emitChat(conversationId);
    }, 500);

    this.chatListeners.set(listenerId, {
      conversationId,
      onUpdate,
      timeoutId: timeout,
    });

    return () => {
      const listener = this.chatListeners.get(listenerId);
      if (listener?.timeoutId) {
        clearTimeout(listener.timeoutId);
      }
      this.chatListeners.delete(listenerId);
    };
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessageRequest,
    currentUserSummary: UserSummaryDTO
  ): Promise<void> {
    const newMessage: MessageDTO = {
      messageId: `msg_${Date.now()}`,
      conversationId,
      content: payload.body,
      sender: {
        id: currentUserSummary.id,
        username: currentUserSummary.username,
        displayName: currentUserSummary.displayName || currentUserSummary.username,
        avatarUrl: currentUserSummary.avatarUrl || null,
      },
      resources: payload.resources?.map(r => ({ 
        ...r, 
        playlist: null, 
        track: null, 
        user: null 
      })) || [],
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMessage);

    // Update conversation last message
    const convIndex = this.conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      const conversation = this.conversations[convIndex];
      const senderId = String(currentUserSummary.id);
      const unreadCounts = { ...conversation.unreadCounts };
      const manuallyUnreadBy = { ...conversation.manuallyUnreadBy };

      conversation.participantIds.forEach((participantId) => {
        if (participantId === senderId) {
          unreadCounts[participantId] = 0;
          manuallyUnreadBy[participantId] = false;
          return;
        }

        unreadCounts[participantId] = (unreadCounts[participantId] ?? 0) + 1;
        manuallyUnreadBy[participantId] = false;
      });

      this.conversations[convIndex] = {
        ...conversation,
        updatedAt: newMessage.createdAt,
        lastMessage: {
          content: newMessage.content,
          senderId: String(newMessage.sender.id),
          createdAt: newMessage.createdAt,
        },
        unreadCounts,
        manuallyUnreadBy,
      };
    }

    this.emitChat(conversationId);
    const participants = this.conversations.find((conversation) => conversation.id === conversationId)?.participantIds ?? [];
    participants.forEach((participantId) => this.emitInbox(participantId));

    return Promise.resolve();
  }

  async getOrCreateConversation(
    currentUser: import('@/types/user').UserMe,
    otherUser: import('@/types/user').UserPublic | import('@/types/message').UserSummaryDTO
  ): Promise<string> {
    const myId = String(currentUser.id);
    const theirId = String('profile' in otherUser ? otherUser.profile.id : otherUser.id);

    const existing = this.conversations.find(c => 
      c.participantIds.includes(myId) && c.participantIds.includes(theirId)
    );

    if (existing) {
      return Promise.resolve(existing.id);
    }

    const newConvId = `conv_${Date.now()}`;
    
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
      id: newConvId,
      participantIds: [myId, theirId],
      participants: [meData, otherUserData],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    this.conversations.push(newConv);
    this.messages[newConvId] = [];
    this.emitInbox(myId);
    this.emitInbox(theirId);

    return Promise.resolve(newConvId);
  }

  async markConversationRead(
    conversationId: string,
    userId: number
  ): Promise<void> {
    const userIdStr = String(userId);
    const convIndex = this.conversations.findIndex(
      (conversation) => conversation.id === conversationId
    );

    if (convIndex === -1) {
      return Promise.resolve();
    }

    const conversation = this.conversations[convIndex];
    this.conversations[convIndex] = {
      ...conversation,
      unreadCounts: {
        ...conversation.unreadCounts,
        [userIdStr]: 0,
      },
      manuallyUnreadBy: {
        ...conversation.manuallyUnreadBy,
        [userIdStr]: false,
      },
    };

    this.messages[conversationId] = (this.messages[conversationId] || []).map(
      (message) =>
        String(message.sender.id) === userIdStr
          ? message
          : { ...message, isRead: true }
    );

    this.emitInbox(userIdStr);
    this.emitChat(conversationId);

    return Promise.resolve();
  }

  async markConversationUnread(
    conversationId: string,
    userId: number
  ): Promise<void> {
    const userIdStr = String(userId);
    const convIndex = this.conversations.findIndex(
      (conversation) => conversation.id === conversationId
    );

    if (convIndex === -1) {
      return Promise.resolve();
    }

    const conversation = this.conversations[convIndex];
    this.conversations[convIndex] = {
      ...conversation,
      manuallyUnreadBy: {
        ...conversation.manuallyUnreadBy,
        [userIdStr]: true,
      },
    };

    this.emitInbox(userIdStr);
    return Promise.resolve();
  }
}
