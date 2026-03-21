import PlaylistCard from '@/components/PlaylistCard';
import Button from '@/components/buttons/Button';

const mockPlaylists = [
  {
    id: 1,
    title: 'GOOD B1TCH DEMO.mp3',
    artist: 'LM KAYLA',
    image: 'https://i1.sndcdn.com/artworks-Vzgdk0yrLFwhqxtg-T3ftYA-t500x500.jpg',
  },
  {
    id: 2,
    title: 'Double Vision - Flex Juke',
    artist: 'Double Vision',
    image: 'https://i1.sndcdn.com/artworks-w1BjpoUnYWzgHoEj-dKbI9A-t500x500.jpg',
  },
  {
    id: 3,
    title: 'Your Loving Arms',
    artist: 'Phase Two',
    image: 'https://i1.sndcdn.com/artworks-ZvTOS9eK9xf1d37S-jDf2Ew-t500x500.jpg',
  },
  {
    id: 4,
    title: 'Numba 1 DJ',
    artist: 'AMY101',
    image: 'https://i1.sndcdn.com/artworks-fNxVStvNE7txxeyJ-MAA8Qw-t500x500.jpg',
  },
];

export default function TrendingSection() {
  return (
    <section className="px-8 py-12 flex flex-col items-center justify-center gap-20">
      <h2 className='font-extrabold text-xl'>Hear what’s trending for free in the SoundCloud community</h2>

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
        <Button variant='secondary'>Explore trending playlists</Button>
      </div>
    </section>
  );
}