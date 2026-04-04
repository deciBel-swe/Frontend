'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/features/auth';

export default function Page() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user?.username) {
      router.replace(`/${encodeURIComponent(user.username)}`);
      return;
    }

    router.replace('/signin');
  }, [isLoading, router, user?.username]);

  return null;
}
