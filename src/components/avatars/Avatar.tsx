import Image from 'next/image';
import type { FC } from 'react';

/**
 * Avatar — circular user profile image with an initials fallback.
 *
 * Renders a `next/image` when `src` is provided; otherwise displays the
 * first two initials of the user's display name on a neutral background.
 *
 * @example
 * <Avatar src="/me.jpg" alt="Ahmed" initials="AH" />
 * <Avatar alt="Ahmed" initials="AH" size={32} />
 */
export interface AvatarProps {
  /** URL of the profile image. Falls back to `initials` when omitted. */
  src?: string;
  /** Alt text for the image — always required for accessibility. */
  alt: string;
  /** Up to 2 uppercase characters shown when no image is available. */
  initials: string;
  /** Diameter of the circle in pixels. Defaults to 26. */
  size?: number;
}

export const Avatar: FC<AvatarProps> = ({ src, alt, initials, size = 26 }) => (
  <div
    style={{ width: size, height: size }}
    className="rounded-full bg-neutral-700 border border-white/15 flex items-center justify-center text-[10px] font-bold text-text-primary overflow-hidden shrink-0"
  >
    {src ? (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-cover"
      />
    ) : (
      initials
    )}
  </div>
);
