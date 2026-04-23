'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { messageService } from '@/services';
import type { InboxItem, User } from '@/components/messages/types';
import type { ConversationDTO } from '@/types/message';

const getUnreadCount = (conversation: ConversationDTO, userId: string): number =>
  Math.max(
    conversation.unreadCounts[userId] ?? 0,
    conversation.manuallyUnreadBy[userId] ? 1 : 0
  );

const mapConversationToInboxItem = (
  conversation: ConversationDTO,
  userId: string
): InboxItem => {
  const fallbackParticipant = conversation.participants[0] ?? {
    id: '',
    username: 'unknown',
    displayName: 'Unknown user',
    avatarUrl: null,
  };

  const participantDto =
    conversation.participants.find((entry) => entry.id !== userId) ??
    fallbackParticipant;

  const participant: User = {
    id: participantDto.id,
    username: participantDto.username,
    displayName: participantDto.displayName || participantDto.username,
    avatarUrl: participantDto.avatarUrl || undefined,
  };

  return {
    conversationId: conversation.id,
    participant,
    lastMessagePreview:
      conversation.lastMessage?.content || 'Start the conversation',
    lastMessageAt:
      conversation.lastMessage?.createdAt ||
      conversation.updatedAt ||
      conversation.createdAt ||
      '',
    unreadCount: getUnreadCount(conversation, userId),
  };
};

export function useInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const unsubscribe = messageService.subscribeToInbox(
      user.id,
      (data) => {
        setConversations(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const userId = String(user?.id ?? '');

  const inboxItems = useMemo(
    () => conversations.map((conversation) => mapConversationToInboxItem(conversation, userId)),
    [conversations, userId]
  );

  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + getUnreadCount(conversation, userId),
        0
      ),
    [conversations, userId]
  );

  return { conversations, inboxItems, unreadCount, isLoading, error };
}
