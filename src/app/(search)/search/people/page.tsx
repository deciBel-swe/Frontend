'use client';
import SearchResults from '@/features/search/SearchResults';
import { useSearchNavigation } from '@/features/search/hooks/useSearchNavigation';
import { mockPeople } from '@/features/search/mock/mockdata';

export default function PeoplePage() {
  const { query } = useSearchNavigation();

  return (
    <SearchResults
      tab="people"
      query={query}
      people={mockPeople}
      totalPeople={mockPeople.length}
      isLoading={false}
    />
  );
}