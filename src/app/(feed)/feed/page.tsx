'use client';

import TrackCard from '@/components/TrackCard';

export default function Page() {
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
