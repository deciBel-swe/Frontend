'use client';

import type { InboxItem } from '@/components/messages/types';
import InboxItemComponent from './InboxItem';

interface InboxListProps {
  items: InboxItem[];
  activeConversationId?: string;
  onSelect?: (conversationId: string) => void;
}

export default function InboxList({ items, activeConversationId, onSelect }: InboxListProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted text-sm">
        No messages yet
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <InboxItemComponent
          key={item.conversationId}
          item={item}
          isActive={item.conversationId === activeConversationId}
          onClick={() => onSelect?.(item.conversationId)}
        />
      ))}
    </div>
  );
}