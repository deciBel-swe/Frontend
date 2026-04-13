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
  onCancel: () => void;
  onRenew:  () => void;
  /** Disables both buttons while an async operation is in-flight */
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SubscriptionActions: FC<SubscriptionActionsProps> = ({
  onCancel,
  onRenew,
  isLoading = false,
}) => (
  <div className="flex items-center gap-3">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isLoading}
      onClick={onCancel}
    >
      Cancel subscription
    </Button>

    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isLoading}
      onClick={onRenew}
    >
      Renew subscription
    </Button>
  </div>
);

export default SubscriptionActions;