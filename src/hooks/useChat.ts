'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import type {
  MessageDTO,
  UserSummaryDTO,
} from '@/types/message';
import type { UserPublic } from '@/types/user';
import type { Message } from '@/components/messages/types';
import { messageService, playlistService, trackService } from '@/services';
import {
  resolveSharedResourcesFromMessage,
  toMessagePlaylistData,
  toMessageTrackData,
} from '@/utils/messageSharing';

type MessageResourceCache = Record<
  string,
  | { type: 'track'; track: import('@/components/messages/types').TrackData }
  | {
      type: 'playlist';
      playlist: import('@/components/messages/types').PlaylistData;
    }
>;

export function useChat(conversationId: string | null) {
  const { user } = useAuth();
  const [rawMessages, setRawMessages] = useState<MessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(!!conversationId);
  const [error, setError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [resourceCache, setResourceCache] = useState<MessageResourceCache>({});
  const pendingResourceKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!conversationId) {
      setRawMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const unsubscribe = messageService.subscribeToChat(
      conversationId,
      (data) => {
        setRawMessages(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    let isCancelled = false;

    const hydrateResources = async () => {
      const resourcesToFetch = rawMessages.flatMap((message) =>
        message.resources.filter((resource) => {
          const cacheKey = `${resource.resourceType}:${resource.resourceId}`;
          return (
            !resourceCache[cacheKey] &&
            !pendingResourceKeysRef.current.has(cacheKey)
          );
        })
      );

      if (resourcesToFetch.length === 0) {
        return;
      }

      resourcesToFetch.forEach((resource) => {
        pendingResourceKeysRef.current.add(
          `${resource.resourceType}:${resource.resourceId}`
        );
      });

      const hydratedEntries = await Promise.all(
        resourcesToFetch.map(async (resource) => {
          const cacheKey = `${resource.resourceType}:${resource.resourceId}`;

          try {
            if (resource.resourceType === 'TRACK') {
              const track = await trackService.getTrackMetadata(resource.resourceId);
              return {
                cacheKey,
                value: { type: 'track' as const, track: toMessageTrackData(track) },
              };
            }

            const playlist = await playlistService.getPlaylist(resource.resourceId);
            return {
              cacheKey,
              value: {
                type: 'playlist' as const,
                playlist: toMessagePlaylistData(playlist),
              },
            };
          } finally {
            pendingResourceKeysRef.current.delete(cacheKey);
          }
        })
      );

      if (!isCancelled) {
        setResourceCache((previous) => {
          const next = { ...previous };
          hydratedEntries.forEach(({ cacheKey, value }) => {
            next[cacheKey] = value;
          });
          return next;
        });
      }
    };

    void hydrateResources();

    return () => {
      isCancelled = true;
    };
  }, [rawMessages, resourceCache]);

  const messages = useMemo<Message[]>(
    () =>
      rawMessages.map((message) => {
        const content: Message['content'] = [
          { type: 'text', text: message.content },
        ];

        message.resources.forEach((resource) => {
          const cachedResource =
            resourceCache[`${resource.resourceType}:${resource.resourceId}`];

          if (!cachedResource) {
            return;
          }

          if (cachedResource.type === 'track') {
            content.push({ type: 'track', track: cachedResource.track });
            return;
          }

          content.push({ type: 'playlist', playlist: cachedResource.playlist });
        });

        return {
          id: message.messageId,
          senderId: String(message.sender.id),
          sender: {
            id: String(message.sender.id),
            username: message.sender.username,
            displayName: message.sender.displayName || message.sender.username,
            avatarUrl: message.sender.avatarUrl || undefined,
          },
          content,
          createdAt: message.createdAt,
          isRead: message.isRead,
        };
      }),
    [rawMessages, resourceCache]
  );

  const sendMessageToConversation = useCallback(
    async (targetConversationId: string, body: string) => {
      if (!targetConversationId || !user) {
        return;
      }

      setIsSending(true);

      const currentUserSummary: UserSummaryDTO = {
        id: user.id,
        username: user.username || '',
        displayName: user.displayName || '',
        avatarUrl: user.avatarUrl || null,
      };

      try {
        const { resources, unsupportedStations } =
          await resolveSharedResourcesFromMessage(body);

        if (unsupportedStations.length > 0) {
          throw new Error(
            'Stations cannot be shared in messages. Paste a track or playlist link instead.'
          );
        }

        await messageService.sendMessage(
          targetConversationId,
          {
            body,
            resources: resources.length > 0 ? resources : undefined,
          },
          currentUserSummary
        );
      } finally {
        setIsSending(false);
      }
    },
    [user]
  );

  const sendMessage = useCallback(
    async (body: string) => {
      if (!conversationId) {
        return;
      }

      await sendMessageToConversation(conversationId, body);
    },
    [conversationId, sendMessageToConversation]
  );

  const getOrCreateConversation = useCallback(
    async (otherUser: UserPublic | UserSummaryDTO) => {
      if (!user) throw new Error('Must be logged in to start a conversation');
      return messageService.getOrCreateConversation(user as unknown as import('@/types/user').UserMe, otherUser);
    },
    [user]
  );

  const markConversationRead = useCallback(async () => {
    if (!conversationId || !user) {
      return;
    }

    await messageService.markConversationRead(conversationId, user.id);
  }, [conversationId, user]);

  const markConversationUnread = useCallback(async () => {
    if (!conversationId || !user) {
      return;
    }

    await messageService.markConversationUnread(conversationId, user.id);
  }, [conversationId, user]);

  return {
    rawMessages,
    messages,
    isLoading,
    error,
    isSending,
    sendMessage,
    sendMessageToConversation,
    getOrCreateConversation,
    markConversationRead,
    markConversationUnread,
  };
}
