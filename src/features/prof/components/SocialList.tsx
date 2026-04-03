/**
 * SocialList — renders a list of social links with icon and text.
 *
 * Props:
 * - items: Array<{ icon: React.ElementType, label: string, url: string }>
 *
 * Each item renders the icon on the left, label on the right, and links to the url in a new tab.
 */

import type { FC } from 'react';
import React from 'react';
import {
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  YouTubeIcon,
  WebsiteIcon,
} from '../../../components/icons/SocialIcons';

import type { UserPublic } from '@/types/user';

const iconMap: Record<string, React.ElementType> = {
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
};

export interface SocialListProps {
  items?: UserPublic['profile']['socialLinksDto'][number];
}

export const SocialList: FC<SocialListProps> = ({ items }) => (
  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
    {Object.entries(items ?? {}).map(([label, url], idx) => {
      if (!url) {
        return null;
      }

      const key = label.toLowerCase();
      const Icon = iconMap[key] || WebsiteIcon;
      return (
        <li
          key={idx}
          style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Icon className="mr-2" />
            <span className="ml-2"> {label}</span>
          </a>
        </li>
      );
    })}
  </ul>
);
