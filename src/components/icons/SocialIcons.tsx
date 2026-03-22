/**
 * SocialIcons — SVG icon components for social media links.
 *
 * All icons are `aria-hidden="true"` so their parent controls are
 * responsible for providing the accessible label. Import only the icons
 * you need to keep the bundle minimal.
 *
 * Exported icons:
 * - InstagramIcon
 * - TwitterIcon
 * - FacebookIcon
 * - YouTubeIcon
 * - WebsiteIcon
 * - FollowIcon
 * - FollowingIcon
 */

import type { FC } from 'react';

const socialIconClass = 'block h-5 w-5 text-[#888]';

export const InstagramIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={socialIconClass}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <rect x="3" y="3" width="18" height="18" rx="4.5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const TwitterIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={socialIconClass}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M22 5.92a8.13 8.13 0 0 1-2.36.65A4.13 4.13 0 0 0 21.4 4.1a8.19 8.19 0 0 1-2.6.99A4.11 4.11 0 0 0 12 8.13c0 .32.04.63.1.93A11.66 11.66 0 0 1 3 4.89a4.11 4.11 0 0 0 1.27 5.48A4.07 4.07 0 0 1 2.8 9.7v.05a4.11 4.11 0 0 0 3.29 4.03c-.3.08-.62.12-.95.12-.23 0-.45-.02-.67-.06a4.12 4.12 0 0 0 3.84 2.85A8.24 8.24 0 0 1 2 19.54a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.7-6.26 11.7-11.7 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22 5.92Z" />
  </svg>
);

export const FacebookIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={socialIconClass}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M15 8h-2a1 1 0 0 0-1 1v2h3v2h-3v6h-2v-6H8v-2h2V9a3 3 0 0 1 3-3h2v2Z" />
  </svg>
);

export const YouTubeIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={socialIconClass}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <rect x="3" y="7" width="18" height="10" rx="4" />
    <polygon points="11,10 16,12 11,14" />
  </svg>
);

export const WebsiteIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={socialIconClass}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="12" cy="12" r="10" />
    <ellipse cx="12" cy="12" rx="10" ry="4.5" />
    <ellipse cx="12" cy="12" rx="4.5" ry="10" />
    <path d="M2 12h20" />
    <path d="M12 2c2.5 2.5 2.5 17.5 0 20" />
    <path d="M12 2c-2.5 2.5-2.5 17.5 0 20" />
  </svg>
);
