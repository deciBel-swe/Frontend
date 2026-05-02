'use client';
import { useEffect, useState } from 'react';

import { IconButton } from '@/components/buttons/IconButton';
import { FollowIcon, FollowingIcon } from '@/components/icons/GenrealIcons';

// const SIZE_CONFIGS = {
//   sm: 'px-2 py-1 text-xs gap-1',
//   md: 'px-2.5 py-1.5 text-sm gap-1.5',
//     lg: 'px-3 py-2 text-base gap-2',
// };

const SIZE_CONFIGS = {
  sm: 'px-2 py-1 text-xs gap-1',      // Small button
  md: 'px-3 py-1.5 text-sm gap-1.5',  // Medium button
  lg: 'px-4 py-2 text-base gap-2',    // Large button
};

interface FollowButtonProps {
  size?: keyof typeof SIZE_CONFIGS;
    isFollowing?: boolean;
    defaultFollowing?: boolean;
    onToggle?: (nextFollowing: boolean) => void | Promise<void>;
    disabled?: boolean;
}

export default function FollowButton({
    size = 'lg',
    isFollowing,
    defaultFollowing = false,
    onToggle,
    disabled = false,
}: FollowButtonProps) {
    const [internalFollowing, setInternalFollowing] = useState(defaultFollowing);
    const [isPending, setIsPending] = useState(false);

    const isControlled = typeof isFollowing === 'boolean';
    const resolvedFollowing = isControlled ? isFollowing : internalFollowing;

    useEffect(() => {
        if (!isControlled) {
            setInternalFollowing(defaultFollowing);
        }
    }, [defaultFollowing, isControlled]);

    // const buttonBase =
    // 'flex items-center min-w-30 justify-center gap-1 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap ' +
    // 'transition-all duration-150 shrink-0';

    // NEW (Fixed)
const buttonBase =
  'flex items-center justify-center whitespace-nowrap transition-all duration-150 shrink-0 rounded-md font-medium';

    const handleClick = async () => {
        if (disabled || isPending) {
            return;
        }

        const nextFollowing = !resolvedFollowing;

        if (!isControlled) {
            setInternalFollowing(nextFollowing);
        }

        if (!onToggle) {
            return;
        }

        setIsPending(true);

        try {
            await onToggle(nextFollowing);
        } catch(error) {
            if (!isControlled) {
                setInternalFollowing((previous) => !previous);
            }
            throw error;
        } finally {
            setIsPending(false);
        }
    };

    return (
        <IconButton
            aria-label={resolvedFollowing ? 'Following' : 'Follow'}
            onClick={handleClick}
        >
            <span
                className={`${buttonBase} ${SIZE_CONFIGS[size]} bg-black text-white dark:bg-white dark:text-black ${
                    disabled || isPending ? 'opacity-60 cursor-not-allowed' : ''
                }`}
            >
                {resolvedFollowing ? <FollowingIcon /> : <FollowIcon />}
                <span className="hidden sm:inline">
                    {resolvedFollowing ? 'Following' : 'Follow'}
                </span>
            </span>
        </IconButton>
    );
}