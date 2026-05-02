/**
 * Public API for the Pro upgrade feature.
 *
 * Import from here rather than deep-linking into sub-folders:
 * @example
 * import { UpgradeModal, useUpgradeModal } from '@/features/pro';
 */

export { UpgradeModal } from './components/UpgradeModal';
export { Upgrade } from './components/Upgrade';
export { UpgradeCard } from './components/UpgradeCard';
export { useUpgradeModal } from '@/features/pro/hooks/useUpgradeModal';
export { useCreateCheckoutSession } from './hooks/useCreateCheckoutSession';
export { useCancelSubscription } from './hooks/useCancelSubscription';
export { useRenewSubscription } from './hooks/useRenewSubscription';
export { useSubscriptionStatus } from './hooks/useSubscriptionStatus';
export type {
  Plan,
  PlanTier,
  PlanFeature,
  FeatureBadge,
} from '@/features/pro/types';
