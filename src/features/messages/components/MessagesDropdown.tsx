'use client';

import Link from 'next/link';
import type { InboxItem } from '@/components/messages/types';
import InboxList from '@/features/messages/inbox/InboxList';
import {ROUTES} from '@/constants/routes';

interface MessagesDropdownProps {
  items: InboxItem[];
  onClose?: () => void;
}

/**
 * MessagesDropdown — renders inside the TopNavBar when the mail icon is clicked.
 *
 * Shows:
 *  - Header: <h1>Messages</h1>
 *  - InboxList (top 3 previews)
 *  - "View all messages" link
 *
 * @example
 * {messagesOpen && (
 *   <MessagesDropdown items={inboxItems.slice(0, 3)} onClose={closeMessages} />
 * )}
 */
export default function MessagesDropdown({ items, onClose }: MessagesDropdownProps) {
  return (
    <div className="absolute top-[calc(100%+2px)] right-0 w-100 bg-bg-base border border-interactive-default rounded z-300 overflow-hidden animate-drop-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="text-l text-base font-bold text-text-primary">Messages</div>
      </div>

      {/* Inbox previews */}
      <InboxList
        items={items.slice(0, 3)}
        onSelect={(_conversationId) => {
          onClose?.();
          // Navigation handled by the parent — pass conversationId via router if needed
        }}
      />

      {/* Footer link */}
      <Link
        href={ROUTES.MESSAGES}
        onClick={onClose}
        className="block text-center text-xs font-bold text-text-primary hover:text-text-secondary py-3 border-t border-border-default transition-colors duration-150 no-underline"
      >
        View all messages
      </Link>
    </div>
  );
}