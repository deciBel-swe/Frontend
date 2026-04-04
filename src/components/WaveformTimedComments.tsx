
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export type TimedComment = {
  id: string;
  timestamp: number;
  comment: string;
  user: { name: string; avatar: string };
};

type Props = {
  comments: TimedComment[];
  durationSeconds: number;
  currentUser: { name: string; avatar: string };
  pendingTimestamp: number | null;
  pendingText: string;
  setPendingText: (text: string) => void;
  showCommentInput: boolean;
  onSubmit: (text: string) => void;
  showMarkers: boolean;
};

export default function WaveformTimedComments({
  comments,
  durationSeconds,
  currentUser,
  pendingTimestamp,
  pendingText,
}: Props) {
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [latestCommentId, setLatestCommentId] = useState<string | null>(null);

  // Whenever a new pending comment appears, set it as latest
  useEffect(() => {
    if (pendingTimestamp !== null) {
      setLatestCommentId('pending');
    }
  }, [pendingTimestamp]);

  const getLeftPercent = (timestamp: number) =>
    durationSeconds ? (timestamp / durationSeconds) * 100 : 0;

  const allComments = [
    ...comments,
    ...(pendingTimestamp !== null
      ? [{ id: 'pending', timestamp: pendingTimestamp, comment: pendingText, user: currentUser }]
      : []),
  ];

  return (
    <div className="relative w-full h-0">
      {allComments.map((c) => {
        const isLatest = c.id === latestCommentId;
        const avatarSize = isLatest ? 'w-6 h-6' : 'w-4 h-4'; // shrink old comments
        const avatarBorder = isLatest ? 'border-neutral-0' : 'border-neutral-300';
        return (
          <div
            key={c.id}
            className="absolute bottom-4 pointer-events-auto"
            style={{ left: `${getLeftPercent(c.timestamp)}%`, transform: 'translateX(-50%)' }}
          >
            <div
              className="relative"
              onMouseEnter={() => setHoveredCommentId(c.id)}
              onMouseLeave={() => setHoveredCommentId(null)}
            >
              {/* Avatar */}
              <Image
                src={c.user.avatar}
                alt={`${c.user.name} avatar`}
                className={`${avatarSize} rounded-full object-cover border ${avatarBorder} shadow-sm cursor-pointer`}
                width={isLatest ? 24 : 16}
                height={isLatest ? 24 : 16}
                unoptimized
              />

              {/* Tooltip */}
              {hoveredCommentId === c.id && (
              <div className="absolute bottom-full mb-1 w-max max-w-xs bg-neutral-500 text-text-on-brand text-xs rounded p-1 shadow-lg z-50">
  <span className="font-bold text-neutral-300 mr-1">{c.user.name}</span>
  <span>{c.comment}</span>
</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}