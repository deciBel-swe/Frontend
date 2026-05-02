import UserCard, { UserCardData } from "./components/UserCard";
import EmptyState from "@/features/social/EmptyState";
import InfiniteScrollPagination from '@/components/pagination/InfiniteScrollPagination';

interface UserGridProps {
  users: UserCardData[];
  onFollowToggle?: (userId: string) => void;
  /** Show follow button on each card (for other user's Following/Followers pages) */
  showFollowButton?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  isPaginating?: boolean;
  hasMore?: boolean;
  sentinelRef?: (node: HTMLDivElement | null) => void;
}

/**
 * UserGrid — responsive 6-column grid of UserCards.
 *
 * Breaks to fewer columns on narrower containers.
 * Handles empty state internally.
 */
export default function UserGrid({
  users,
  onFollowToggle,
  showFollowButton = false,
  emptyTitle = "Nobody here yet",
  emptyDescription,
  className = "",
  isPaginating = false,
  hasMore = false,
  sentinelRef,
}: UserGridProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <>
      <style>{`
        .sc-user-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 28px 16px;
        }
        @media (max-width: 1100px) {
          .sc-user-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (max-width: 900px) {
          .sc-user-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 680px) {
          .sc-user-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 480px) {
          .sc-user-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
      <div className={className}>
        <div className="sc-user-grid">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onFollowToggle={onFollowToggle}
              showFollowButton={showFollowButton}
            />
          ))}
        </div>
        <InfiniteScrollPagination
          hasMore={hasMore}
          isPaginating={isPaginating}
          sentinelRef={sentinelRef}
          loader={
            <div className="flex flex-wrap gap-6 pt-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`user-grid-append-${index}`} className="flex flex-col items-center gap-2.5 w-40">
                  <div className="h-35 w-35 rounded-full bg-surface-default animate-pulse" />
                  <div className="h-3 w-24 rounded bg-surface-default animate-pulse" />
                  <div className="h-3 w-18 rounded bg-surface-default animate-pulse" />
                </div>
              ))}
            </div>
          }
        />
      </div>
    </>
  );
}
