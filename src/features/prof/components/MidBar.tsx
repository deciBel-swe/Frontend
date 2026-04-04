'use client';
import { useEffect, useState } from 'react';
import {
  ShareIcon,
  EditIcon,
  MessageIcon,
} from '@/components/icons/GenrealIcons';
import ProfileNav from './ProfileNav';
import EditProfileModal from '@/features/prof/components/EditProfileModal';
import { IconButton } from '@/components/buttons/IconButton';
import {
  ProfilePreview,
  ShareModal,
} from '@/features/prof/components/ShareModal';
import FollowButton from '@/components/buttons/FollowButton';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { userService } from '@/services';
import Button from '@/components/buttons/Button';

interface MidBarProps {
  username: string;
}

const MidBar = ({ username }: MidBarProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [isBlockPending, setIsBlockPending] = useState(false);
  const ownerContext = useProfileOwnerContext();

  // shared button classes
const buttonBase =
  'flex items-center gap-1 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap ' +
  'transition-all duration-150 shrink-0 ' +
  'border border-border-strong text-text-secondary hover:text-text-primary ' +
  'bg-transparent hover:bg-interactive-default';

  const isOwnProfile = ownerContext?.isOwner ?? false;
  const isOwnerStateLoading = ownerContext?.isOwnerLoading ?? false;
  const targetProfile = ownerContext?.publicUser?.profile;
  const targetUserId = targetProfile?.id;

  useEffect(() => {
    setIsFollowing(targetProfile?.isFollowed ?? false);
    setIsBlocked(targetProfile?.isBlocked ?? false);
  }, [targetProfile?.id, targetProfile?.isBlocked, targetProfile?.isFollowed]);

  const handleFollowToggle = async (nextFollowing: boolean) => {
    if (!targetUserId || isFollowPending || isBlockPending) {
      return;
    }

    const previousFollowing = isFollowing;
    setIsFollowing(nextFollowing);
    setIsFollowPending(true);

    try {
      const response = nextFollowing
        ? await userService.followUser(targetUserId)
        : await userService.unfollowUser(targetUserId);
      setIsFollowing(response.isFollowing);
      // eslint-disable-next-line no-useless-catch
    } catch(error) {
      setIsFollowing(previousFollowing);
      throw error;
    } finally {
      setIsFollowPending(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!targetUserId || isBlockPending) {
      return;
    }

    const previousBlocked = isBlocked;
    const nextBlocked = !previousBlocked;
    setIsBlocked(nextBlocked);
    setIsBlockPending(true);

    try {
      if (nextBlocked) {
        await userService.blockUser(targetUserId);
      } else {
        await userService.unblockUser(targetUserId);
      }
      // eslint-disable-next-line no-useless-catch
    } catch(error) {
      setIsBlocked(previousBlocked);
      throw error;
    } finally {
      setIsBlockPending(false);
    }
  };

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${username}`
      : '';

  return (
    <div className="w-full flex items-center justify-between mt-3">
      {/* NAV */}
      <ProfileNav username={username} />

      {/* BUTTON ROW */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {/* {!isOwnProfile && !isOwnerStateLoading && (
          <IconButton aria-label="message">
            <span
              className={`${buttonBase} bg-interactive-default dark:bg-interactive-default text-text-muted dark:text-text-secondary`}
            >
              <MessageIcon />
            </span>
          </IconButton>
        )} */}

        {isOwnProfile && (
          <IconButton aria-label="edit" onClick={() => setIsEditOpen(true)}>
            <span
              className={`${buttonBase} bg-bg-subtle text-text-muted dark:text-text-secondary`}
            >
              <EditIcon />
              <span className="hidden sm:inline">edit</span>
            </span>
          </IconButton>
        )}

        <IconButton aria-label="share" onClick={() => setIsShareOpen(true)}>
          <span
            className={`${buttonBase} bg-bg-subtle text-text-muted dark:text-text-secondary`}
          >
            <ShareIcon />
            <span className="hidden sm:inline">share</span>
          </span>
        </IconButton>

        {!isOwnProfile && !isOwnerStateLoading && (
          <>
            <FollowButton
              size='md'
              isFollowing={isFollowing}
              onToggle={handleFollowToggle}
              disabled={isFollowPending || isBlockPending}
            />
            <Button
              size='md'
              variant='secondary'
              aria-label={isBlocked ? 'Unblock' : 'Block'}
              onClick={handleBlockToggle}
              className='min-w-33 font-normal'
            >
              <span>
                <span className="hidden sm:inline">
                  {isBlockPending
                    ? isBlocked
                      ? '...'
                      : '...'
                    : isBlocked
                      ? 'Unblock'
                      : 'Block'}
                </span>
              </span>
            </Button>
          </>
        )}
      </div>

      <EditProfileModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
      <ShareModal
        variant="profile"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profileUrl={profileUrl}
        preview={
          <ProfilePreview
            displayName={username}
            username={username}
            // avatarUrl={myUser?.avatarUrl} // Pass avatar if available in your user hook
          />
        }
      />
    </div>
  );
};

export default MidBar;
