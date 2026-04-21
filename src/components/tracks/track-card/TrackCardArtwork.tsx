'use client';

import Image from 'next/image';
import Link from 'next/link';

type TrackCardArtworkProps = {
  userSlug: string;
  trackId: number;
  routeTrackId?: string;
  coverUrl: string;
  title: string;
  contentHref?: string;
};

export default function TrackCardArtwork({
  userSlug,
  trackId,
  routeTrackId,
  coverUrl,
  title,
  contentHref,
}: TrackCardArtworkProps) {
  const resolvedHref = contentHref ?? `/${userSlug}/${routeTrackId ?? trackId}`;

  return (
    <Link
      href={resolvedHref}
      className="aspect-square w-24 shrink-0 -mt-1 sm:w-28 md:w-36"
    >
      <Image
        src={coverUrl}
        className="h-full w-full rounded object-cover"
        width={400}
        height={400}
        alt={`${title} cover art`}
      />
    </Link>
  );
}
