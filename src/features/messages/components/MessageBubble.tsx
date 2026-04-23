'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Message } from '@/components/messages/types';
import MessageList from '@/components/messages/MessageList';
import { formatLocalTime } from '@/utils/formatTime';
import { buildProfileHref } from '@/utils/socialRoutes';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

function parseTextSegments(text: string): string {
  // Remove tokens that are URLs (start with https:// and length > 8)
  return text
    .split(' ')
    .filter((token) => !(token.startsWith('https://') && token.length > 8))
    .join(' ')
    .trim();
}

function getInitials(displayName: string): string {
  return displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function MessageBubble({
  message,
  currentUserId,
}: MessageBubbleProps) {
  const isMine = message.senderId === currentUserId;
  const initials = getInitials(message.sender.displayName);
  const messageTime = formatLocalTime(message.createdAt);

  // Collect text segments (filtering out raw URL tokens that became cards)
  const hasTrackOrPlaylist = message.content.some(
    (c) => c.type === 'track' || c.type === 'playlist'
  );

  const textSegments = message.content
    .filter((c) => c.type === 'text')
    .map((c) => {
      const raw = c.text ?? '';
      return hasTrackOrPlaylist ? parseTextSegments(raw) : raw;
    })
    .filter(Boolean);

  const tracks = message.content.filter((c) => c.type === 'track');
  const playlists = message.content.filter((c) => c.type === 'playlist');

  return (
    <div className="flex gap-3 flex-row mb-4">
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {message.sender.avatarUrl ? (
          <Image
            src={message.sender.avatarUrl}
            alt={message.sender.displayName}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-neutral-300 flex items-center justify-center text-xs font-semibold text-neutral-700">
            {initials}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 w-full items-start overflow-hidden">
        {/* Sender name + time */}
        <div className="flex items-center gap-2 min-w-0">
          {isMine ? (
            <span className="text-xs font-semibold text-text-primary">Me</span>
          ) : (
            <Link
              href={buildProfileHref(message.sender.username)}
              className="text-xs font-semibold text-text-primary hover:text-text-secondary transition-colors"
            >
              {message.sender.displayName}
            </Link>
          )}
          <span className="text-xs text-text-muted shrink-0 whitespace-nowrap">
            {messageTime}
          </span>
        </div>

        {/* Text bubble */}
        {textSegments.map((text, i) => (
          <div key={i} className="text-sm leading-relaxed">
            {text}
          </div>
        ))}

        {/* Track cards */}
        {tracks.map((c, i) =>
          c.track ? (
            <div key={`track-${i}`} className="w-full overflow-hidden">
              <MessageList type="track" track={c.track} />
            </div>
          ) : null
        )}

        {/* Playlist cards */}
        {playlists.map((c, i) =>
          c.playlist ? (
            <div key={`playlist-${i}`} className="w-full overflow-hidden">
              <MessageList
                type="playlist"
                playlistId={c.playlist.playlistId}
                playlist={c.playlist}
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
