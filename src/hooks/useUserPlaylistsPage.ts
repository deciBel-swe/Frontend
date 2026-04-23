'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlaylistHorizontalProps } from '@/components/playlist/playlist-card/types';
import { mapProfilePlaylistToCard } from '@/features/playlists/mappers/profilePlaylistCardMapper';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { useInfinitePaginatedResource } from '@/hooks/useInfinitePaginatedResource';
import { playlistService, userService } from '@/services';

const normalizeIdentity = (value: string | undefined): string =>
  (value ?? '').trim().toLowerCase();

type UseUserPlaylistsPageParams = {
  username: string;
  page?: number;
  size?: number;
  infinite?: boolean;
};

export function useUserPlaylistsPage({
  username,
  page = 0,
  size = 24,
  infinite = false,
}: UseUserPlaylistsPageParams) {
  const ownerContext = useProfileOwnerContext();
  const [cards, setCards] = useState<PlaylistHorizontalProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const resolvedUserIdRef = useRef<number | undefined>(undefined);

  const routeUsername = username.trim();
  const isOwnedProfile = Boolean(ownerContext?.isOwner);
  const profileUsername =
    ownerContext?.publicUser?.profile.username ||
    ownerContext?.ownerUser?.username ||
    routeUsername;
  const profileAvatar =
    ownerContext?.publicUser?.profile.profilePic ||
    ownerContext?.ownerUser?.profile.profilePic ||
    undefined;

  const resolveUserId = useCallback(async () => {
    if (resolvedUserIdRef.current) {
      return resolvedUserIdRef.current;
    }

    if (typeof ownerContext?.publicUser?.profile.id === 'number') {
      resolvedUserIdRef.current = ownerContext.publicUser.profile.id;
      return resolvedUserIdRef.current;
    }

    if (routeUsername.length === 0) {
      return undefined;
    }

    const publicUser = await userService.getPublicUserByUsername(routeUsername);
    resolvedUserIdRef.current = publicUser.profile.id;
    return resolvedUserIdRef.current;
  }, [ownerContext?.publicUser?.profile.id, routeUsername]);

  useEffect(() => {
    resolvedUserIdRef.current = undefined;
  }, [ownerContext?.publicUser?.profile.id, routeUsername]);

  const fetchPlaylistPage = useCallback(
    async (pageNumber: number, pageSize: number) => {
      const response = isOwnedProfile
        ? await playlistService.getMePlaylists({
            page: pageNumber,
            size: pageSize,
          })
        : await (async () => {
            const resolvedUserId = await resolveUserId();
            if (!resolvedUserId) {
              return {
                content: [],
                pageNumber,
                pageSize,
                totalElements: 0,
                totalPages: 0,
                isLast: true,
              };
            }

            return playlistService.getUserPlaylists(resolvedUserId, {
              page: pageNumber,
              size: pageSize,
            });
          })();

      return {
        items: response.content.map((playlist) =>
          mapProfilePlaylistToCard(playlist, {
            fallbackUsername: profileUsername,
            fallbackAvatar: profileAvatar,
            showEditButton:
              isOwnedProfile &&
              normalizeIdentity(profileUsername) === normalizeIdentity(routeUsername),
          })
        ),
        pageNumber: response.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        isLast: response.isLast,
        last: Boolean(response.isLast),
      };
    },
    [
      isOwnedProfile,
      profileAvatar,
      profileUsername,
      resolveUserId,
      routeUsername,
    ]
  );

  const {
    items: infiniteCards,
    hasMore,
    isPaginating,
    isInitialLoading,
    isError: isInfiniteError,
    sentinelRef,
    loadNextPage,
  } = useInfinitePaginatedResource<PlaylistHorizontalProps>({
    enabled: infinite && routeUsername.length > 0,
    pageSize: size,
    resetKey: [
      routeUsername,
      String(size),
      String(isOwnedProfile),
      String(ownerContext?.publicUser?.profile.id ?? ''),
    ].join('|'),
    fetchPage: fetchPlaylistPage,
    dedupeBy: (card) => String(card.trackId),
    initialErrorMessage: 'Failed to load playlists. Please try again later.',
  });

  useEffect(() => {
    if (infinite) {
      return;
    }

    let isCancelled = false;

    const loadPlaylists = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await fetchPlaylistPage(page, size);

        if (!isCancelled) {
          setCards(response.items);
        }
      } catch {
        if (!isCancelled) {
          setCards([]);
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPlaylists();

    return () => {
      isCancelled = true;
    };
  }, [fetchPlaylistPage, infinite, page, size]);

  return {
    cards: infinite ? infiniteCards : cards,
    isLoading: infinite ? isInitialLoading : isLoading,
    isError: infinite ? isInfiniteError : isError,
    hasMore: infinite ? hasMore : false,
    isPaginating: infinite ? isPaginating : false,
    sentinelRef: infinite ? sentinelRef : undefined,
    loadNextPage: infinite ? loadNextPage : undefined,
  };
}
