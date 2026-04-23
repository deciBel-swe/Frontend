/**
 * Subscription plan definitions for the Pro upgrade feature.
 * Centralises all plan data so UpgradeCard stays purely presentational.
 */

import type { Plan } from '@/features/pro/types';

/** Feature badge variants shared across plans */
export type BadgeVariant = 'artist' | 'pro' | 'none';

export const PLANS: Plan[] = [
  // {
  //   id: 'artist',
  //   name: 'Artist',
  //   tier: 'artist',
  //   tagline: 'Tailored access to essential artist tools',
  //   monthlyPrice: 29.99,
  //   yearlyPrice: 359.88,
  //   currency: 'EGP',
  //   ctaLabel: 'Get started',
  //   features: [
  //     { icon: 'upload', label: '3 hours of uploads', badge: null },
  //     {
  //       icon: 'boost',
  //       label: 'Boost tracks and get 100+ listeners',
  //       badge: { text: '2X MONTH', variant: 'artist' },
  //     },
  //     {
  //       icon: 'distrib',
  //       label: 'Distribute & monetize tracks',
  //       badge: { text: '2X MONTH', variant: 'artist' },
  //     },
  //     {
  //       icon: 'replace',s
  //       label: 'Replace tracks without losing stats',
  //       badge: { text: '3X MONTH', variant: 'artist' },
  //     },
  //   ],
  // },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    tagline: 'Unlimited access to all artist tools',
    monthlyPrice: 74.99,
    yearlyPrice: 899.88,
    currency: 'EGP',
    ctaLabel: 'Get started',
    isMostPopular: true,
    features: [
      { icon: 'upload', label: 'Unlimited uploads', badge: null },
      {
        icon: 'boost',
        label: 'Boost tracks and get 100+ listeners',
        badge: { text: 'UNLIMITED', variant: 'pro' },
      },
      {
        icon: 'distrib',
        label: 'Distribute & monetize tracks',
        badge: { text: 'UNLIMITED', variant: 'pro' },
      },
      {
        icon: 'replace',
        label: 'Replace tracks without losing stats',
        badge: { text: 'UNLIMITED', variant: 'pro' },
      },
    ],
    seeAllBenefitsHref: '#',
  },
];
