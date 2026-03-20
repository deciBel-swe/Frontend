import { UserPublic } from '../../types/user';
import { UserMe } from '../../types/user';
import { UserService } from '../api/userService';

export class MockUserService implements UserService {
  // Mock function to simulate fetching a public user by username
  getPublicUser = async (username: string): Promise<UserPublic> => {
    // Simulated mock data
    return {
      id: 1,
      username,
      tier: 'ARTIST',
      profile: {
        username,
        id: 1,
        bio: 'This is a mock bio.',
        location: 'Naser City,Cairo ,Egypt',
        avatarUrl: 'https://i.ibb.co/yFSZ1q4g/images.webp',
        coverPhotoUrl: 'https://i.ibb.co/r2ZssgJZ/sl-063022-51250-12.jpg',
        favoriteGenres: ['Pop', 'Rock'],
      },
      socialLinks: {
        instagram: 'https://instagram.com/mockuser',
        twitter: 'https://twitter.com/mockuser',
        website: 'https://decibel.foo',
      },
      stats: {
        followersCount: 1234,
        followingCount: 567,
        trackCount: 42,
      },
    };
  };

  // Mock function to simulate fetching the current user (UserMe) using a token
  getUserMe = async (token: string): Promise<UserMe> => {
    // Simulated mock data
    return {
      id: 1,
      Role: 'ARTIST',
      email: 'mockuser@email.com',
      username: 'mockuser',
      emailVerified: true,
      tier: 'ARTIST',
      profile: {
        bio: 'This is my Profile.',
        city: '6 October ,Giza',
        country: 'Egypt',
        profilePic: 'https://i.ibb.co/SD1pMkyy/GRgo-Ocga-YAIm6-TF.jpg',
        coverPic: 'https://i.ibb.co/r2ZssgJZ/sl-063022-51250-12.jpg',
        favoriteGenres: ['Pop', 'Rock'],
      },
      socialLinks: {
        instagram: 'https://instagram.com/mockuser',
        website: 'https://decibel.foo',
        supportLink: 'https://support.mockuser.com',
        twitter: 'https://twitter.com/mockuser',
      },
      privacySettings: {
        isPrivate: false,
        showHistory: true,
      },
      stats: {
        followers: 1234,
        following: 567,
        tracksCount: 42,
      },
    };
  };
}
