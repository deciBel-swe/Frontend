import { apiRequest, type ApiQueryParams } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import { sha256Hex } from '@/utils/sha256';

import type {
  AddNewEmailRequest,
  FollowResponse,
  MessageResponse,
  PaginatedHistoryResponse,
  PaginatedFollowersResponse,
  PaginatedTracksResponse,
  PrivateSocialLinks,
  ResetLoggedInPasswordRequest,
  UpdateImagesResponse,
  UpdateMeRequest,
  UpdatePrimaryEmailRequest,
  UpdateRoleRequest,
  UpdateSocialLinksRequest,
  UpdateTierRequest,
  UpdateTierResponse,
  UserMe,
  UserPlaylistsResponse,
  UserPublic,
  UsersSuggestedResponse,
} from '@/types/user';
// import { paginatedPlaylistResponse } from '@/types/playlist';
import type { PaginatedPlaylistsResponse } from '@/types/playlists';
import type { PaginatedSearchResponseDTO } from '@/types/discovery';

export interface PaginationParams {
  page?: number;
  size?: number;
}

const toQueryParams = (
  params?: PaginationParams
): ApiQueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const query: ApiQueryParams = {};
  if (params.page !== undefined) {
    query.page = params.page;
  }
  if (params.size !== undefined) {
    query.size = params.size;
  }

  return Object.keys(query).length > 0 ? query : undefined;
};

/**
 * User service contract.
 *
 * Real and mock implementations must satisfy this interface.
 */
export interface UserService {
  /** Read public profile data by user ID (GET /users/:userId). */
  getPublicUserById(userId: number): Promise<UserPublic>;

  getPublicUserByUsername(username: string): Promise<UserPublic>;

  /** Read current authenticated user payload (GET /users/me). */
  getUserMe(): Promise<UserMe>;

  /** Update current user profile fields (PATCH /users/me). */
  updateMe(payload: UpdateMeRequest): Promise<UserMe>;

  /** Change current user password (POST /users/me/reset-password). */
  resetLoggedInPassword(
    payload: ResetLoggedInPasswordRequest
  ): Promise<MessageResponse>;

  /** Add additional email (POST /users/me/add-new-email). */
  addNewEmail(payload: AddNewEmailRequest): Promise<MessageResponse>;

  /** Set primary email (POST /users/me/update-email-primary). */
  updatePrimaryEmail(
    payload: UpdatePrimaryEmailRequest
  ): Promise<MessageResponse>;

  /** Update social links (PATCH /users/me/social-links). */
  updateSocialLinks(
    payload: UpdateSocialLinksRequest
  ): Promise<PrivateSocialLinks>;

  /** Update user role (PATCH /users/me/role). */
  updateRole(payload: UpdateRoleRequest): Promise<UserMe>;

  /** Update account tier (PATCH /users/me/tier). */
  updateTier(payload: UpdateTierRequest): Promise<UpdateTierResponse>;

  /** Update profile/cover images (PATCH /users/me/images). */
  updateImages(payload: FormData): Promise<UpdateImagesResponse>;

  /** Get current user listening history (GET /users/me/history). */
  getHistory(params?: PaginationParams): Promise<PaginatedHistoryResponse>;

  /** Get suggested users to follow (GET /users/suggested). */
  getSuggestedUsers(size?: number): Promise<UsersSuggestedResponse>;

  /** Get a user's public tracks (GET /users/{userId}/tracks). */
  getUserTracks(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedTracksResponse>;

  /** Get a user's public playlists (GET /users/{userId}/playlists). */
  getUserPlaylists(
    userId: number,
    params?: PaginationParams
  ): Promise<UserPlaylistsResponse>;

  /** Get current user's repost resources (GET /users/me/repost). */
  getMyReposts(params?: PaginationParams): Promise<PaginatedSearchResponseDTO>;

  /** Get a specific user's repost resources (GET /users/{userId}/repost). */
  getUserReposts(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedSearchResponseDTO>;

  /** Get current user's playlists (GET /users/me/playlists). */
  getMePlaylists(params?: PaginationParams): Promise<UserPlaylistsResponse>;

  /** Get a user's liked playlists (GET /users/{username}/liked-playlists). */
  getUserLikedPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse>;

  /** Follow a user (POST /users/{userId}/follow). */
  followUser(userId: number): Promise<FollowResponse>;

  /** Unfollow a user (DELETE /users/{userId}/follow). */
  unfollowUser(userId: number): Promise<FollowResponse>;

  /** Get followers for a user (GET /users/{userId}/followers). */
  getFollowers(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;

  /** Get following for a user (GET /users/{userId}/following). */
  getFollowing(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;

  /** Block a user (POST /users/{userId}/block). */
  blockUser(userId: number): Promise<MessageResponse>;

  /** Unblock a user (DELETE /users/{userId}/block). */
  unblockUser(userId: number): Promise<MessageResponse>;

  /** Get blocked users list (GET /users/me/blocked). */
  getBlockedUsers(
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;

  /** Get users who liked a track (GET /tracks/{trackId}/like). */
  getUsersWhoLikedTrack(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;

  /** Get user liked tracks (GET /users/{userId}/liked-tracks). */
  // getUserLikedTracks(
  //   userId: number,
  //   params?: PaginationParams
  // ): Promise<PaginatedTracksResponse>;
  // /** Get playlists liked by a user (GET /users/{userId}/liked-playlists). */
  // getUsersLikedPlaylists(
  //   userID: number,
  //   params?: PaginationParams
  // ): Promise<paginatedPlaylistResponse>;

  /** Get users who reposted a track (GET /tracks/{trackId}/reposters). */
  getUsersWhoRepostedTrack(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealUserService implements UserService {
  async getPublicUserById(userId: number): Promise<UserPublic> {
    return apiRequest(API_CONTRACTS.USERS_PUBLIC_BY_ID(userId));
  }

  async getPublicUserByUsername(username: string): Promise<UserPublic> {
    return apiRequest(API_CONTRACTS.USERS_PUBLIC_BY_USERNAME(username));
  }

  async getUserMe(): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME, {});
  }

  async updateMe(payload: UpdateMeRequest): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME_EDIT, {
      payload,
    });
  }

  async resetLoggedInPassword(
    payload: ResetLoggedInPasswordRequest
  ): Promise<MessageResponse> {
    const hashedNewPassword = await sha256Hex(payload.newPassword);

    return apiRequest(API_CONTRACTS.USERS_ME_RESET_PASSWORD, {
      payload: {
        ...payload,
        newPassword: hashedNewPassword,
      },
    });
  }

  async addNewEmail(payload: AddNewEmailRequest): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_ADD_NEW_EMAIL, {
      payload,
    });
  }

  async updatePrimaryEmail(
    payload: UpdatePrimaryEmailRequest
  ): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_UPDATE_PRIMARY_EMAIL, {
      payload,
    });
  }

  async updateSocialLinks(
    payload: UpdateSocialLinksRequest
  ): Promise<PrivateSocialLinks> {
    return apiRequest(API_CONTRACTS.USERS_ME_SOCIAL_LINKS_UPDATE, {
      payload,
    });
  }

  async updateRole(payload: UpdateRoleRequest): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME_ROLE_UPDATE, {
      payload,
    });
  }

  async updateTier(payload: UpdateTierRequest): Promise<UpdateTierResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_TIER_UPDATE, {
      payload,
    });
  }

  async updateImages(
    payload: FormData
  ): Promise<UpdateImagesResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_IMAGES_UPDATE, {
      payload,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getHistory(params?: PaginationParams): Promise<PaginatedHistoryResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_HISTORY, {
      params: toQueryParams(params),
    });
  }

  async getSuggestedUsers(size?: number): Promise<UsersSuggestedResponse> {
    return apiRequest(API_CONTRACTS.USERS_SUGGESTED, {
      params: size === undefined ? undefined : { size },
    });
  }

  async getUserTracks(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedTracksResponse> {
    return apiRequest(API_CONTRACTS.USERS_TRACKS(userId), {
      params: toQueryParams(params),
    });
  }

  async getUserPlaylists(
    userId: number,
    params?: PaginationParams
  ): Promise<UserPlaylistsResponse> {
    return apiRequest(API_CONTRACTS.USERS_PLAYLISTS(userId), {
      params: toQueryParams(params),
    });
  }

  async getMyReposts(
    params?: PaginationParams
  ): Promise<PaginatedSearchResponseDTO> {
    return apiRequest(API_CONTRACTS.USERS_ME_REPOSTS, {
      params: toQueryParams(params),
    });
  }

  async getUserReposts(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedSearchResponseDTO> {
    return apiRequest(API_CONTRACTS.USERS_REPOSTS(userId), {
      params: toQueryParams(params),
    });
  }

  async getMePlaylists(
    params?: PaginationParams
  ): Promise<UserPlaylistsResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_PLAYLISTS, {
      params: toQueryParams(params),
    });
  }

  async getUserLikedPlaylists(
    username: string,
    params?: PaginationParams
  ): Promise<PaginatedPlaylistsResponse> {
    return apiRequest(API_CONTRACTS.USERS_LIKED_PLAYLISTS(username), {
      params: toQueryParams(params),
    });
  }

  async followUser(userId: number): Promise<FollowResponse> {
    return apiRequest(API_CONTRACTS.USERS_FOLLOW(userId), {});
  }

  async unfollowUser(userId: number): Promise<FollowResponse> {
    return apiRequest(API_CONTRACTS.USERS_UNFOLLOW(userId), {});
  }

  async getFollowers(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_FOLLOWERS(userId), {
      params: toQueryParams(params),
    });
  }

  async getFollowing(
    userId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_FOLLOWING(userId), {
      params: toQueryParams(params),
    });
  }

  async blockUser(userId: number): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_BLOCK(userId));
  }

  async unblockUser(userId: number): Promise<MessageResponse> {
    try {
      await apiRequest(API_CONTRACTS.USERS_UNBLOCK(userId));
    }
    catch (error) { 
      console.error(`Failed to unblock user with ID ${userId}:`, error);
    }
    return { message: 'User unblocked' };
  }

  async getBlockedUsers(
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_BLOCKED, {
      params: toQueryParams(params),
    });
  }

  async getUsersWhoLikedTrack(
    trackid: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_WHO_LIKED_TRACK(trackid), {
      params: toQueryParams(params),
    });
  }
  // async getUserLikedTracks(
  //     userId: number,
  //     params?: PaginationParams
  //   ): Promise<PaginatedTracksResponse> {
  //     return apiRequest(API_CONTRACTS.USER_LIKED_TRACKS(userId), {
  //       params: toQueryParams(params),
  //     });
  //   }
  // async getUsersLikedPlaylists(
  //   trackid: number,
  //   params?: PaginationParams
  // ): Promise<paginatedPlaylistResponse> {
  //   return apiRequest(API_CONTRACTS.USERS_LIKED_PLAYLISTS(trackid), {
  //     params: toQueryParams(params),
  //   });
  // }

  async getUsersWhoRepostedTrack(
    trackId: number,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_WHO_REPOSTED(trackId), {
      params: toQueryParams(params),
    });
  }
}
