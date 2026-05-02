'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services';

interface UseBlockBtnParams {
  userId?: string;
  initialBlocked?: boolean;
}

export const useBlockBtn = ({
  userId,
  initialBlocked = false,
}: UseBlockBtnParams) => {
  const [isBlocked, setIsBlocked] = useState(initialBlocked);
  const [isBlockPending, setIsBlockPending] = useState(false);

  // sync with server state
  useEffect(() => {
    setIsBlocked(initialBlocked);
  }, [initialBlocked, userId]);

  const toggleBlock = async () => {
    if (!userId || isBlockPending) return;

    const previous = isBlocked;
    const next = !previous;

    setIsBlocked(next);
    setIsBlockPending(true);

    // TODO: wrong but I cannot fix
    const newUserId = Number(userId);
    try {
      if (next) {
        await userService.blockUser(newUserId);
      } else {
        await userService.unblockUser(newUserId);
      }
    } catch (error) {
      setIsBlocked(previous);
      throw error;
    } finally {
      setIsBlockPending(false);
    }
  };

  return {
    isBlocked,
    isBlockPending,
    toggleBlock,
  };
};