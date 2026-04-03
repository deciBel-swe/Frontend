import { useEffect, useMemo, useState } from 'react';
import type { ProfileLink } from '@/types/user';
import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';

export type EditProfileInitialValues = {
  displayName: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  bio: string;
  links: ProfileLink[];
  avatar: string | null;
};

const toProfileLinks = (
  socialLinks: {
    instagram?: string;
    twitter?: string;
    website?: string;
    supportLink?: string;
  } | null | undefined
): ProfileLink[] => {
  if (!socialLinks) {
    return [];
  }

  const links: ProfileLink[] = [];
  let id = 1;

  if (socialLinks.instagram) {
    links.push({
      id: id++,
      url: socialLinks.instagram,
      title: 'Instagram',
      kind: 'regular',
    });
  }

  if (socialLinks.twitter) {
    links.push({
      id: id++,
      url: socialLinks.twitter,
      title: 'Twitter',
      kind: 'regular',
    });
  }

  if (socialLinks.website) {
    links.push({
      id: id++,
      url: socialLinks.website,
      title: 'Website',
      kind: 'regular',
    });
  }

  if (socialLinks.supportLink) {
    links.push({
      id: id++,
      url: socialLinks.supportLink,
      title: 'Support',
      kind: 'support',
    });
  }

  return links;
};

export const useEditProfileInitialValues = () => {
  const ownerContext = useProfileOwnerContext();
  const user = ownerContext?.ownerUser ?? null;
  const isLoading = ownerContext?.isOwnerLoading ?? false;
  const error = ownerContext?.ownerError ?? null;
  const [nextLinkId, setNextLinkId] = useState(1);

  const initialValues = useMemo<EditProfileInitialValues | null>(() => {
    if (!user) {
      return null;
    }

    const links = toProfileLinks(user.socialLinks);

    return {
      displayName: user.username ?? '',
      profileUrl: user.username ?? '',
      firstName: '',
      lastName: '',
      city: user.profile?.city ?? '',
      country: user.profile?.country ?? '',
      bio: user.profile?.bio ?? '',
      links,
      avatar: user.profile?.profilePic ?? null,
    };
  }, [user]);

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    const maxId = initialValues.links.reduce((max, link) => {
      return link.id > max ? link.id : max;
    }, 0);

    setNextLinkId(maxId + 1);
  }, [initialValues]);

  return {
    initialValues,
    nextLinkId,
    isLoading,
    error,
  };
};
