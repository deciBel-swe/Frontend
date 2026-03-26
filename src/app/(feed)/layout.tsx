import type { ReactNode } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';

const artists = [
  {
    name: 'Sniper1',
    followers: 409,
    tracks: 3,
    imageUrl:
      'https://i1.sndcdn.com/avatars-zj28Y6y0czQz2xk0-XImVzw-t120x120.jpg',
    artistUrl: '/onlysniperone',
  },
  {
    name: 'MARICAS Records',
    followers: 2722,
    tracks: 27,
    imageUrl:
      'https://i1.sndcdn.com/avatars-5tLItQI9ASmGj9LN-RyzGLQ-t120x120.jpg',
    artistUrl: '/maricasrecords',
  },
  {
    name: 'Weaver',
    followers: 281,
    tracks: 12,
    imageUrl:
      'https://i1.sndcdn.com/avatars-n1qiXiG9ZzOvyUkL-jGvQKA-t120x120.jpg',
    artistUrl: '/weaveragency',
  },
];

const history = [
  {
    image: 'https://i1.sndcdn.com/artworks-000223014649-ofuim8-t120x120.jpg',
    artist: 'Travis Scott',
    title: 'A Man',
    stats: {
      plays: '63.3M',
      likes: '933K',
      reposts: '66.4K',
      comments: '6,484',
    },
  },
  {
    image:
      'https://i1.sndcdn.com/artworks-Kz8x7HVd0zBzeWlw-peTMnw-t120x120.jpg',
    artist: 'sa',
    title: 'playlist',
    stats: {
      plays: '874K',
      likes: '13.1K',
      reposts: '45',
      comments: '32',
    },
  },
];

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  // return <>{children}</>;
  return (
   <div className="w-full">
  <div className="flex w-full gap-6">
    {/* MAIN */}
  <div className="flex-1 min-w-0 flex flex-col pt-6">
    {children}
  </div>
  {/* SIDEBAR */}
  <aside className="hidden lg:block w-[340px] flex-shrink-0 flex flex-col pt-6">
    <Sidebar
      History_header="Listening history"
      Artist_header="Artists you should follow"
      artists={artists}
      history={history}
    />
    </aside>
  </div>
    </div>
  );
}
