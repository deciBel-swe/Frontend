'use client';

import React from 'react';

interface DropdownProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Dropdown — A reusable dropdown component that renders children with optional header and footer.
 * Used for messages, notifications, etc.
 *
 * @example
 * <Dropdown
 *   header={<h1>Messages</h1>}
 *   footer={<Link href="/messages">View all</Link>}
 * >
 *   <MessageList />
 * </Dropdown>
 */
export default function DropdownPopup({ children, header, footer, className = '' }: DropdownProps) {
  return (
    <div className={`absolute top-[calc(100%+2px)] right-0 w-100 bg-bg-base border border-interactive-default rounded z-300 overflow-hidden animate-drop-in ${className}`}>
      {/* Header */}
      {header && (
        <div className="flex items-center justify-between px-4 py-3 ">
          {header}
        </div>
      )}

      {/* Content */}
      {children}

      {/* Footer */}
      {footer && (
        <div>{footer}</div>
      )}
    </div>
  );
}