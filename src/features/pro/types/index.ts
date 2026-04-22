/**
 * Shared types for the Pro upgrade feature.
 */

export type PlanTier = 'artist' | 'pro' | 'free' | 'none';

export interface FeatureBadge {
  text: string;
  /** Controls badge colour: purple for artist, gold for pro */
  variant: 'artist' | 'pro' | 'free' | 'none';
}

export interface PlanFeature {
  /** Icon key mapped in FeatureIcon component */
  icon: 'upload' | 'boost' | 'distrib' | 'replace';
  label: string;
  badge: FeatureBadge | null;
}

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  ctaLabel: string;
  features: PlanFeature[];
  isMostPopular?: boolean;
  seeAllBenefitsHref?: string;
}
