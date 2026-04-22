'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/features/messages/components/Sidebar';
import MessageHeader from '@/features/messages/components/MessageHeader';
import MessageWrapper from '@/features/messages/components/MessageWrapper';
import MessageInput from '@/features/messages/components/MessageInput';
import NewMessageForm from '@/features/messages/forms/NewMessageForm';
import { useAuth } from '@/features/auth/useAuth';
import { useInbox } from '@/hooks/useInbox';
import { useChat } from '@/hooks/useChat';
import type { Conversation, Message, User, InboxItem } from '@/components/messages/types';

export default function Page() {
  const { user } = useAuth();
  const { conversations: inboxMessages, isLoading: isInboxLoading } = useInbox();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { messages: chatMessages, sendMessage, isLoading: isChatLoading } = useChat(activeConversationId);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  // Map Firestore inbox messages to UI InboxItem
  const inboxItems: InboxItem[] = useMemo(() => {
    return inboxMessages.map((msg: any) => {
      // Find the other participant if we have that info in the conversation doc
      // For now, assume sender is the other person if we are in inbox
      const participant: User = {
        id: String(msg.sender.id),
        username: msg.sender.username,
        displayName: msg.sender.displayName || msg.sender.username,
        avatarUrl: msg.sender.avatarUrl || undefined,
      };

      return {
        conversationId: msg.conversationId,
        participant,
        lastMessagePreview: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: 0, // Simplified
      };
    });
  }, [inboxMessages]);

  // Find active conversation info
  const activeConversationMsg = inboxMessages.find((m) => m.conversationId === activeConversationId) as any;
  
  const activeConversation: Conversation | null = useMemo(() => {
    if (!activeConversationId || !activeConversationMsg) return null;

    const uiMessages: Message[] = chatMessages.map((m) => ({
      id: m.messageId,
      senderId: String(m.sender.id),
      sender: {
        id: String(m.sender.id),
        username: m.sender.username,
        displayName: m.sender.displayName || m.sender.username,
        avatarUrl: m.sender.avatarUrl || undefined,
      },
      content: [{ type: 'text', text: m.content }], // Simplified mapping
      createdAt: m.createdAt,
      isRead: m.isRead,
    }));

    return {
      id: activeConversationId,
      participants: [], // Simplified
      messages: uiMessages,
      lastMessage: uiMessages[uiMessages.length - 1],
      unreadCount: 0,
    };
  }, [activeConversationId, activeConversationMsg, chatMessages]);

  const activeParticipant = useMemo(() => {
    if (!activeConversationMsg) return null;
    return {
      id: String(activeConversationMsg.sender.id),
      username: activeConversationMsg.sender.username,
      displayName: activeConversationMsg.sender.displayName || activeConversationMsg.sender.username,
      avatarUrl: activeConversationMsg.sender.avatarUrl || undefined,
    } as User;
  }, [activeConversationMsg]);

  const handleMarkUnread = () => {
    // TODO: Implement via Firebase if needed
    console.log('Mark unread');
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-bg-base mt-12">
      {/* Sidebar */}
      <aside className="hidden md:block w-85 shrink-0 min-w-0 mt-3">
        <Sidebar
          items={inboxItems}
          activeConversationId={activeConversationId || undefined}
          onSelect={setActiveConversationId}
          onNewMessage={() => setIsNewMessageOpen(true)}
        />
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation && activeParticipant ? (
          <>
            <MessageHeader
              participant={activeParticipant}
              isMarkedUnread={activeConversation.isMarkedUnread || false}
              onMarkUnread={handleMarkUnread}
            />
            <MessageWrapper
              conversation={activeConversation}
              currentUserId={String(user?.id)}
            />
            <MessageInput
              onSend={(text) => {
                void sendMessage({ body: text });
              }}
              onAddTrackOrPlaylist={() => {
                console.log('Add track or playlist');
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            {isInboxLoading ? 'Loading conversations...' : 'Select a conversation'}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {isNewMessageOpen && (
        <NewMessageForm onClose={() => setIsNewMessageOpen(false)} />
      )}
    </div>
  );
}