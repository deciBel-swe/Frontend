/**
 * NavIcons — SVG icon components used throughout the navigation bar.
 *
 * All icons are `aria-hidden="true"` so their parent controls are
 * responsible for providing the accessible label. Import only the icons
 * you need to keep the bundle minimal.
 *
 * Exported icons:
 * - `LogoIcon`        — brand waveform mark
 * - `SearchIcon`      — magnifying glass
 * - `ChevronDownIcon` — animated caret (rotates 180° when `open` is true)
 * - `BellIcon`        — notifications
 * - `MailIcon`        — messages / inbox
 * - `DotsIcon`        — horizontal ellipsis ("more options")
 */

import type { FC } from 'react';

export const LogoIcon: FC = () => (
  <svg
    viewBox="0 0 143 64"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="48"
    height="48"
    fill="currentColor"
  >
    <rect x="4" y="24" width="5" height="24" rx="2.5" />
    <rect x="13" y="17" width="5" height="31" rx="2.5" />
    <rect x="22" y="12" width="5" height="36" rx="2.5" />
    <rect x="31" y="20" width="5" height="26" rx="2.5" />
    <rect x="40" y="15" width="5" height="33" rx="2.5" />
    <path d="M55 42a20 20 0 0 1 17-19.8V8a32 32 0 1 0 0 64h51a16 16 0 0 0 0-32 16.3 16.3 0 0 0-5.7 1A20 20 0 0 0 99 30a20 20 0 0 0-30.4 17A20 20 0 0 0 55 42Z" />
  </svg>
);

export const SearchIcon: FC = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="24"
    height="24"
  >
    <path
      d="M10 2.25a7.75 7.75 0 1 0 4.924 13.735l5.546 5.545 1.06-1.06-5.545-5.546A7.75 7.75 0 0 0 10 2.25ZM3.75 10a6.25 6.25 0 1 1 12.5 0 6.25 6.25 0 0 1-12.5 0Z"
      fill="currentColor"
    />
  </svg>
);

export interface ChevronDownIconProps {
  /**
   * When `true` the chevron rotates 180° to signal an expanded/open state.
   * Defaults to `false`.
   */
  open?: boolean;
}

export const ChevronDownIcon: FC<ChevronDownIconProps> = ({ open = false }) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="14"
    height="14"
    className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
  >
    <path
      d="M20.5303 9.53033L12 18.0607L3.46967 9.53033L4.53033 8.46967L12 15.9393L19.4697 8.46967L20.5303 9.53033Z"
      fill="currentColor"
    />
  </svg>
);

export const BellIcon: FC = () => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
    fill="none"
  >
    <path
      d="M19.681 7h.069v-.875c0-2.111-1.65-3.875-3.75-3.875s-3.75 1.764-3.75 3.875V7h.069a9.39 9.39 0 00-5.68 7.919l-.272 3.533a2.693 2.693 0 01-1.003 1.896c-1.824 1.46-.792 4.402 1.544 4.402h4.357v.043c-.023 2.686 2.056 4.934 4.708 4.957 2.651.022 4.768-2.19 4.791-4.876l.001-.124h4.327c2.336 0 3.368-2.942 1.544-4.402a2.694 2.694 0 01-1.003-1.896l-.272-3.533A9.39 9.39 0 0019.681 7z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MailIcon: FC = () => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="20"
    height="20"
  >
    <path
      d="M2 10C2 7.791 3.791 6 6 6h20c2.209 0 4 1.791 4 4v12c0 2.209-1.791 4-4 4H6c-2.209 0-4-1.791-4-4V10zm4-2.5C4.804 7.5 3.804 8.34 3.558 9.463L16 17.119 28.442 9.463C28.196 8.34 27.196 7.5 26 7.5H6zM3.5 11.188V22c0 1.381 1.119 2.5 2.5 2.5h20c1.381 0 2.5-1.119 2.5-2.5V11.188L16 18.881 3.5 11.188z"
      fill="currentColor"
    />
  </svg>
);

export const DotsIcon: FC = () => (
  <svg
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    width="16"
    height="16"
  >
    <path
      d="M4 8c0-.832-.67-1.5-1.511-1.5C1.67 6.5 1 7.168 1 8s.67 1.5 1.489 1.5C3.33 9.5 4 8.832 4 8zm5.5 0c0-.832-.67-1.5-1.504-1.5C7.17 6.5 6.5 7.168 6.5 8s.67 1.5 1.496 1.5C8.831 9.5 9.5 8.832 9.5 8zM15 8c0-.832-.664-1.5-1.493-1.5C12.664 6.5 12 7.168 12 8s.664 1.5 1.507 1.5C14.336 9.5 15 8.832 15 8z"
      fill="currentColor"
    />
  </svg>
);
