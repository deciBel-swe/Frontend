import type { FC } from 'react';

/**
 * GeneralIcons — SVG icon components for general actions.
 *
 * Exported icons:
 * - ShareIcon
 * - EditIcon
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
