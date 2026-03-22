import Link from "next/link";
import TrackRow from "./TrackRow";

type ListOfTrackRowsprops ={
  headerUrl: string
  History_header: string
  history: {
    image: string;
    artist: string;
    title: string;
    stats: {
      plays: string;
      likes: string;
      reposts: string;
      comments: string;
    };
  }[];
}
export default function ARTIST ({ history, History_header, headerUrl }: ListOfTrackRowsprops) {
  return (
            /* ================= ARTISTS ================= */
      <section>
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
          <Link href={headerUrl} className="text-sm font-semibold text-gray-400">
            {History_header}
          </Link>

          <Link
            href="/you/history"
            className="text-xs text-gray-400 hover:text-white transition"
          >
            View all
          </Link>
        </div>

        <div className="flex flex-col gap-3 mt-4 max-h-[420px] overflow-y-auto pr-1">
          {history.map((track, i) => (
            <TrackRow key={i} {...track} />
          ))}
        </div>
      </section>
  );
}