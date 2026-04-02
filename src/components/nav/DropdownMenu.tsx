import Link from 'next/link';
import type { FC, ReactNode } from 'react';

/**
 * DropdownMenu — generic absolutely-positioned menu panel.
 *
 * @example
 * <div className="relative">
 *   <button onClick={toggle}>Open</button>
 *   {open && (
 *     <DropdownMenu
 *       header={<span>Ahmed</span>}
 *       items={[{ label: 'Profile', href: '/ahmed', icon: <UserIcon /> }, null, { label: 'Sign out', href: '/logout' }]}
 *       onClose={close}
 *     />
 *   )}
 * </div>
 */

export interface DropdownMenuItem {
  label: string;
  href: string;
  /** Optional icon rendered to the left of the label. Should be 16×16. */
  icon?: ReactNode;
  onClick?: () => void;
}

export interface DropdownMenuProps {
  /** Menu items — pass `null` to render a divider. */
  items: Array<DropdownMenuItem | null>;
  /** Optional content rendered above the first item (e.g. user info). */
  onClose?: () => void;
}

export const DropdownMenu: FC<DropdownMenuProps> = ({ items, onClose }) => (
  <div
    className="text-text-primary absolute top-[calc(100%+2px)] right-0 min-w-47.5 bg-bg-base border border-interactive-default rounded shadow-[0_8px_24px_rgba(0,0,0,0.55)] z-300 overflow-hidden animate-drop-in"
    role="menu"
  >
    {items.map((item, i) =>
      item === null ? (
        <div key={i} className="h-px bg-interactive-default my-0.5" />
      ) : (
        <Link
          key={item.label}
          href={item.href}
          role="menuitem"
          onClick={(e) => {
          if (item.onClick) item.onClick(); // call the custom onClick
          if (onClose) onClose();           // close the dropdown
          }}
          className="flex items-center gap-2.5 w-full px-3.5 py-3 font-extrabold no-underline text-[13px] text-text-primary hover:text-text-secondary/80 transition-colors duration-150 cursor-pointer"
        >
          {item.icon && (
            <span className="shrink-0 w-4 h-4 flex items-center justify-center">
              {item.icon}
            </span>
          )}
          {item.label}
        </Link>
      )
    )}
  </div>
);
