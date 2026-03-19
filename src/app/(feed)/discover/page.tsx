import PlaylistCard from "@/components/PlaylistCard";
import SidebarArtistCard from "@/components/sidebar/SidebarArtistCard";
import TrackRow from "@/components/sidebar/TrackRow";
import TrackCard from '@/components/TrackCard'
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
      <SidebarArtistCard
        name="Artist One"
        followers={1200}
        tracks={15}
        imageUrl="./images/default_song_image.png"
      />
            <TrackRow
        image="./images/default_song_image.png"
        artist="Travis Scott"
        title="A Man"
        stats={{
          plays: '63.3M',
          likes: '933K',
          reposts: '66.4K',
          comments: '6,482',
        }}
      />
            <TrackCard
  user={{
    name: 'Akmal',
    avatar: '/images/default_song_image.png',
  }}
  postedText="posted a track"
  timeAgo="1 year ago"
  track={{
    artist: 'Mohamed Ramdan',
    title: 'Viikatory & Manao - XOXO (Viika’s Cut)',
    cover: '/images/default_song_image.png',
    duration: '5:07',
  }}
  waveform={Array.from({ length: 120 }, () =>
    Math.floor(Math.random() * 80) + 10
  )}
  //onPlay={() => console.log('play')}
/>
    </div>
  );
}
