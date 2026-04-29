export interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  followerCount?: number;
}
