'use client';

/**
 * TopNavBar — PATCH for Messages Dropdown integration.
 *
 * Add these changes to your existing TopNavBar.tsx:
 *
 * 1. Import MessagesDropdown and the data helpers
 * 2. Add `messagesOpen` state + ref (mirrors the existing `moreMenuOpen` pattern)
 * 3. Replace the plain <MailIcon /> IconButton with the wired version below
 *
 * This file shows only the DIFF — not the full component.
 */

// ─── 1. Add these imports ────────────────────────────────────────────────────

import MessagesDropdown from '@/features/messages/components/MessagesDropdown';
import { getInboxItems } from '@/features/messages/testdata';
// Replace TEST_CONVERSATIONS with a real hook/query in production:
// e.g. const { data: conversations } = useConversations(user?.id);

// ─── 2. Add inside useTopNavBar (or inline in the component) ─────────────────

/*
  const [messagesOpen, setMessagesOpen] = useState(false);
  const messagesMenuRef = useRef<HTMLDivElement>(null);

  // Click-outside to close (same pattern as moreMenuRef)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (messagesMenuRef.current && !messagesMenuRef.current.contains(e.target as Node)) {
        setMessagesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const inboxItems = getInboxItems(TEST_CONVERSATIONS, user?.id ?? '');
*/

// ─── 3. Replace the MailIcon IconButton block in the JSX ─────────────────────

/*
  BEFORE:
  <IconButton href={ROUTES.MESSAGES} aria-label="Messages" ...>
    <MailIcon />
    <Badge count={11} />
    <span className="sr-only">Messages</span>
  </IconButton>

  AFTER:
*/
export function MessagesNavButton({
  inboxItems,
  unreadCount,
  messagesOpen,
  messagesMenuRef,
  toggleMessages,
  closeMessages,
}: {
  inboxItems: ReturnType<typeof getInboxItems>;
  unreadCount: number;
  messagesOpen: boolean;
  messagesMenuRef: React.RefObject<HTMLDivElement>;
  toggleMessages: () => void;
  closeMessages: () => void;
}) {
  // Import MailIcon, Badge, IconButton from their existing paths
  return (
    <div className="relative h-12 flex items-center" ref={messagesMenuRef}>
      {/* Using button instead of link so we can intercept click to open dropdown */}
      <button
        type="button"
        aria-label="Messages"
        aria-expanded={messagesOpen}
        onClick={toggleMessages}
        className="relative h-12 w-10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer"
      >
        {/* <MailIcon /> */}
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-2 right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-white px-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Messages</span>
      </button>

      {messagesOpen && (
        <MessagesDropdown
          items={inboxItems}
          onClose={closeMessages}
        />
      )}
    </div>
  );
}

export default MessagesNavButton;