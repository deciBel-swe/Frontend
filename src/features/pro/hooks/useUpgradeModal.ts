import { useState, useCallback } from 'react';

/**
 * useUpgradeModal
 *
 * Encapsulates open/close state for {@link UpgradeModal}.
 * Keeps the consuming component (e.g. TopNavBar) free of local state noise.
 *
 * @example
 * const { upgradeOpen, openUpgrade, closeUpgrade } = useUpgradeModal();
 * <Button onClick={openUpgrade}>Upgrade now</Button>
 * <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} />
 */
export function useUpgradeModal() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const openUpgrade  = useCallback(() => setUpgradeOpen(true),  []);
  const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);

  return { upgradeOpen, openUpgrade, closeUpgrade };
}