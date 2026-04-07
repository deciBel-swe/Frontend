import Link from "next/link";
import SidebarArtistCard from "./SidebarArtistCard"
type ListOfArtistCardsprops ={
  headerUrl:string
  Artist_header: string
  artists: {
    id?: number;
    username: string;
    displayName?: string;
    followers: number;
    tracks: number;
    isFollowing?: boolean;
    imageUrl?: string;
    artistUrl?: string;
  }[];

}
export default function ARTIST ({ artists, Artist_header, headerUrl }: ListOfArtistCardsprops) {
  return (
      <section>
        <div className="flex justify-between items-center border-b border-border-default pb-2">
          <Link href={headerUrl} className="text-sm font-semibold text-text-muted">
            {Artist_header}
          </Link>

          <button className="text-xs text-gray-400 hover:text-white transition">
            Refresh list
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {artists.map((artist, i) => (
            <SidebarArtistCard key={i} {...artist} />
          ))}
        </div>
      </section>
  );
}