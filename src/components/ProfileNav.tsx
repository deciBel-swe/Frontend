'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ProfileNavProps {
  username: string;
}

const getNavItems = (username: string) => [
  { name: 'All', href: `/${username}` },
  { name: 'Popular tracks', href: `/${username}/popular-tracks` },
  { name: 'Tracks', href: `/${username}/tracks` },
  { name: 'Albums', href: `/${username}/albums` },
  { name: 'Playlists', href: `/${username}/sets` },
  { name: 'Reposts', href: `/${username}/reposts` },
];

export default function ProfileNav({ username }: ProfileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-[#121212] w-full">
      <div className="flex items-center gap-8">
        {getNavItems(username).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative py-2 group"
            >
              {/* Text */}
              <span
                className={`
                  font-medium whitespace-nowrap transition-colors duration-200
                  text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px]
                  ${
                    isActive
                      ? 'text-black dark:text-white'
                      : 'text-[#999] group-hover:text-black dark:text-[#bbb] dark:group-hover:text-white'
                  }
                `}
              >
                {item.name}
              </span>

              {/* Active underline */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black dark:bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
