'use client';

import type { Conversation } from '@/components/messages/types';
import MessageBubble from './MessageBubble';
import ScrollableArea from '@/components/scroll/ScrollableArea';

interface MessageWrapperProps {
  conversation: Conversation;
  currentUserId: string;
}

export default function MessageWrapper({ conversation, currentUserId }: MessageWrapperProps) {
  return (
    <ScrollableArea
      className="flex-1 px-4 py-4"
      maxHeight="calc(100vh - 220px)"
    >
      {conversation.messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          currentUserId={currentUserId}
        />
      ))}
    </ScrollableArea>
  );
}