'use client';

import Image from 'next/image';
import type { InboxItem } from '@/components/messages/types';

interface InboxItemProps {
  item: InboxItem;
  isActive?: boolean;
  onClick?: () => void;
}

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function InboxItemComponent({ item, isActive, onClick }: InboxItemProps) {
  const initials = getInitials(item.participant.displayName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-colors duration-150 cursor-pointer hover:bg-interactive-default ${
        isActive ? 'bg-interactive-default' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {item.participant.avatarUrl ? (
          <Image
            src={item.participant.avatarUrl}
            alt={item.participant.displayName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center text-sm font-semibold text-neutral-700">
            {initials}
          </div>
        )}
        {item.unreadCount > 0 && (
          <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rounded-full bg-brand-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs truncate ${
              item.unreadCount > 0 ? 'font-bold text-text-primary' : 'font-bold text-text-primary'
            }`}
          >
            {item.participant.displayName}
          </span>
          <span className="text-xs font-medium text-text-muted shrink-0">{item.lastMessageAt}</span>
        </div>
        <p className="text-xs font-medium text-text-muted truncate mt-0.5">{item.lastMessagePreview}</p>
      </div>
    </button>
  );
}