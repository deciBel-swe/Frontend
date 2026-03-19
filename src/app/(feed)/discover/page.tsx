import PlaylistCard from "@/components/PlaylistCard";

export default function Page() {
  return(
        <div className="flex gap-4 flex-wrap">
      <PlaylistCard
        title="Maara - Who Let The.."
        coverUrl="/images/default_song_image.png"
      />
      <PlaylistCard
        title="Another Playlist"
        coverUrl="/images/default_song_image.png"
      />
    </div>
  );
}
