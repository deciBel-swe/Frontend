import { useQuery } from '@tanstack/react-query';
import { CountryOption } from '@/types/country';
import { useMemo } from 'react';

import { countryService } from '@/services';

const getCountryKey = ['countries'];

/**
 * Hook to fetch country options from the country service.
 */
export const useGetCountry = () => {
  const { data, isLoading, isError } = useQuery<CountryOption[]>({
    queryKey: getCountryKey,
    queryFn: () => countryService.getCountries(),
  });

  const sortedCountries = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      ),
    [data]
  );

  return {
    data: sortedCountries,
    isLoading,
    error: isError ? 'Failed to fetch countries' : null,
  };
};
