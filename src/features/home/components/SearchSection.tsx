import Button from '@/components/buttons/Button';
import { SearchBar } from '@/components/nav/SearchBar';
export default function SearchSection() {
  return (
    <section className="flex flex-row items-center py-10 gap-3 p-50">
      {/* <Input placeholder="Search..." /> */}
      <SearchBar />
      <p className='font-bold'> or </p>
      <Button variant='secondary'>Upload your own</Button>
    </section>
  );
}