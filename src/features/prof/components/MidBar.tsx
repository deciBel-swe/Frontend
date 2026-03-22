'use client';
import { useState } from 'react';
import { IconButton } from '@/components/buttons/IconButton';
import {
  ShareIcon,
  EditIcon,
  FollowIcon,
  FollowingIcon,
  MessageIcon,
} from '@/components/icons/GenrealIcons';
import ProfileNav from './ProfileNav';
// import { useUserMe } from '@/features/prof/hooks/useUserMe';
import EditProfileModal from '@/features/prof/components/EditProfileModal';
interface MidBarProps {
  username: string;
}
// import { useGetCountry } from '@/hooks';

const MidBar = ({ username }: MidBarProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  // const [isHydrated, setIsHydrated] = useState(false);
  // const { user: myUser } = useUserMe();
  // const countries = useGetCountry();

  // useEffect(() => {
  //   setIsHydrated(true);
  // }, []);

  //const isOwnProfile = isHydrated && myUser?.username === username;
  // there is problem in it I will just use dummy name for testing
  const isOwnProfile = 'mockuser' === username;
  return (
       <div className="w-full flex flex-col gap-3 mt-2">

      {/* NAV */}
      <ProfileNav username={username} />

      {/* BUTTON ROW */}
      <div className="flex justify-end items-center gap-2 flex-nowrap">

        {!isOwnProfile && (
          <IconButton aria-label="message" className="shrink-0">
            <span className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
              <MessageIcon />
            </span>
          </IconButton>
        )}

        {isOwnProfile && (
          <IconButton
            aria-label="edit"
            className="shrink-0"
            onClick={() => setIsEditOpen(true)}
          >
            <span className="flex items-center gap-1
              bg-gray-300 dark:bg-gray-800 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
              <EditIcon />
              <span className="hidden sm:inline">edit</span>
            </span>
          </IconButton>
        )}

        <IconButton aria-label="share" className="shrink-0">
          <span className="flex items-center gap-1 bg-gray-300 dark:bg-gray-800 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
            <ShareIcon />
            <span className="hidden sm:inline">share</span>
          </span>
        </IconButton>

        {!isOwnProfile && (
          <IconButton
            aria-label={isFollowing ? 'Following' : 'Follow'}
            className="shrink-0"
            onClick={() => setIsFollowing((p) => !p)}
          >
            <span className="flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black rounded-md px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
              {isFollowing ? <FollowingIcon /> : <FollowIcon />}
              <span className="hidden sm:inline">
                {isFollowing ? 'Following' : 'Follow'}
              </span>
            </span>
          </IconButton>
        )}

      </div>

      <EditProfileModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
};

export default MidBar;
