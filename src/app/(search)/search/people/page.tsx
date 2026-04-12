'use client';
import SearchPage from '@/features/search/SearchPage';
import { mockPeople } from '@/features/search/mock/mockdata';

export default function PeoplePage() {
  return (
    <SearchPage
      tab="people"
      people={mockPeople}
      totalPeople={mockPeople.length}
      isLoading={false}
    />
  );
}