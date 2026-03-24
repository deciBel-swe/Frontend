'use client';
import { useState } from 'react';
import {
  ShareIcon,
  EditIcon,
  FollowIcon,
  FollowingIcon,
  MessageIcon,
} from '@/components/icons/GenrealIcons';
import ProfileNav from './ProfileNav';
import { useUserMe } from '@/features/prof/hooks/useUserMe';
import EditProfileModal from '@/features/prof/components/EditProfileModal';
import { IconButton } from '@/components/buttons/IconButton';

interface MidBarProps {
  username: string;
}

const MidBar = ({ username }: MidBarProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  // const [isHydrated, setIsHydrated] = useState(false);
  const { user: myUser } = useUserMe();
  // const countries = useGetCountry();

  // shared button classes
  const buttonBase =
    'flex items-center gap-1 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap ' +
    'transition-all duration-150 shrink-0';

  //const isOwnProfile = isHydrated && myUser?.username === username;
  // there is problem in it I will just use dummy name for testing
  const isOwnProfile = myUser?.username === username;
  return (
    <div className="w-full flex items-center justify-between mt-3">
      {/* NAV */}
      <ProfileNav username={username} />

      {/* BUTTON ROW */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">

        {!isOwnProfile && (
          <IconButton aria-label="message">
            <span className={`${buttonBase} bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300`}>
              <MessageIcon />
            </span>
          </IconButton>
        )}

        {isOwnProfile && (
          <IconButton aria-label="edit" onClick={() => setIsEditOpen(true)}>
            <span className={`${buttonBase} bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
              <EditIcon />
              <span className="hidden sm:inline">edit</span>
            </span>
          </IconButton>
        )}

        <IconButton aria-label="share">
          <span className={`${buttonBase} bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
            <ShareIcon /> {/* inherits text-gray-500 */}
            <span className="hidden sm:inline">share</span>
          </span>
        </IconButton>

        {!isOwnProfile && (
          <IconButton
            aria-label={isFollowing ? 'Following' : 'Follow'}
            onClick={() => setIsFollowing((p) => !p)}
          >
            <span
              className={`${buttonBase} ${
                isFollowing
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-black text-white dark:bg-white dark:text-black'
              }`}
            >
              {isFollowing ? <FollowingIcon /> : <FollowIcon />}
              <span className="hidden sm:inline">
                {isFollowing ? 'Following' : 'Follow'}
              </span>
            </span>
          </IconButton>
        )}
      </div>

      <EditProfileModal open={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};

export default MidBar;