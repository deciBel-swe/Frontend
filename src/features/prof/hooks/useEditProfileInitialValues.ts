import { useMemo } from 'react';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';

export type EditProfileInitialValues = {
  displayName: string;
  city: string;
  country: string;
  bio: string;
  favoriteGenres: string[];
  website: string;
  instagram: string;
  twitter: string;
  avatar: string | null;
  coverImage: string | null;
};

export const useEditProfileInitialValues = () => {
  const ownerContext = useProfileOwnerContext();
  const user = ownerContext?.ownerUser ?? null;
  const isLoading = ownerContext?.isOwnerLoading ?? false;
  const error = ownerContext?.ownerError ?? null;

  const initialValues = useMemo<EditProfileInitialValues | null>(() => {
    if (!user) {
      return null;
    }

    const profileWithFallbacks = user.profile as typeof user.profile & {
      username?: string;
      socialLinksDto?: Array<{
        instagram: string | null;
        twitter: string | null;
        website: string | null;
      }>;
    };

    const socialLinksFromProfile = profileWithFallbacks.socialLinksDto?.[0];

    const resolvedDisplayName =
      user.displayName?.trim() ||
      user.profile?.displayName?.trim() ||
      profileWithFallbacks.username?.trim() ||
      user.username ||
      '';

    return {
      displayName: resolvedDisplayName,
      city: user.profile?.city ?? '',
      country: user.profile?.country ?? '',
      bio: user.profile?.bio ?? '',
      favoriteGenres: user.profile?.favoriteGenres ?? [],
      website: user.socialLinks?.website ?? socialLinksFromProfile?.website ?? '',
      instagram:
        user.socialLinks?.instagram ?? socialLinksFromProfile?.instagram ?? '',
      twitter: user.socialLinks?.twitter ?? socialLinksFromProfile?.twitter ?? '',
      avatar: user.profile?.profilePic ?? null,
      coverImage: user.profile?.coverPic ?? null,
    };
  }, [user]);

  return {
    initialValues,
    isLoading,
    error,
  };
};
