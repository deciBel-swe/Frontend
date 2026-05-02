'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Sidebar from '@/features/messages/components/Sidebar';
import MessageHeader from '@/features/messages/components/MessageHeader';
import MessageWrapper from '@/features/messages/components/MessageWrapper';
import MessageInput from '@/features/messages/components/MessageInput';
import NewMessageForm from '@/features/messages/forms/NewMessageForm';
import { useAuth } from '@/features/auth/useAuth';
import { useInbox } from '@/hooks/useInbox';
import { useChat } from '@/hooks/useChat';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { userService } from '@/services';
import type { Conversation, Message, User } from '@/components/messages/types';

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message.trim().length > 0
    ? error.message
    : fallback;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get('conversation');

  const { user } = useAuth();
  const { conversations, inboxItems, isLoading: isInboxLoading } = useInbox();
  const {
    users: blockedUsers,
    isUserBlocked,
    refresh: refreshBlockedUsers,
  } = useBlockedUsers(0, 200);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    requestedConversationId
  );
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [isBlockPending, setIsBlockPending] = useState(false);

  const {
    messages: chatMessages,
    sendMessage,
    sendMessageToConversation,
    getOrCreateConversation,
    markConversationRead,
    markConversationUnread,
    isSending,
  } = useChat(activeConversationId);

  useEffect(() => {
    if (requestedConversationId) {
      setActiveConversationId(requestedConversationId);
      return;
    }

    if (!activeConversationId && inboxItems.length > 0) {
      setActiveConversationId(inboxItems[0].conversationId);
    }
  }, [activeConversationId, inboxItems, requestedConversationId]);

  const currentUserId = String(user?.id ?? '');

  const activeConversationDto = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeConversationId) ??
      null,
    [activeConversationId, conversations]
  );

  const activeParticipant = useMemo<User | null>(() => {
    if (!activeConversationDto) {
      return null;
    }

    const participant =
      activeConversationDto.participants.find(
        (entry) => entry.id !== currentUserId
      ) ?? activeConversationDto.participants[0];

    if (!participant) {
      return null;
    }

    return {
      id: participant.id,
      username: participant.username,
      displayName: participant.displayName || participant.username,
      avatarUrl: participant.avatarUrl || undefined,
    };
  }, [activeConversationDto, currentUserId]);

  const actualUnreadCount =
    activeConversationDto?.unreadCounts[currentUserId] ?? 0;
  const isManuallyUnread =
    activeConversationDto?.manuallyUnreadBy[currentUserId] ?? false;
  const isMarkedUnread = actualUnreadCount > 0 || isManuallyUnread;

  useEffect(() => {
    if (!activeConversationId || actualUnreadCount === 0) {
      return;
    }

    void markConversationRead();
  }, [activeConversationId, actualUnreadCount, markConversationRead]);

  const activeConversation = useMemo<Conversation | null>(() => {
    if (!activeConversationDto || !activeParticipant) {
      return null;
    }

    const fallbackLastMessage: Message = {
      id: `${activeConversationDto.id}-last`,
      senderId: activeConversationDto.lastMessage?.senderId || activeParticipant.id,
      sender: activeParticipant,
      content: [
        {
          type: 'text',
          text: activeConversationDto.lastMessage?.content || 'Conversation started',
        },
      ],
      createdAt:
        activeConversationDto.lastMessage?.createdAt ||
        activeConversationDto.updatedAt ||
        '',
      isRead: true,
    };

    return {
      id: activeConversationDto.id,
      participants: activeConversationDto.participants.map((participant) => ({
        id: participant.id,
        username: participant.username,
        displayName: participant.displayName || participant.username,
        avatarUrl: participant.avatarUrl || undefined,
      })),
      messages: chatMessages,
      lastMessage: chatMessages[chatMessages.length - 1] || fallbackLastMessage,
      unreadCount: Math.max(actualUnreadCount, isManuallyUnread ? 1 : 0),
      isMarkedUnread,
    };
  }, [
    activeConversationDto,
    activeParticipant,
    actualUnreadCount,
    chatMessages,
    isManuallyUnread,
    isMarkedUnread,
  ]);

  const participantId = Number(activeParticipant?.id ?? 0);
  const isBlocked =
    Number.isFinite(participantId) && participantId > 0
      ? isUserBlocked(participantId)
      : false;

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setComposerError(null);
    setHeaderError(null);
    router.replace(`/messages?conversation=${conversationId}`);
  };

  const handleToggleUnread = async () => {
    if (!activeConversationId) {
      return;
    }

    try {
      setHeaderError(null);
      if (isMarkedUnread) {
        await markConversationRead();
      } else {
        await markConversationUnread();
      }
    } catch (error) {
      setHeaderError(
        getErrorMessage(error, 'Unable to update the unread state right now.')
      );
    }
  };

  const handleToggleBlock = async () => {
    if (!activeParticipant || !participantId || isBlockPending) {
      return;
    }

    setIsBlockPending(true);
    setHeaderError(null);

    try {
      if (isBlocked) {
        await userService.unblockUser(participantId);
      } else {
        await userService.blockUser(participantId);
      }

      refreshBlockedUsers();
    } catch (error) {
      setHeaderError(
        getErrorMessage(error, 'Unable to update the block list right now.')
      );
    } finally {
      setIsBlockPending(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (isBlocked) {
      setComposerError(
        'Unblock this user before sending more messages in this conversation.'
      );
      return;
    }

    try {
      setComposerError(null);
      await sendMessage(text);
    } catch (error) {
      setComposerError(
        getErrorMessage(error, 'Unable to send your message right now.')
      );
    }
  };

  const handleNewMessage = async (username: string, text: string) => {
    const trimmedUsername = username.trim().replace(/^@/, '');
    const recipient = await userService.getPublicUserByUsername(trimmedUsername);

    if (recipient.profile.id === user?.id) {
      throw new Error('You cannot send a message to yourself.');
    }

    if (blockedUsers.some((blockedUser) => blockedUser.id === recipient.profile.id)) {
      throw new Error('Unblock this user before sending them a message.');
    }

    const conversationId = await getOrCreateConversation(recipient);
    setActiveConversationId(conversationId);
    router.replace(`/messages?conversation=${conversationId}`);
    await sendMessageToConversation(conversationId, text);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-bg-base mt-12">
      <aside className="hidden md:block w-85 shrink-0 min-w-0 mt-3">
        <Sidebar
          items={inboxItems}
          activeConversationId={activeConversationId || undefined}
          onSelect={handleSelectConversation}
          onNewMessage={() => setIsNewMessageOpen(true)}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation && activeParticipant ? (
          <>
            <MessageHeader
              participant={activeParticipant}
              isBlocked={isBlocked}
              isBlockPending={isBlockPending}
              isMarkedUnread={isMarkedUnread}
              onToggleBlock={() => void handleToggleBlock()}
              onToggleUnread={() => void handleToggleUnread()}
            />
            {headerError && (
              <div className="px-4 py-2 text-sm text-status-error">
                {headerError}
              </div>
            )}
            {isBlocked && (
              <div className="px-4 py-2 text-sm text-text-muted">
                This contact is blocked. Unblock them to send new messages.
              </div>
            )}
            <MessageWrapper
              conversation={activeConversation}
              currentUserId={currentUserId}
            />
            {composerError && (
              <div className="px-4 pb-2 text-sm text-status-error">
                {composerError}
              </div>
            )}
            <MessageInput
              onSend={(text) => {
                void handleSendMessage(text);
              }}
              disabled={isBlocked || isSending}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            {isInboxLoading ? 'Loading conversations...' : 'Select a conversation'}
          </div>
        )}
      </div>

      {isNewMessageOpen && (
        <NewMessageForm
          onClose={() => setIsNewMessageOpen(false)}
          onSend={handleNewMessage}
        />
      )}
    </div>
  );
}
