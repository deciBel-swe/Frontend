import React from 'react';
import { IconButton } from '@/components/buttons/IconButton';
import { ShareIcon, EditIcon } from '@/components/icons/GenrealIcons';
import ProfileNav from './ProfileNav';

interface NavNControlBarProps {
  username: string;
}

const NavNControlBar = ({ username }: NavNControlBarProps) => {
  return (
    <div className="flex flex-row-reverse items-center gap-18 mb-5 mr-10">
      <IconButton aria-label="edit">
        <span className="flex items-center bg-gray-300 rounded-md px-4 py-2 flex-shrink-0 dark:bg-gray-700">
          <EditIcon /> edit
        </span>
      </IconButton>

      <IconButton aria-label="Share">
        <span className="flex items-center bg-gray-300 rounded-md px-4 py-2 flex-shrink-0 dark:bg-gray-700">
          <ShareIcon /> share
        </span>
      </IconButton>
      <ProfileNav username={`${username}`} />
    </div>
  );
};

export default NavNControlBar;
