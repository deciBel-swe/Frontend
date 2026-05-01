'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, userService } from '@/services';
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/hooks/useAPI';
import type { UserMe, UserPublic } from '@/types/user';

type ProfileOwnerContextValue = {
  routeUsername: string;
  publicUser: UserPublic | null;
  isPublicLoading: boolean;
  publicError: string | null;
  publicErrorStatusCode: number | null;
  isOwner: boolean;
  ownerUser: UserMe | null;
  isOwnerLoading: boolean;
  ownerError: string | null;
};

const ProfileOwnerContext = createContext<ProfileOwnerContextValue | undefined>(
  undefined
);

const normalizeUsername = (value: string | undefined): string =>
  decodeURIComponent(value ?? '').trim().toLowerCase();

export const ProfileOwnerProvider = ({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) => {
  // Hijack system verification routes to prevent profile data fetching
  const normalizedUsername = username.toLowerCase().trim();
  if (normalizedUsername === 'verify-email-change' || normalizedUsername === 'verify-email') {
    return <>{children}</>;
  }

  const { user, isLoading: isAuthLoading } = useAuth();
  const [publicUser, setPublicUser] = useState<UserPublic | null>(null);
  const [isPublicLoading, setIsPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [publicErrorStatusCode, setPublicErrorStatusCode] = useState<number | null>(null);
  const [ownerUser, setOwnerUser] = useState<UserMe | null>(null);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  const isOwner =
    !isAuthLoading &&
    normalizeUsername(user?.username) === normalizeUsername(username);

  useEffect(() => {
    let isCancelled = false;
    const normalizedUsername = username.trim();

    const loadPublicUser = async () => {
      if (normalizedUsername.length === 0) {
        setPublicUser(null);
        setPublicError(null);
        setPublicErrorStatusCode(null);
        setIsPublicLoading(false);
        return;
      }

      setIsPublicLoading(true);
      setPublicError(null);
      setPublicErrorStatusCode(null);

      try {
        const data = await userService.getPublicUserByUsername(normalizedUsername);
        if (!isCancelled) {
          setPublicUser(data);
        }
      } catch (error) {
        if (!isCancelled) {
          const normalizedError = normalizeApiError(error);
          setPublicUser(null);
          setPublicError('Failed to fetch user');
          setPublicErrorStatusCode(normalizedError.statusCode);
        }
      } finally {
        if (!isCancelled) {
          setIsPublicLoading(false);
        }
      }
    };

    void loadPublicUser();

    return () => {
      isCancelled = true;
    };
  }, [username]);

  useEffect(() => {
    let isCancelled = false;

    const loadOwnerUser = async () => {
      if (isAuthLoading) {
        setIsOwnerLoading(true);
        setOwnerError(null);
        return;
      }

      if (!isOwner) {
        setOwnerUser(null);
        setOwnerError(null);
        setIsOwnerLoading(false);
        return;
      }

      setIsOwnerLoading(true);
      setOwnerError(null);

      try {
        const session = await authService.getSession();
        if (!session?.accessToken) {
          if (!isCancelled) {
            setOwnerUser(null);
          }
          return;
        }

        const me = await userService.getUserMe();
        if (!isCancelled) {
          setOwnerUser(me ?? null);
        }
      } catch {
        if (!isCancelled) {
          setOwnerError('Failed to fetch current user data');
        }
      } finally {
        if (!isCancelled) {
          setIsOwnerLoading(false);
        }
      }
    };

    void loadOwnerUser();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, isOwner]);

  const value = useMemo<ProfileOwnerContextValue>(
    () => ({
      routeUsername: username,
      publicUser,
      isPublicLoading,
      publicError,
      publicErrorStatusCode,
      isOwner,
      ownerUser,
      isOwnerLoading,
      ownerError,
    }),
    [
      isOwner,
      isPublicLoading,
      ownerError,
      ownerUser,
      publicError,
      publicErrorStatusCode,
      publicUser,
      isOwnerLoading,
      username,
    ]
  );

  return (
    <ProfileOwnerContext.Provider value={value}>
      {children}
    </ProfileOwnerContext.Provider>
  );
};

export const useProfileOwnerContext = (): ProfileOwnerContextValue | undefined =>
  useContext(ProfileOwnerContext);
