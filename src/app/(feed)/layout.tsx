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
    <div className="w-full flex justify-center">
      {/* PAGE CONTAINER */}
      <div className="w-full max-w-[1200px] flex gap-8 py-6">
        {/* ================= MAIN FEED ================= */}
        <main className="flex-1 flex flex-col gap-6">{children}</main>

        {/* ================= SIDEBAR ================= */}
        <div className="hidden lg:block xl:w-[340px] shrink-0 ">
          <Sidebar History_header='Listening history' Artist_header='Artists you should follow' artists={artists} history={history} />
        </div>
      </div>
    </div>
  );
}
