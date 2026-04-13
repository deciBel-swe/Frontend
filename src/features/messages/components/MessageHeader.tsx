'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/buttons/Button';
import { userService } from '@/services';
import type { User } from '@/components/messages/types';

function getUserSlug(username: string): string {
  return username.toLowerCase().replace(/[.\s]+/g, '-');
}

interface MessageHeaderProps {
  participant: User;
  isMarkedUnread?: boolean;
  onMarkUnread?: () => void;
}

export default function MessageHeader({
  participant,
  isMarkedUnread,
  onMarkUnread,
}: MessageHeaderProps) {
  const [isBlocked, setIsBlocked] = useState(false); // TODO: Get actual blocked state
  const [isBlockPending, setIsBlockPending] = useState(false);

  const handleBlockToggle = async () => {
    if (!participant.id || isBlockPending) {
      return;
    }

    const userId = typeof participant.id === 'string' ? parseInt(participant.id, 10) : participant.id;
    if (isNaN(userId)) return;

    const previousBlocked = isBlocked;
    const nextBlocked = !previousBlocked;
    setIsBlocked(nextBlocked);
    setIsBlockPending(true);

    try {
      if (nextBlocked) {
        await userService.blockUser(userId);
      } else {
        await userService.unblockUser(userId);
      }
    } catch (error) {
      setIsBlocked(previousBlocked);
      throw error;
    } finally {
      setIsBlockPending(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4 bg-bg-base">
      <div className="flex items-center gap-2">
        <Link
          href={`/${getUserSlug(participant.username)}`}
          className="font-bold text-base text-text-primary hover:text-text-secondary transition-colors"
        >
          {participant.displayName}
        </Link>

        <Button
          type="button"
          onClick={handleBlockToggle}
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
          onClick={onMarkUnread}
          size='sm'
          className="text-xs font-semibold px-3 py-1.5 border border-border-strong rounded text-text-primary hover:bg-interactive-default transition-colors duration-150 cursor-pointer"
        >
          {isMarkedUnread ? 'Mark as read' : 'Mark as unread'}
        </Button>
      </div>
    </div>
  );
}