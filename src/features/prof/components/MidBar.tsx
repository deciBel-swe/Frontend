'use client';
import React, { useEffect, useState } from 'react';
import { IconButton } from '@/components/buttons/IconButton';
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
interface MidBarProps {
  username: string;
}
import { useGetCountry } from '@/hooks';

const MidBar = ({ username }: MidBarProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user: myUser } = useUserMe();
  const countries = useGetCountry();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  //const isOwnProfile = isHydrated && myUser?.username === username;
  // there is problem in it I will just use dummy name for testing
  const isOwnProfile = 'mockuser' === username;
  return (
    <div className="flex flex-row-reverse items-center gap-2 sm:gap-3 md:gap-4 mt-1 mb-1 mr-10">
      {!isOwnProfile && (
        <div className="group relative inline-block">
          <IconButton aria-label="message">
            <span className="flex h-10 items-center justify-center bg-gray-300 rounded-md px-2.5 py-2 flex-shrink-0 dark:bg-gray-700">
              <MessageIcon />
            </span>
          </IconButton>
          <div className="invisible absolute left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1f1f1f] px-3 py-1.5 text-sm text-white opacity-0 shadow-md transition-opacity group-hover:visible group-hover:opacity-100">
            Send a message
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#1f1f1f]"></div>
          </div>
        </div>
      )}
      {isOwnProfile && (
        <IconButton
          aria-label="edit"
          className="w-auto h-auto"
          onClick={() => setIsEditOpen(true)}
        >
          <span className="flex items-center bg-gray-300 rounded-md px-4 py-2 flex-shrink-0 dark:bg-gray-800">
            <EditIcon /> edit
          </span>
        </IconButton>
      )}
      <IconButton aria-label="Share" className="w-auto h-auto">
        <span className="flex items-center bg-gray-300 rounded-md px-4 py-2 flex-shrink-0 dark:bg-gray-800">
          <ShareIcon /> share
        </span>
      </IconButton>
      {!isOwnProfile && (
        <IconButton
          aria-label={isFollowing ? 'Following' : 'Follow'}
          className="group w-auto h-auto"
          onClick={() => {
            setIsFollowing((prev) => !prev);
          }}
        >
          <span
            className="flex items-center text-white dark:text-black bg-black dark:bg-white 
        rounded-md px-4 py-2 flex-shrink-0 group-hover:bg-gray-700 group-hover:text-white transition-colors"
          >
            {isFollowing ? <FollowingIcon /> : <FollowIcon />}{' '}
            {isFollowing ? 'Following' : 'Follow'}
          </span>
        </IconButton>
      )}
      {/* Spacer between buttons and nav */}
      <ProfileNav username={`${username}`} />
      {/* not sure if this is the correct way to call the modal component */}
      <EditProfileModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
};

export default MidBar;
