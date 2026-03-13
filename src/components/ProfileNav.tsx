'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'All', href: '/profile' },
  { name: 'Popular tracks', href: '/profile/popular' },
  { name: 'Tracks', href: '/profile/tracks' },
  { name: 'Albums', href: '/profile/albums' },
  { name: 'Playlists', href: '/profile/sets' },
  { name: 'Reposts', href: '/profile/reposts' },
];

export default function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#121212] w-full">
      <div className="flex items-center gap-8 px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative py-4 group"
            >
              {/* Text styling */}
              <span
                className={`text-[15px] font-medium transition-colors duration-200 whitespace-nowrap
            ${isActive ? 'text-white' : 'text-[#999] group-hover:text-white'}`}
              >
                {item.name}
              </span>

              {/* Active underline - shifted down by 2 pixels */}
              {isActive && (
                <div className="absolute -bottom-[4px] left-0 right-0 h-[1px] bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
