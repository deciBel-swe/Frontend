// 'use client';

// import { TrackView } from '@/app/[username]/tracks/TrackView';
// import { useUserTracks } from '@/hooks/useUserTracks';
// import { QueryProvider } from '@/providers/QueryProvider';
// function UserTracksHookTest() {
//   const { tracks, isLoading, isError } = useUserTracks(7);

//   return (
//     <div className="mt-6 rounded border border-dashed border-neutral-300 p-3 text-sm text-neutral-700">
//       {isLoading ? 'Loading user tracks...' : null}
//       {isError ? 'Failed to load user tracks.' : null}
//       {!isLoading && !isError ? (
//         <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs">
//           {JSON.stringify(tracks, null, 2)}
//         </pre>
//       ) : null}
//     </div>
//   );
// }

// export default function Page() {
//   return (
//     <QueryProvider>
//       <div className="px-8 py-8 max-w-3xl">
//         <TrackView trackId="1" />
//         <UserTracksHookTest />
//       </div>
//     </QueryProvider>
//   );
// }
'use client';
// <<<<<<< HEAD

// import { useEffect, useState } from 'react';
// import { QueryProvider } from '@/providers/QueryProvider';
// import { TrackView } from '@/app/[username]/tracks/TrackView';
// import TrackCard from '@/components/TrackCard';
// import { MockTrackService } from '@/services/mocks/trackService';

// export function page() {
//   const service = new MockTrackService();

//   const [tracks, setTracks] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       const data = await service.getUserTracks(7);
//       setTracks(data);
//       setLoading(false);
//     }

//     load();
//   }, []);

//   const waveform = Array.from({ length: 60 }, () => Math.random());

//   return (
//     <QueryProvider>
//       <div className="flex gap-6 py-8">
//         {/* MAIN FEED */}
//         <div className="flex-1 space-y-4">
//           <TrackView trackId="101" />

//           {loading && <p>Loading tracks...</p>}

//           {!loading &&
//             tracks.map((track) => (
//               <TrackCard
//                 key={track.id}
//                 user={{
//                   name: track.artist.username,
//                   avatar: 'https://i.pravatar.cc/100',
//                 }}
//                 postedText="posted a track"
//                 timeAgo="now"
//                 track={{
//                   artist: track.artist.username,
//                   title: track.title,
//                   cover: track.coverUrl,
//                   duration: `${Math.floor(track.durationSeconds / 60)}:${(
//                     track.durationSeconds % 60
//                   )
//                     .toString()
//                     .padStart(2, '0')}`,
//                 }}
//                 waveform={waveform}
//               />
//             ))}
//         </div>

//         {/* SIDEBAR */}
        
//       </div>
//     </QueryProvider>
//   );
// }

// export default page
// =======
import { Suspense } from 'react';
import { TrackView } from '@/app/[username]/tracks/TrackView';
import TrackList from '@/components/TrackList';
import { useParams } from 'next/navigation';

const TrackListFallback = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="bg-surface-default rounded-lg h-40 animate-pulse" />
    ))}
  </>
);

const TrackViewFallback = () => (
  <div className="bg-surface-default rounded-lg h-20 animate-pulse" />
);

export default function Page() {
  const { username } = useParams<{ username: string }>();
  return (
    <div className="px-8 py-8 max-w-3xl">
      <Suspense fallback={<TrackViewFallback />}>
        <TrackView trackId="1" />
      </Suspense>

      <Suspense fallback={<TrackListFallback />}>
        <TrackList username={username} />
      </Suspense>
    </div>
  );
}
