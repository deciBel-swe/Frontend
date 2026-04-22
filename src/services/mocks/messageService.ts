import type {
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';
import type { MessageService } from '../api/messageService';
import { MOCK_MESSAGES, MOCK_CONVERSATIONS } from './mockData';

export class MockMessageService implements MessageService {
  private messages: Record<string, MessageDTO[]> = { ...MOCK_MESSAGES };
  private conversations = [...MOCK_CONVERSATIONS];

  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: unknown[]) => void,
    _onError: (error: Error) => void
  ): () => void {
    const userIdStr = String(userId);
    const timeout = setTimeout(() => {
      const userConvs = this.conversations.filter(c => 
        c.participantIds.includes(userIdStr)
      );
      onUpdate(userConvs);
    }, 500);

    return () => clearTimeout(timeout);
  }

  subscribeToChat(
    conversationId: string,
    onUpdate: (messages: MessageDTO[]) => void,
    _onError: (error: Error) => void
  ): () => void {
    const timeout = setTimeout(() => {
      onUpdate(this.messages[conversationId] || []);
    }, 500);

    return () => clearTimeout(timeout);
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
      this.conversations[convIndex] = {
        ...this.conversations[convIndex],
        updatedAt: newMessage.createdAt,
        lastMessage: {
          content: newMessage.content,
          senderId: String(newMessage.sender.id),
          createdAt: newMessage.createdAt
        }
      };
    }

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
    };

    this.conversations.push(newConv as unknown as typeof this.conversations[0]);
    this.messages[newConvId] = [];

    return Promise.resolve(newConvId);
  }
}
