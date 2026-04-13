'use client';

/**
 * UpgradeModal
 *
 * Accessible modal dialog that wraps the {@link Upgrade} component.
 * Handles:
 *  - focus trap (via dialog element)
 *  - Escape key dismissal
 *  - backdrop click dismissal
 *  - scroll-lock on body while open
 *
 * Triggered from TopNavBar "Upgrade now" button.
 *
 * @example
 * <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} />
 */

import { type FC, useEffect, useRef, useCallback } from 'react';
import { Upgrade } from './Upgrade';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional — handle checkout navigation per plan */
  onSelectPlan?: (planId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const UpgradeModal: FC<UpgradeModalProps> = ({
  open,
  onClose,
  onSelectPlan,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // ── Sync open state with <dialog> native API ───────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ── Escape key & native cancel event ──────────────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // ── Backdrop click ─────────────────────────────────────────────
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose();
    },
    [onClose]
  );

  const handleSelectPlan = useCallback(
    (planId: string) => {
      onSelectPlan?.(planId);
    },
    [onSelectPlan]
  );

  return (
    /**
     * Using native <dialog> for built-in focus trap and top-layer stacking.
     * Tailwind targets the ::backdrop pseudo-element for the dimmed overlay.
     */
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className={[
        // layout — my-auto centres the dialog vertically inside the top-layer
        'w-full max-w-4xl rounded-2xl p-0 overflow-hidden mx-auto my-auto',
        // colours
        'bg-bg-base text-text-primary',
        // remove default browser outline + browser UA margin
        'outline-none',
        // backdrop via Tailwind arbitrary pseudo
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        // animate in
        'open:animate-[fadeScaleIn_200ms_ease-out]',
      ].join(' ')}
      aria-modal="true"
      aria-labelledby="upgrade-heading"
    >
      {/* ── Inner scroll container ──────────────────────────────────── */}
      <div className="relative max-h-[90vh] overflow-y-auto px-6 pt-8 pb-10 sm:px-10">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close upgrade dialog"
          className="absolute top-4 right-4 rounded-full p-1.5 text-text-secondary hover:text-text-primary hover:bg-interactive-hover transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <Upgrade onSelectPlan={handleSelectPlan} onSkip={onClose} />
      </div>
    </dialog>
  );
};

export default UpgradeModal;