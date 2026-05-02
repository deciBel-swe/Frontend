'use client';

import Link from 'next/link';
import Button from '@/components/buttons/Button';
import type { User } from '@/components/messages/types';
import { buildProfileHref } from '@/utils/socialRoutes';

interface MessageHeaderProps {
  participant: User;
  isBlocked: boolean;
  isBlockPending?: boolean;
  isMarkedUnread?: boolean;
  onToggleBlock: () => void;
  onToggleUnread: () => void;
}

export default function MessageHeader({
  participant,
  isBlocked,
  isBlockPending = false,
  isMarkedUnread,
  onToggleBlock,
  onToggleUnread,
}: MessageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4 bg-bg-base">
      <div className="flex items-center gap-2">
        <Link
          href={buildProfileHref(participant.username)}
          className="font-bold text-base text-text-primary hover:text-text-secondary transition-colors"
        >
          {participant.displayName}
        </Link>

        <Button
          type="button"
          onClick={onToggleBlock}
          disabled={isBlockPending}
          className="text-xs font-bold px-3 py-1.5 text-text-primary hover:bg-interactive-default transition-colors duration-150 cursor-pointer disabled:opacity-50"
        >
          {isBlockPending ? '...' : isBlocked ? 'Unblock' : 'Block'}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant='secondary_inverse'
          type="button"
          onClick={onToggleUnread}
          size='sm'
          className="text-xs font-semibold px-3 py-1.5 border border-border-strong rounded text-text-primary hover:bg-interactive-default transition-colors duration-150 cursor-pointer"
        >
          {isMarkedUnread ? 'Mark as read' : 'Mark as unread'}
        </Button>
      </div>
    </div>
  );
}
