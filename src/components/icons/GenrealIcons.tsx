import type { FC } from 'react';

/**
 * GeneralIcons — SVG icon components for general actions.
 *
 * Exported icons:
 * - ShareIcon
 * - EditIcon
 * - MessageIcon
 */

export const ShareIcon: FC = () => (
  <svg
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
    fill="currentColor"
    style={{ display: 'block', color: '#fff' }}
  >
    <path
      d="M8 .94l3.03 3.03-1.06 1.06-1.22-1.22V10h-1.5V3.81L6.03 5.03 4.97 3.97 8 .94z"
      fill="currentColor"
    />
    <path
      d="M3.25 6v6c0 .69.56 1.25 1.25 1.25h7c.69 0 1.25-.56 1.25-1.25V6h1.5v6a2.75 2.75 0 01-2.75 2.75h-7A2.75 2.75 0 011.75 12V6h1.5z"
      fill="currentColor"
    />
  </svg>
);

export const EditIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
    fill="none"
    style={{ display: 'block', color: '#fff' }}
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M14 6l4 4" />
  </svg>
);

export const FollowIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
    fill="none"
    className="block text-white dark:text-black transition-colors group-hover:text-gray-400"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 18c0-3 2.46-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
    <path d="M17 8v6" />
    <path d="M14 11h6" />
  </svg>
);

export const FollowingIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
    fill="none"
    className="block text-white dark:text-black transition-colors group-hover:text-gray-400"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 18c0-3 2.46-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
    <path d="m14.5 11.5 2.2 2.2 4.8-4.8" />
  </svg>
);

export const MessageIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v6.5A2.75 2.75 0 0 1 17.25 16H9l-4.5 4v-4.11A2.75 2.75 0 0 1 4 13.25v-6.5Z" />
    <path d="M8 9h8" />
    <path d="M8 12h5" />
  </svg>
);
