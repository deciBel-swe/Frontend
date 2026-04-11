'use client';

import type { InboxItem } from '@/components/messages/types';
import InboxList from '../inbox/InboxList';
import ScrollableArea from '@/components/scroll/ScrollableArea';

interface SidebarProps {
  items: InboxItem[];
  activeConversationId?: string;
  onSelect?: (conversationId: string) => void;
  onNewMessage?: () => void;
}

export default function Sidebar({
  items,
  activeConversationId,
  onSelect,
  onNewMessage,
}: SidebarProps) {
  return (
    <aside className="flex flex-col w-80 shrink-0 bg-bg-base h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-2xl font-extrabold text-text-primary">Messages</div>
        <button
          type="button"
          onClick={onNewMessage}
          className="bg-text-primary text-bg-base text-xs font-bold px-3 py-1.5 rounded hover:opacity-80 transition-opacity duration-150 cursor-pointer"
        >
          New
        </button>
      </div>

      {/* Inbox List */}
      <ScrollableArea className="flex-1" maxHeight="calc(100vh - 60px)">
        <InboxList
          items={items}
          activeConversationId={activeConversationId}
          onSelect={onSelect}
        />
      </ScrollableArea>
    </aside>
  );
}