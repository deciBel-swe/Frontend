'use client';

import { useEffect, useState, useCallback } from 'react';
import { messageService } from '@/services/api/messageService';
import { useAuth } from '@/features/auth/useAuth';
import type {
  MessageDTO,
  SendMessageRequest,
  UserSummaryDTO,
} from '@/types/message';
import type { UserPublic } from '@/types/user';

export function useChat(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(!!conversationId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = messageService.subscribeToChat(
      conversationId,
      (data) => {
        setMessages(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = useCallback(
    async (payload: SendMessageRequest) => {
      if (!conversationId || !user) return;

      const currentUserSummary: UserSummaryDTO = {
        id: user.id,
        username: user.username || '',
        displayName: user.displayName || '',
        avatarUrl: user.avatarUrl || null,
      };

      await messageService.sendMessage(
        conversationId,
        payload,
        currentUserSummary
      );
    },
    [conversationId, user]
  );

  const getOrCreateConversation = useCallback(
    async (otherUser: UserPublic | UserSummaryDTO) => {
      if (!user) throw new Error('Must be logged in to start a conversation');
      return messageService.getOrCreateConversation(user as unknown as import('@/types/user').UserMe, otherUser);
    },
    [user]
  );

  return { messages, isLoading, error, sendMessage, getOrCreateConversation };
}
