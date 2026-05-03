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

/**
 * useChat Hook
 *
 * Real-time chat management for a specific conversation.
 *
 * Features:
 * - Real-time message streaming from Firebase
 * - Automatic resource hydration (fetches track/playlist metadata)
 * - Message composition and sending
 * - Complete lifecycle management (loading, error states)
 *
 * The hook automatically:
 * - Connects to Firebase for real-time updates when conversationId is set
 * - Resolves shared resources (tracks, playlists) referenced in messages
 * - Handles connection cleanup on unmount or ID change
 * - Manages sending state and error handling
 *
 * @param conversationId - The conversation to chat in, or null to disable
 * @returns Object with messages, sending state, and sendMessage function
 *
 * @example
 * const { messages, isLoading, isSending, error, sendMessage } = useChat(conversationId);
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <>
 *     <MessageList messages={messages} />
 *     <MessageInput onSend={(body, resources) => sendMessage(conversationId, body, resources)} />
 *   </>
 * );
 */
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
      const resolvedResourceGroups = await Promise.all(
        rawMessages.map(async (message) => {
          if (message.resources.length > 0) {
            return message.resources;
          }

          const { resources } = await resolveSharedResourcesFromMessage(
            message.content
          );

          return resources.map((resource) => ({
            ...resource,
            track: null,
            playlist: null,
            user: null,
          }));
        })
      );

      const resourcesToFetch = resolvedResourceGroups.flatMap((resources) =>
        resources.filter((resource) => {
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
            username:
              message.sender.username ||
              (message.sender.id === user?.id ? user.username || '' : `user-${message.sender.id}`),
            displayName:
              message.sender.displayName ||
              (message.sender.id === user?.id
                ? user.displayName || user.username || `User ${message.sender.id}`
                : message.sender.username || `User ${message.sender.id}`),
            avatarUrl: message.sender.avatarUrl || undefined,
          },
          content,
          createdAt: message.createdAt,
          isRead: message.isRead,
        };
      }),
    [rawMessages, resourceCache, user?.displayName, user?.id, user?.username]
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

        let recipientId = 0;
        if (targetConversationId.includes('_')) {
          const parts = targetConversationId.split('_');
          const id1 = parseInt(parts[0], 10);
          const id2 = parseInt(parts[1], 10);
          recipientId = id1 === user.id ? id2 : id1;
        }

        await messageService.sendMessage(
          targetConversationId,
          {
            content: body,
            recipientId,
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

  /**
   * Hook return value
   *
   * @property rawMessages - Raw MessageDTO array from Firestore (for debugging)
   * @property messages - Processed messages with resolved resources and sender info
   * @property isLoading - True while connecting to chat stream or loading initial messages
   * @property error - Error object if connection failed
   * @property isSending - True while sending a message
   * @property sendMessage - Send message to current conversation (uses conversationId)
   * @property sendMessageToConversation - Send message to specific conversation
   * @property getOrCreateConversation - Get or create conversation with another user
   * @property markConversationRead - Mark current conversation as read
   * @property markConversationUnread - Mark current conversation as unread
   */
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
