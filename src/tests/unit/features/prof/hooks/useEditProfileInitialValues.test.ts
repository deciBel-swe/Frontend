import { renderHook } from '@testing-library/react';

import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { useEditProfileInitialValues } from '@/features/prof/hooks/useEditProfileInitialValues';

jest.mock('@/features/prof/context/ProfileOwnerContext', () => ({
  useProfileOwnerContext: jest.fn(),
}));

const mockUseProfileOwnerContext = useProfileOwnerContext as jest.Mock;

describe('useEditProfileInitialValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null initial values when there is no owner user', () => {
    mockUseProfileOwnerContext.mockReturnValue(undefined);

    const { result } = renderHook(() => useEditProfileInitialValues());

    expect(result.current.initialValues).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('builds initial values using fallback profile fields and socialLinksDto', () => {
    mockUseProfileOwnerContext.mockReturnValue({
      isOwnerLoading: true,
      ownerError: 'owner-loading-error',
      ownerUser: {
        username: 'account-username',
        displayName: ' ',
        profile: {
          username: 'profile-username',
          displayName: '',
          city: 'Nairobi',
          country: 'Kenya',
          bio: 'Bio text',
          favoriteGenres: ['afro-house'],
          profilePic: '/avatar.png',
          coverPic: '/cover.png',
          socialLinksDto: [
            {
              instagram: 'https://instagram.com/dto',
              twitter: 'https://x.com/dto',
              website: 'https://dto.site',
            },
          ],
        },
      },
    });

    const { result } = renderHook(() => useEditProfileInitialValues());

    expect(result.current.initialValues).toEqual({
      displayName: 'profile-username',
      city: 'Nairobi',
      country: 'Kenya',
      bio: 'Bio text',
      favoriteGenres: ['afro-house'],
      website: 'https://dto.site',
      instagram: 'https://instagram.com/dto',
      twitter: 'https://x.com/dto',
      avatar: '/avatar.png',
      coverImage: '/cover.png',
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe('owner-loading-error');
  });

  it('prefers explicit social links from owner user when provided', () => {
    mockUseProfileOwnerContext.mockReturnValue({
      ownerUser: {
        username: 'owner',
        displayName: 'Owner Name',
        socialLinks: {
          website: 'https://owner.site',
          instagram: 'https://instagram.com/owner',
          twitter: 'https://x.com/owner',
        },
        profile: {
          city: '',
          country: '',
          bio: '',
          favoriteGenres: [],
          profilePic: null,
          coverPic: null,
          socialLinksDto: [
            {
              instagram: 'https://instagram.com/dto',
              twitter: 'https://x.com/dto',
              website: 'https://dto.site',
            },
          ],
        },
      },
      isOwnerLoading: false,
      ownerError: null,
    });

    const { result } = renderHook(() => useEditProfileInitialValues());

    expect(result.current.initialValues).toEqual(
      expect.objectContaining({
        website: 'https://owner.site',
        instagram: 'https://instagram.com/owner',
        twitter: 'https://x.com/owner',
      })
    );
  });
});
