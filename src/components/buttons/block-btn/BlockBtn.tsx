'use client';

import React from 'react';
import Button from '@/components/buttons/Button';
import { useBlockBtn } from './useBlockBtn';

interface BlockBtnProps {
  userId?: string;
  initialBlocked?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BlockBtn = ({
  userId,
  initialBlocked = false,
  className,
  size = 'md',
}: BlockBtnProps) => {
  const { isBlocked, isBlockPending, toggleBlock } = useBlockBtn({
    userId,
    initialBlocked,
  });

  return (
    <Button
      size={size}
      variant="secondary"
      aria-label={isBlocked ? 'Unblock' : 'Block'}
      onClick={toggleBlock}
      disabled={isBlockPending}
      className={className ?? 'min-w-33 font-normal'}
    >
      <span className="hidden sm:inline">
        {isBlockPending
          ? '...'
          : isBlocked
          ? 'Unblock'
          : 'Block'}
      </span>
    </Button>
  );
};

export default BlockBtn;