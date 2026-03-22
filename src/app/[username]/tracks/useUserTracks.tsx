'use client';

import { QueryProvider } from '@/providers/QueryProvider';
import { TrackView } from '@/app/[username]/tracks/TrackView';
import TrackCard from '@/components/TrackCard';
import { useEffect, useState } from 'react';
import { MockTrackService } from '@/services/mocks/trackService';

export default function Page() {
  const service = new MockTrackService();

  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await service.getUserTracks(7);
      setTracks(data);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <QueryProvider>
      <div className="w-full px-8 py-8">
        {/* MAIN */}
        <div className="max-w-4xl mx-auto space-y-4">
          <TrackView trackId="1" />

          {loading && <p>Loading...</p>}

          {!loading &&
            tracks.map((t) => {
              const waveform = JSON.parse(t.waveformData || '[]');

              return (
                <TrackCard
                  key={t.id}
                  user={{
                    name: t.artist.username,
                    avatar: 'https://i.pravatar.cc/100',
                  }}
                  track={{
                    id: t.id,
                    artist: t.artist.username,
                    title: t.title,
                    cover: t.coverUrl,
                    duration: `${Math.floor(t.durationSeconds / 60)}:${(
                      t.durationSeconds % 60
                    )
                      .toString()
                      .padStart(2, '0')}`,
                  }}
                  waveform={waveform}
                />
              );
            })}
        </div>
      </div>
    </QueryProvider>
  );
}