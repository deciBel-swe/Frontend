'use client';

/**
 * SubscriptionActions
 *
 * Renders Cancel and Renew subscription buttons for use on the
 * account Settings page (or any settings panel).
 *
 * Both actions are fire-and-forget callbacks so the parent owns
 * any async logic, loading state, and confirmation dialogs.
 *
 * @example
 * <SubscriptionActions
 *   onCancel={() => cancelSubscription()}
 *   onRenew={() => renewSubscription()}
 *   isLoading={isPending}
 * />
 */

import type { FC } from 'react';
import { Button } from '@/components/buttons/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionActionsProps {
  onCancel?: () => void;
  onRenew?: () => void;
  secondaryLabel?: string;
  showCancelAction?: boolean;
  showSecondaryAction?: boolean;
  /** Disables both buttons while an async operation is in-flight */
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SubscriptionActions: FC<SubscriptionActionsProps> = ({
  onCancel,
  onRenew,
  secondaryLabel = 'Renew subscription',
  showCancelAction = true,
  showSecondaryAction = true,
  isLoading = false,
}) => (
  <div className="flex w-full items-center gap-3">
    {showCancelAction && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={onCancel}
      >
        Cancel subscription
      </Button>
    )}

    {showSecondaryAction && (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={showCancelAction ? '' : 'ml-auto'}
        disabled={isLoading}
        onClick={onRenew}
      >
        {secondaryLabel}
      </Button>
    )}
  </div>
);

export default SubscriptionActions;
