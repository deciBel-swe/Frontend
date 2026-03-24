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
const iconSvgClass = "w-5 h-5 fill-white";

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

export const EmailIcon: FC = () => (
  <svg viewBox="0 0 24 24" className={iconSvgClass} aria-hidden="true">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

export const TumblrIcon: FC = () => (
  <svg viewBox="0 0 24 24" className={iconSvgClass} aria-hidden="true">
    <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.304 1.406z" />
  </svg>
);

export const PinterestIcon: FC = () => (
  <svg viewBox="0 0 24 24" className={iconSvgClass} aria-hidden="true">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.718-.359-1.782c0-1.667.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.771-2.249 3.771-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.62 0 12-5.373 12-12S18.637 0 12.017 0z" />
  </svg>
);

// ─── 2. SOLID WHITE VERSIONS for profile ───────────────────────────────────────────

export const TwitterIconSolid: FC = () => (
  <svg viewBox="0 0 24 24" className={iconSvgClass} aria-hidden="true">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84a4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

export const FacebookIconSolid: FC = () => (
  <svg viewBox="0 0 24 24" className={iconSvgClass} aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const SOCIAL_PLATFORMS = [
  {
    id: 'twitter',
    label: 'Twitter / X',
    bg: '#1DA1F2',
    icon: <TwitterIconSolid />,
    href: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    bg: '#1877F2',
    icon: <FacebookIconSolid />,
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'email',
    label: 'Email',
    bg: '#6B7280',
    icon: <EmailIcon />,
    href: (url: string) => `mailto:?subject=Check this out&body=${encodeURIComponent(url)}`,
  },
  {
    id: 'tumblr',
    label: 'Tumblr',
    bg: '#35465C',
    icon: <TumblrIcon />,
    href: (url: string) => `https://www.tumblr.com/share/link?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    bg: '#E60023',
    icon: <PinterestIcon />,
    href: (url: string) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
  },
];

// ─── Reusable Component ───────────────────────────────────────────────────────

export function SocialShareButtons({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {SOCIAL_PLATFORMS.map(({ id, label, bg, icon, href }) => (
        <a
          key={id}
          href={href(url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          title={label}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 shrink-0"
          style={{ backgroundColor: bg }}
        >
          {icon}
        </a>
      ))}
    </div>
  );
}