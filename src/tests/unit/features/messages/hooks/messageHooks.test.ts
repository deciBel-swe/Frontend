import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

import { messageService } from '@/services';
import { useGetChatHistory } from '@/features/messages/hooks/useGetChatHistory';
import { useGetInbox } from '@/features/messages/hooks/useGetInbox';
import { useSendMessage } from '@/features/messages/hooks/useSendMessage';

jest.mock('@/services', () => ({
  messageService: {
    getInbox: jest.fn(),
    getChatHistory: jest.fn(),
    sendMessage: jest.fn(),
  },
}));

const mockedMessageService = messageService as {
  getInbox: jest.Mock;
  getChatHistory: jest.Mock;
  sendMessage: jest.Mock;
};

describe('message hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useGetInbox fetches inbox on mount', async () => {
    const response = {
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    };
    mockedMessageService.getInbox.mockResolvedValue(response);

    const { result } = renderHook(() => useGetInbox({ page: 0, size: 20 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.inbox).toEqual(response);
    expect(mockedMessageService.getInbox).toHaveBeenCalledWith({
      page: 0,
      size: 20,
    });
  });

  it('useGetChatHistory fetches history when userId is provided', async () => {
    const response = {
      content: [],
      pageNumber: 1,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      isLast: true,
    };
    mockedMessageService.getChatHistory.mockResolvedValue(response);

    const { result } = renderHook(() =>
      useGetChatHistory(42, { page: 1, size: 10 })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.chatHistory).toEqual(response);
    expect(mockedMessageService.getChatHistory).toHaveBeenCalledWith(42, {
      page: 1,
      size: 10,
    });
  });

  it('useGetChatHistory does not call service when userId is missing', async () => {
    const { result } = renderHook(() => useGetChatHistory(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.chatHistory).toBeNull();
    expect(mockedMessageService.getChatHistory).not.toHaveBeenCalled();
  });

  it('useSendMessage sends message and stores the latest response', async () => {
    const response = {
      messageId: 1,
      conversationId: 7,
      sender: {
        id: 2,
        username: 'sender',
      },
      content: 'hello',
      resources: [],
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    mockedMessageService.sendMessage.mockResolvedValue(response);

    const { result } = renderHook(() => useSendMessage());

    await act(async () => {
      await result.current.sendMessage(99, {
        body: 'hello',
      });
    });

    await waitFor(() => expect(result.current.sentMessage).toEqual(response));

    expect(mockedMessageService.sendMessage).toHaveBeenCalledWith(99, {
      body: 'hello',
    });
  });
});
