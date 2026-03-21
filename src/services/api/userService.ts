import { apiRequest, type ApiQueryParams } from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';

import type {
  AddNewEmailRequest,
  FollowResponse,
  MessageResponse,
  PaginatedFeedResponse,
  PaginatedFollowersResponse,
  PaginatedTracksResponse,
  PrivateSocialLinks,
  ResetLoggedInPasswordRequest,
  UpdateImagesJsonRequest,
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
  getPublicUser(userId: number): Promise<UserPublic>;

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

  /** Update profile/cover image URLs (PATCH /users/me/images). */
  updateImages(payload: UpdateImagesJsonRequest): Promise<UpdateImagesResponse>;

  /** Get current user listening history (GET /users/me/history). */
  getHistory(params?: PaginationParams): Promise<PaginatedFeedResponse>;

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
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealUserService implements UserService {
  async getPublicUser(userId: number): Promise<UserPublic> {
    return apiRequest(API_CONTRACTS.USERS_PUBLIC(userId));
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
    return apiRequest(API_CONTRACTS.USERS_ME_RESET_PASSWORD, {
      payload,
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
    payload: UpdateImagesJsonRequest
  ): Promise<UpdateImagesResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_IMAGES_UPDATE, {
      payload,
    });
  }

  async getHistory(params?: PaginationParams): Promise<PaginatedFeedResponse> {
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
    return apiRequest(API_CONTRACTS.USERS_UNBLOCK(userId));
  }

  async getBlockedUsers(
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_BLOCKED, {
      params: toQueryParams(params),
    });
  }
}
