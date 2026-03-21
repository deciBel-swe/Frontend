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

const toQueryParams = (params?: PaginationParams): ApiQueryParams | undefined => {
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
  /** Read public profile data by username (GET /users/:username). */
  getPublicUser(username: string): Promise<UserPublic>;

  /** Read current authenticated user payload (GET /users/me). */
  getUserMe(token: string): Promise<UserMe>;

  /** Update current user profile fields (PATCH /users/me). */
  updateMe(token: string, payload: UpdateMeRequest): Promise<UserMe>;

  /** Change current user password (POST /users/me/reset-password). */
  resetLoggedInPassword(
    token: string,
    payload: ResetLoggedInPasswordRequest
  ): Promise<MessageResponse>;

  /** Add additional email (POST /users/me/add-new-email). */
  addNewEmail(token: string, payload: AddNewEmailRequest): Promise<MessageResponse>;

  /** Set primary email (POST /users/me/update-email-primary). */
  updatePrimaryEmail(
    token: string,
    payload: UpdatePrimaryEmailRequest
  ): Promise<MessageResponse>;

  /** Update social links (PATCH /users/me/social-links). */
  updateSocialLinks(
    token: string,
    payload: UpdateSocialLinksRequest
  ): Promise<PrivateSocialLinks>;

  /** Update user role (PATCH /users/me/role). */
  updateRole(token: string, payload: UpdateRoleRequest): Promise<UserMe>;

  /** Update account tier (PATCH /users/me/tier). */
  updateTier(token: string, payload: UpdateTierRequest): Promise<UpdateTierResponse>;

  /** Update profile/cover image URLs (PATCH /users/me/images). */
  updateImages(
    token: string,
    payload: UpdateImagesJsonRequest
  ): Promise<UpdateImagesResponse>;

  /** Get current user listening history (GET /users/me/history). */
  getHistory(token: string, params?: PaginationParams): Promise<PaginatedFeedResponse>;

  /** Get suggested users to follow (GET /users/suggested). */
  getSuggestedUsers(token: string, size?: number): Promise<UsersSuggestedResponse>;

  /** Get a user's public tracks (GET /users/{userId}/tracks). */
  getUserTracks(userId: string, params?: PaginationParams): Promise<PaginatedTracksResponse>;

  /** Get a user's public playlists (GET /users/{userId}/playlists). */
  getUserPlaylists(
    userId: string,
    params?: PaginationParams
  ): Promise<UserPlaylistsResponse>;

  /** Follow a user (POST /users/{userId}/follow). */
  followUser(token: string, userId: string): Promise<FollowResponse>;

  /** Unfollow a user (DELETE /users/{userId}/follow). */
  unfollowUser(token: string, userId: string): Promise<FollowResponse>;

  /** Get followers for a user (GET /users/{userId}/followers). */
  getFollowers(
    token: string,
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;

  /** Get following for a user (GET /users/{userId}/following). */
  getFollowing(
    token: string,
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;

  /** Block a user (POST /users/{userId}/block). */
  blockUser(token: string, userId: string): Promise<MessageResponse>;

  /** Unblock a user (DELETE /users/{userId}/block). */
  unblockUser(token: string, userId: string): Promise<MessageResponse>;

  /** Get blocked users list (GET /users/me/blocked). */
  getBlockedUsers(
    token: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse>;
}

/** Real implementation backed by centralized axios + Zod API template. */
export class RealUserService implements UserService {
  private authHeader(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getPublicUser(username: string): Promise<UserPublic> {
    return apiRequest(API_CONTRACTS.USERS_PUBLIC(username));
  }

  async getUserMe(token: string): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME, {
      headers: this.authHeader(token),
    });
  }

  async updateMe(token: string, payload: UpdateMeRequest): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME_EDIT, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async resetLoggedInPassword(
    token: string,
    payload: ResetLoggedInPasswordRequest
  ): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_RESET_PASSWORD, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async addNewEmail(
    token: string,
    payload: AddNewEmailRequest
  ): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_ADD_NEW_EMAIL, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async updatePrimaryEmail(
    token: string,
    payload: UpdatePrimaryEmailRequest
  ): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_UPDATE_PRIMARY_EMAIL, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async updateSocialLinks(
    token: string,
    payload: UpdateSocialLinksRequest
  ): Promise<PrivateSocialLinks> {
    return apiRequest(API_CONTRACTS.USERS_ME_SOCIAL_LINKS_UPDATE, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async updateRole(token: string, payload: UpdateRoleRequest): Promise<UserMe> {
    return apiRequest(API_CONTRACTS.USERS_ME_ROLE_UPDATE, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async updateTier(
    token: string,
    payload: UpdateTierRequest
  ): Promise<UpdateTierResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_TIER_UPDATE, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async updateImages(
    token: string,
    payload: UpdateImagesJsonRequest
  ): Promise<UpdateImagesResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_IMAGES_UPDATE, {
      payload,
      headers: this.authHeader(token),
    });
  }

  async getHistory(
    token: string,
    params?: PaginationParams
  ): Promise<PaginatedFeedResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_HISTORY, {
      params: toQueryParams(params),
      headers: this.authHeader(token),
    });
  }

  async getSuggestedUsers(token: string, size?: number): Promise<UsersSuggestedResponse> {
    return apiRequest(API_CONTRACTS.USERS_SUGGESTED, {
      params: size === undefined ? undefined : { size },
      headers: this.authHeader(token),
    });
  }

  async getUserTracks(
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedTracksResponse> {
    return apiRequest(API_CONTRACTS.USERS_TRACKS(userId), {
      params: toQueryParams(params),
    });
  }

  async getUserPlaylists(
    userId: string,
    params?: PaginationParams
  ): Promise<UserPlaylistsResponse> {
    return apiRequest(API_CONTRACTS.USERS_PLAYLISTS(userId), {
      params: toQueryParams(params),
    });
  }

  async followUser(token: string, userId: string): Promise<FollowResponse> {
    return apiRequest(API_CONTRACTS.USERS_FOLLOW(userId), {
      headers: this.authHeader(token),
    });
  }

  async unfollowUser(token: string, userId: string): Promise<FollowResponse> {
    return apiRequest(API_CONTRACTS.USERS_UNFOLLOW(userId), {
      headers: this.authHeader(token),
    });
  }

  async getFollowers(
    token: string,
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_FOLLOWERS(userId), {
      params: toQueryParams(params),
      headers: this.authHeader(token),
    });
  }

  async getFollowing(
    token: string,
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_FOLLOWING(userId), {
      params: toQueryParams(params),
      headers: this.authHeader(token),
    });
  }

  async blockUser(token: string, userId: string): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_BLOCK(userId), {
      headers: this.authHeader(token),
    });
  }

  async unblockUser(token: string, userId: string): Promise<MessageResponse> {
    return apiRequest(API_CONTRACTS.USERS_UNBLOCK(userId), {
      headers: this.authHeader(token),
    });
  }

  async getBlockedUsers(
    token: string,
    params?: PaginationParams
  ): Promise<PaginatedFollowersResponse> {
    return apiRequest(API_CONTRACTS.USERS_ME_BLOCKED, {
      params: toQueryParams(params),
      headers: this.authHeader(token),
    });
  }
}
