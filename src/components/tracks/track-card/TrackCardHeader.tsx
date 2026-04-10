'use client';

import Image from 'next/image';
import Link from 'next/link';

type TrackCardHeaderProps = {
  userSlug: string;
  userDisplayName: string;
  userAvatar: string;
  postedText: string;
};

export default function TrackCardHeader({
  userSlug,
  userDisplayName,
  userAvatar,
  postedText,
}: TrackCardHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
      <Link href={`/${userSlug}`}>
        <Image
          src={userAvatar}
          className="h-8 w-8 rounded-full object-cover"
          width={32}
          height={32}
          alt={userDisplayName}
        />
      </Link>

      <div>
        <span className="font-medium text-text-primary hover:opacity-40">
          <Link href={`/${userSlug}`}>{userDisplayName}</Link>
        </span>{' '}
        {postedText}
      </div>
    </div>
  );
}
