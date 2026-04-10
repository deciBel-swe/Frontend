import {
  apiRequest,
  normalizeApiError,
  type ApiQueryParams,
} from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type {
  MessageDTO,
  PaginatedMessageResponse,
  SendMessageRequest,
} from '@/types/message';

export interface PaginationParams {
  page?: number;
  size?: number;
}

const toQueryParams = (
  params?: PaginationParams
): ApiQueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const query: ApiQueryParams = {};

  if (params.page !== undefined) {
    query.page = params.page;
  }

  if (params.size !== undefined) {
    query.size = params.size;
  }

  return Object.keys(query).length > 0 ? query : undefined;
};

export interface MessageService {
  getInbox(params?: PaginationParams): Promise<PaginatedMessageResponse>;
  getChatHistory(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedMessageResponse>;
  sendMessage(userId: number, payload: SendMessageRequest): Promise<MessageDTO>;
}

export class RealMessageService implements MessageService {
  async getInbox(params?: PaginationParams): Promise<PaginatedMessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.MESSAGES_INBOX, {
        params: toQueryParams(params),
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getChatHistory(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedMessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.MESSAGES_CHAT_HISTORY(userId), {
        params: toQueryParams(params),
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async sendMessage(
    userId: number,
    payload: SendMessageRequest
  ): Promise<MessageDTO> {
    try {
      return await apiRequest(API_CONTRACTS.MESSAGES_SEND(userId), {
        payload,
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
