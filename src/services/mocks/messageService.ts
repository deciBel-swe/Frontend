import type {
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';
import type { MessageService } from '../api/messageService';
import { MOCK_MESSAGES } from './mockData';

export class MockMessageService implements MessageService {
  private messages: Record<string, MessageDTO[]> = { ...MOCK_MESSAGES };

  private getInboxForUser(userId: number): MessageDTO[] {
    const inbox: MessageDTO[] = [];
    const conversationIds = Object.keys(this.messages);
    
    for (const convId of conversationIds) {
      const convMessages = this.messages[convId];
      if (convMessages.length === 0) continue;
      
      const lastMessage = convMessages[convMessages.length - 1];
      // In this mock, we assume user is part of all conversations
      // or we can add logic to check if user is sender or participant
      inbox.push(lastMessage);
    }
    
    return inbox.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  subscribeToInbox(
    userId: number,
    onUpdate: (conversations: MessageDTO[]) => void,
    _onError: (error: Error) => void
  ): () => void {
    const timeout = setTimeout(() => {
      onUpdate(this.getInboxForUser(userId));
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
      sender: currentUserSummary,
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

    return Promise.resolve();
  }
}
