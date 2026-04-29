/**
 * Shared types for the Pro upgrade feature.
 */

export type PlanTier = 'pro' | 'free';

export interface FeatureBadge {
  text: string;
  /** Controls badge colour for subscription tiers. */
  variant: 'pro' | 'free';
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
