'use client';

import { useTrendingTracks } from '@/hooks/useTrendingTracks';

export default function TestingPage() {
  const { items, isLoading, isError } = useTrendingTracks({
    genre: undefined,
    limit: 10,
  });

  if (isLoading) {
    return <div className="p-8">Loading trending tracks...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-red-500">Error loading trending tracks</div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Trending Tracks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <img
                src={
                  item.card.track.artist?.avatar ||
                  '/images/default_song_image.png'
                }
                alt="artist"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h2 className="font-semibold text-lg">{item.card.track.title}</h2>
              <p className="text-sm text-gray-600">
                {item.card.track.artist?.displayName ??
                  item.card.track.artist?.username ??
                  'Unknown Artist'}
              </p>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{item.card.track.plays ?? 0} plays</span>
                <span>{item.card.track.likeCount ?? 0} ❤️</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-gray-500">
            No trending tracks available
          </div>
        )}
      </div>
    </div>
  );
}
