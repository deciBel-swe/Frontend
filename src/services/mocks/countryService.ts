import type { CountryService } from '../api/countryService';
import { CountryOption } from '@/types/country';

const MOCK_COUNTRIES = [
  { name: 'Argentina', code: 'AR' },
  { name: 'Australia', code: 'AU' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Canada', code: 'CA' },
  { name: 'Egypt', code: 'EG' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Japan', code: 'JP' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Spain', code: 'ES' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Egypt', code: 'EG' },
  { name: 'United States', code: 'US' },
];

export class MockCountryService implements CountryService {
  getCountries = async (): Promise<CountryOption[]> => {
    return MOCK_COUNTRIES;
  };
}
