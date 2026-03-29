'use client';
import { useState } from "react";
import { IconButton } from "@/components/buttons/IconButton";
import { FollowIcon, FollowingIcon } from "@/components/icons/GenrealIcons";

const SIZE_CONFIGS = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-2.5 py-1.5 text-sm gap-1.5',
  lg: 'px-3 py-2 text-base gap-2'
};

interface FollowButtonProps {
  size?: keyof typeof SIZE_CONFIGS;
}
export default function FollowButton({ size = 'lg' }: FollowButtonProps) {

const [isFollowing, setIsFollowing] = useState(false);
const buttonBase =
    'flex items-center gap-1 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap ' +
    'transition-all duration-150 shrink-0';

        return (
                <IconButton
                            aria-label={isFollowing ? 'Following' : 'Follow'}
                            onClick={() => setIsFollowing((p) => !p)}
                        >
                            <span
                            className={`${buttonBase} ${SIZE_CONFIGS[size]} ${
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
            );
}