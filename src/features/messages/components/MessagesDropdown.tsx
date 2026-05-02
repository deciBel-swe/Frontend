'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { InboxItem } from '@/components/messages/types';
import InboxList from '@/features/messages/inbox/InboxList';
import { ROUTES } from '@/constants/routes';
import DropdownPopup from '@/components/social/DropdownPopup';

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
  const router = useRouter();

  const handleSelect = (conversationId: string) => {
    onClose?.();
    router.push(`${ROUTES.MESSAGES}?conversation=${conversationId}`);
  };

  return (
    <DropdownPopup
      header={<div className="text-l text-base font-bold text-text-primary">Messages</div>}
      footer={
        <Link
          href={ROUTES.MESSAGES}
          onClick={onClose}
          className="block text-center text-xs font-bold text-text-primary hover:text-text-secondary py-3 transition-colors duration-150 no-underline"
        >
          View all messages
        </Link>
      }
    >
      <InboxList
        items={items.slice(0, 3)}
        onSelect={handleSelect}
      />
    </DropdownPopup>
  );
}
