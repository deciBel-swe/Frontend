'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { messageService } from '@/services';
import type { InboxItem, User } from '@/components/messages/types';
import type { ConversationDTO } from '@/types/message';

const getUnreadCount = (
  conversation: ConversationDTO,
  userId: string
): number =>
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

/**
 * useInbox Hook
 *
 * Real-time inbox management for the current user.
 *
 * Features:
 * - Real-time conversation list from Firebase
 * - Automatic unread count calculation (including manual flags)
 * - Conversations sorted by most recent update
 * - Complete lifecycle management (loading, error states)
 *
 * The hook automatically:
 * - Connects to Firebase for real-time conversation updates
 * - Maps raw conversation data to UI-friendly InboxItem format
 * - Calculates total unread count across all conversations
 * - Handles connection cleanup on unmount or user change
 *
 * Unread count is the maximum of:
 * - Actual unreadCounts[userId] from message tracking
 * - 1 if manuallyUnreadBy[userId] is true (manual flag)
 *
 * @returns Object with conversations, inbox items, unread count, and loading/error states
 *
 * @example
 * const { inboxItems, unreadCount, isLoading, error } = useInbox();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <InboxList items={inboxItems} unreadBadge={unreadCount} />
 * );
 */
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
    () =>
      conversations.map((conversation) =>
        mapConversationToInboxItem(conversation, userId)
      ),
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
