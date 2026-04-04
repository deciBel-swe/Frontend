'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services';
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/hooks/useAPI';
import type { UserPublic } from '@/types/user';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

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
  const profileContext = useProfileOwnerContext();
  const isManagedByContext =
    normalizeUsername(profileContext?.routeUsername) ===
    normalizeUsername(username);

  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);

  useEffect(() => {
    if (isManagedByContext) {
      return;
    }

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
  }, [isManagedByContext, username]);

  /**
   * True if the logged-in user matches the route username.
   * Falls back to response username when available.
   */
  const effectiveProfile = isManagedByContext
    ? (profileContext?.publicUser ?? null)
    : profile;

  const effectiveIsLoading = isManagedByContext
    ? (profileContext?.isPublicLoading ?? false)
    : isLoading;

  const effectiveErrorStatusCode = isManagedByContext
    ? (profileContext?.publicErrorStatusCode ?? null)
    : errorStatusCode;

  const effectiveIsError = isManagedByContext
    ? !!profileContext?.publicError
    : isError;

  const normalizedRouteUsername = username.trim().toLowerCase();
  const normalizedCurrentUsername = user?.username?.trim().toLowerCase() ?? '';
  const normalizedProfileUsername =
    effectiveProfile?.profile.username?.trim().toLowerCase() ?? '';
  const isOwnerById =
    typeof user?.id === 'number' && user.id === effectiveProfile?.profile.id;

  const isOwner =
    isOwnerById ||
    (normalizedCurrentUsername.length > 0 &&
      (normalizedCurrentUsername === normalizedRouteUsername ||
        normalizedCurrentUsername === normalizedProfileUsername));

  return {
    profile: effectiveProfile,
    isOwner,
    isLoading: effectiveIsLoading,
    isError: effectiveIsError,
    errorStatusCode: effectiveErrorStatusCode,
  };
}