export interface UserMe {
  id: number;
  Role: 'LISTENER' | 'ARTIST' | 'OTHER';
  email: string;
  username: string;
  emailVerified: boolean;
  tier: 'ARTIST' | 'LISTENER' | 'OTHER';
  profile: {
    bio: string;
    city: string;
    country: string;
    profilePic: string;
    coverPic: string;
    favoriteGenres: string[];
  };
  socialLinks: {
    instagram: string;
    website: string;
    supportLink: string;
    twitter: string;
  };
  privacySettings: {
    isPrivate: boolean;
    showHistory: boolean;
  };
  stats: {
    followers: number;
    following: number;
    tracksCount: number;
  };
}

export interface UserPublic {
  id: number;
  username: string;
  tier: 'ARTIST' | 'LISTENER' | 'OTHER';
  profile: {
    username: string;
    id: number;
    bio: string;
    location: string;
    avatarUrl: string;
    coverPhotoUrl: string;
    favoriteGenres: string[];
  };
  socialLinks: {
    instagram: string;
    twitter: string;
    website: string;
  };
  stats: {
    followersCount: number;
    followingCount: number;
    trackCount: number;
  };
}
