import PlaylistCard from '@/components/playlist/PlaylistCard';
import Button from '@/components/buttons/Button';

const mockPlaylists = [
  {
    id: 1,
    title: 'The Beauty of Existence',
    artist: 'Muhammad Al Muqit',
    image:
      'https://i1.sndcdn.com/artworks-000523960650-2nc5nm-t500x500.jpg',
  },
  {
    id: 2,
    title: 'A Flower',
    artist: 'Double Vision',
    image:
      'https://i1.sndcdn.com/artworks-000184761485-dzknun-t500x500.jpg',
  },
  {
    id: 3,
    title: 'Al-Aqsa',
    artist: 'Palestine',
    image:
      'https://i1.sndcdn.com/artworks-000034240364-u9zoa8-t500x500.jpg',
  },
];

export default function TrendingSection() {
  return (
    <section className="px-8 py-12 flex flex-col items-center justify-center gap-20">
      <h2 className="font-extrabold text-xl">
        Hear what’s trending for free in the SoundCloud community
      </h2>

      <div className="grid grid-cols-4 gap-10">
        {mockPlaylists.map((item) => (
          <PlaylistCard
            key={item.id}
            title={item.title}
            //artist={item.artist}
            coverUrl={item.image}
          />
        ))}
      </div>
      <div>
        <Button variant="secondary">Explore trending playlists</Button>
      </div>
    </section>
  );
}
