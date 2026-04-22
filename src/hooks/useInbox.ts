'use client';

import { useEffect, useState } from 'react';
import { messageService } from '@/services/api/messageService';
import { useAuth } from '@/features/auth/useAuth';

export function useInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = messageService.subscribeToInbox(
      user.id,
      (data) => {
        setConversations(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  return { conversations, isLoading, error };
}
