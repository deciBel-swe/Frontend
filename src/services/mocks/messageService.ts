import { MessageService } from '../api/messageService';
import type {
  MessageDTO,
  PaginatedMessageResponse,
  SendMessageRequest,
} from '@/types/message';
import {
  buildMockSentMessage,
  getMockChatHistoryResponse,
  getMockInboxResponse,
} from './messageMockData';

export class MockMessageService implements MessageService {
  async getInbox(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedMessageResponse> {
    return getMockInboxResponse(params?.page ?? 0, params?.size ?? 20);
  }

  async getChatHistory(
    userId: number,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedMessageResponse> {
    const history = getMockChatHistoryResponse(
      userId,
      params?.page ?? 0,
      params?.size ?? 20
    );

    return (
      history ?? {
        content: [],
        pageNumber: params?.page ?? 0,
        pageSize: params?.size ?? 20,
        totalElements: 0,
        totalPages: 1,
        isLast: true,
      }
    );
  }

  async sendMessage(
    userId: number,
    payload: SendMessageRequest
  ): Promise<MessageDTO> {
    return buildMockSentMessage(userId, {
      ...payload,
      body: payload.body.trim(),
    });
  }
}
