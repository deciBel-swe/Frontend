'use client';

import { useState } from 'react';
import Sidebar from '@/features/messages/components/Sidebar';
import MessageHeader from '@/features/messages/components/MessageHeader';
import MessageWrapper from '@/features/messages/components/MessageWrapper';
import MessageInput from '@/features/messages/components/MessageInput';
import NewMessageForm from '@/features/messages/forms/NewMessageForm';
import { CURRENT_USER, TEST_CONVERSATIONS, getInboxItems } from '@/features/messages/testdata';
import type { Conversation } from '@/components/messages/types';

export default function Page() {
  const [conversations, setConversations] = useState<Conversation[]>(TEST_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(
    TEST_CONVERSATIONS[0].id
  );
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  const inboxItems = getInboxItems(conversations, CURRENT_USER.id);
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeParticipant = activeConversation?.participants.find(
    (p) => p.id !== CURRENT_USER.id
  );

  const handleMarkUnread = () => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, isMarkedUnread: !conv.isMarkedUnread }
          : conv
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-bg-base mt-12">
      {/* Sidebar */}
      <aside className="hidden md:block w-85 shrink-0 min-w-0 mt-3">
      <Sidebar
        items={inboxItems}
        activeConversationId={activeConversationId}
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
              isMarkedUnread={activeConversation.isMarkedUnread}
              onMarkUnread={handleMarkUnread}
            />
            <MessageWrapper
              conversation={activeConversation}
              currentUserId={CURRENT_USER.id}
            />
            <MessageInput
              onSend={(message) => {
                // TODO: Implement send message logic
                console.log('Send message:', message);
              }}
              onAddTrackOrPlaylist={() => {
                // TODO: Implement add track/playlist logic
                console.log('Add track or playlist');
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            Select a conversation
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