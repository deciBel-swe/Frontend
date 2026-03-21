import type { FC } from 'react';

export const CopyIcon: FC = () => (
    <svg
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        width="16"
        height="16"
        fill="none"
    >
    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M3 11H2.5A1.5 1.5 0 0 1 1 9.5v-7A1.5 1.5 0 0 1 2.5 1h7A1.5 1.5 0 0 1 11 2.5V3"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const ShareIcon: FC = () => (
    <svg
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        width="14"
        height="14"
        fill="none"
    >
        <path d="M8 1v8M5 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 10v3.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/**
 * Check icon — simple checkmark.
 * Used to confirm copy/save actions.
 */
export const CheckIcon: FC = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 8l4 4 8-8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
