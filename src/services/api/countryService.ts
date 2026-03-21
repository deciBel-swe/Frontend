import { apiClient } from '@/hooks/useAPI';
import { CountryOption } from '@/types/country';

export interface CountryService {
  /** Retrieve countries from Rest Countries fixed endpoint. */
  getCountries(): Promise<CountryOption[]>;
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealCountryService implements CountryService {
  // This endpoint is external, so we bypass the app API base URL.
  async getCountries(): Promise<CountryOption[]> {
    const response = await apiClient.request<
      Array<{ name?: { common?: string }; cca2?: string }>
    >({
      baseURL: 'https://restcountries.com',
      method: 'GET',
      url: '/v3.1/all?fields=name,cca2',
    });

    return response.data
      .map((country) => {
        const name = country.name?.common;
        const code = country.cca2;

        if (!name || !code) {
          return null;
        }

        return { name, code };
      })
      .filter((country): country is CountryOption => country !== null);
  }
}
