import Link from "next/link";
import TrackRow from "./TrackRow";
import type {
  PlayerTrack,
  QueueSource,
} from '@/features/player/contracts/playerContracts';

type ListOfTrackRowsprops ={
  headerUrl: string
  History_header: string
  queueSource?: QueueSource
  history: {
    trackId?: string | number;
    image: string;
    artist: string;
    artistUsername?: string;
    title: string;
    playback?: PlayerTrack;
    stats: {
      plays: string;
      likes: string;
      reposts: string;
      comments: string;
    };
  }[];
}
export default function ARTIST ({ history, History_header, headerUrl, queueSource = 'unknown' }: ListOfTrackRowsprops) {
  const queueTracks = history.flatMap((track) => (track.playback ? [track.playback] : []));

  return (
            /* ================= ARTISTS ================= */
      <section>
        <div className="flex justify-between items-center border-b border-border-default pb-2">
          <Link href={headerUrl} className="text-[11px] font-bold uppercase text-text-secondary">
            {History_header}
          </Link>

          <Link
            href={headerUrl}
            className="text-text-secondary hover:text-text-primary text-[11px]"
          >
            View all
          </Link>
        </div>

        <div className="flex flex-col gap-3 max-h-105 overflow-y-auto pr-1">
          {history.map((track, i) => (
            <TrackRow
              key={`${track.trackId ?? track.title}-${i}`}
              {...track}
              queueTracks={queueTracks}
              queueSource={queueSource}
            />
          ))}
        </div>
      </section>
  );
}