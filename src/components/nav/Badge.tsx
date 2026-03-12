import type { FC } from 'react';

/**
 * Badge — absolute-positioned notification count bubble.
 *
 * Renders nothing when `count` is 0. Caps the displayed number at 9,
 * showing "9+" for anything higher. Must be placed inside a
 * `relative`-positioned parent (e.g. `IconButton`).
 *
 * @example
 * <IconButton aria-label="Notifications">
 *   <BellIcon />
 *   <Badge count={3} />
 * </IconButton>
 */
export interface BadgeProps {
  /** Number of unread items. Badge is hidden when 0. */
  count: number;
}

export const Badge: FC<BadgeProps> = ({ count }) =>
  count > 0 ? (
    <span
      className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 bg-text-primary rounded-full text-[9px] font-bold text-bg-base flex items-center justify-center px-0.75 pointer-events-none"
      aria-label={`${count} unread`}
    >
      {count > 9 ? '9+' : count}
    </span>
  ) : null;
