import React from "react";
import UserCard, { UserCardData } from "./UserCard";
import EmptyState from "@/components/ui/social/EmptyState";

interface UserGridProps {
  users: UserCardData[];
  onFollowToggle?: (userId: string) => void;
  /** Show follow button on each card (for other user's Following/Followers pages) */
  showFollowButton?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
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
      <div className={`sc-user-grid ${className}`}>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onFollowToggle={onFollowToggle}
            showFollowButton={showFollowButton}
          />
        ))}
      </div>
    </>
  );
}