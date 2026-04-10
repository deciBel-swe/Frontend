// components/TimeAgo.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';

type TimeAgoProps = {
  date: string | null | undefined; // backend uploadDate
  className?: string;
};

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export default function TimeAgo({ date, className }: TimeAgoProps) {
  const parsedDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }, [date]);

  const [text, setText] = useState(() => {
    if (!parsedDate) return '';
    return formatTimeAgo(parsedDate);
  });

  useEffect(() => {
    if (!parsedDate) return;

    setText(formatTimeAgo(parsedDate));

    const interval = setInterval(() => {
      setText(formatTimeAgo(parsedDate));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [parsedDate]);

  if (!parsedDate) return null;

  return <span className={className}>{text}</span>;
}