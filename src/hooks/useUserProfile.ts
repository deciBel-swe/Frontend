'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services';
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/hooks/useAPI';
import type { UserPublic } from '@/types/user';

/**
 * useUserProfile
 *
 * Fetches the public profile for a given username and determines
 * whether the currently authenticated user is the profile owner.
 *
 * @param username - The username from the route params
 *
 * @example
 * const { profile, isOwner, isLoading, isError, errorStatusCode } = useUserProfile('mockartist');
 */
export function useUserProfile(username: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchProfile = async () => {
      setIsLoading(true);
      setIsError(false);
      setErrorStatusCode(null);

      try {
        const data = await userService.getPublicUserByUsername(username);
        if (!isCancelled) {
          setProfile(data);
        }
      } catch (error) {
        if (!isCancelled) {
          const normalizedError = normalizeApiError(error);
          setIsError(true);
          setErrorStatusCode(normalizedError.statusCode);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isCancelled = true;
    };
  }, [username]);

  /**
   * True if the logged-in user is the profile owner.
   * Used to decide between OwnerView and VisitorView,
   * and to gate private profile visibility.
   */
  const isOwner =
    !!user && !!profile && user.username === profile.profile.username;

  return { profile, isOwner, isLoading, isError, errorStatusCode };
}