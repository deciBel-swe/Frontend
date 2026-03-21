'use client';

import Sidebar from "@/components/sidebar/Sidebar";
import TrackCard from '@/components/TrackCard';

export default function Page() {

  const artists = [
    {
      name: 'Sniper1',
      followers: 409,
      tracks: 3,
      imageUrl: 'https://i1.sndcdn.com/avatars-zj28Y6y0czQz2xk0-XImVzw-t120x120.jpg',
      artistUrl: '/onlysniperone',
    },
    {
      name: 'MARICAS Records',
      followers: 2722,
      tracks: 27,
      imageUrl: 'https://i1.sndcdn.com/avatars-5tLItQI9ASmGj9LN-RyzGLQ-t120x120.jpg',
      artistUrl: '/maricasrecords',
    },
    {
      name: 'Weaver',
      followers: 281,
      tracks: 12,
      imageUrl: 'https://i1.sndcdn.com/avatars-n1qiXiG9ZzOvyUkL-jGvQKA-t120x120.jpg',
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
      image: 'https://i1.sndcdn.com/artworks-Kz8x7HVd0zBzeWlw-peTMnw-t120x120.jpg',
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
  const generateWaveform = (length: number = 120): number[] => {
  return Array.from({ length }, (_, i) => {
    // simple deterministic wave pattern (sine-like)
    return Math.round(
      50 + 30 * Math.sin(i * 0.25) + 10 * Math.sin(i * 0.05)
    );
  });
};
  // 🔥 FEED (multiple TrackCards)
  const tracks = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    user: {
      name: 'Akmal',
      avatar: '/images/default_song_image.png',
    },
    postedText: 'posted a track',
    timeAgo: `${i + 1} hours ago`,
    track: {
      artist: 'Mohamed Ramdan',
      title: `Track ${i + 1} - XOXO`,
      cover: '/images/default_song_image.png',
      duration: '5:07',
    },
    waveform: generateWaveform()
  }));

  return (
    <div className="w-full flex justify-center">

      {/* PAGE CONTAINER */}
      <div className="w-full max-w-[1200px] flex gap-8 px-6 py-6">

        {/* ================= MAIN FEED ================= */}
        <main className="flex-1 flex flex-col gap-6">

          {tracks.map((item) => (
            <TrackCard
              key={item.id}
              user={item.user}
              postedText={item.postedText}
              timeAgo={item.timeAgo}
              track={item.track}
              waveform={item.waveform}
            />
          ))}

        </main>

      </div>

    </div>
  );
}
