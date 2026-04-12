import { z } from 'zod';

/**
 * Endpoint contract registry.
 *
 * This file maps route constants to runtime DTO validators so every backend
 * call has a strongly typed request and response boundary.
 *
 * Update flow for new endpoints:
 * 1) Define request/response Zod DTO schemas in `src/types`.
 * 2) Add a contract entry in `API_CONTRACTS` using `API_ENDPOINTS` URL values.
 * 3) Consume the contract via `apiRequest`, `useApiQuery`, or `useApiMutation`.
 */

import { API_ENDPOINTS } from '@/constants/routes';

import {
  googleOAuthRequestDTOSchema,
  loginLocalRequestDTOSchema,
  loginResponseDTOSchema,
  registerLocalRequestDTOSchema,
  registerLocalResponseDTOSchema,
  refreshTokenResponseDTOSchema,
  deviceInfoDTOSchema,
} from './index';
import {
  privacySettingsSchema,
  updatePrivacySettingsDtoSchema,
} from './privacy';
import {
  likeResponseSchema,
  paginatedTrackResponseSchema,
  paginationRepostUserSchema,
  repostResponseSchema,
  secretTokenResponseSchema,
  trackDetailsResponseSchema,
  trackUpdateResponseSchema,
  updateTrackVisibilityDtoSchema,
  uploadTrackResponseSchema,
  paginatedTracksResponseSchema,
} from './tracks';
import {
  addNewEmailRequestSchema,
  followResponseSchema,
  messageResponseSchema,
  paginatedFeedResponseSchema,
  paginatedFollowersResponseSchema,
  privateSocialLinksSchema,
  resetLoggedInPasswordRequestSchema,
  updateImagesResponseSchema,
  updateMeRequestSchema,
  updatePrimaryEmailRequestSchema,
  updateRoleRequestSchema,
  updateSocialLinksRequestSchema,
  updateTierRequestSchema,
  updateTierResponseSchema,
  userMeSchema,
  userPlaylistsResponseSchema,
  userPublicSchema,
  usersSuggestedResponseSchema,
} from './user';
import { paginatedTrackFeedResponseSchema } from './feed';
import {
  paginatedSearchResponseSchema,
  paginatedStationResponseSchema,
  trendingTracksResponseSchema,
} from './discovery';
// import { paginatedPlaylistResponseSchema } from './playlist';
import {
  createCommentRequestSchema,
  commentSchema,
  paginatedCommentsResponseSchema,
  paginatedRepliesResponseSchema,
} from './comments';
import {
  createPlaylistRequestSchema,
  addPlaylistTrackRequestSchema,
  playlistUpdateResponseSchema,
  playlistEmbedResponseSchema,
  playlistSecretLinkResponseSchema,
  playlistSecretLinkRegenerateResponseSchema,
  playlistLikeResponseSchema,
  paginatedPlaylistsResponseSchema,
  reorderPlaylistTracksRequestSchema,
  updatePlaylistRequestSchema,
  playlistResponseSchema,
} from './playlists';
import {
  messageDTOSchema,
  paginatedMessageResponseSchema,
  sendMessageRequestSchema,
} from './message';
import {
  adminLoginRequestSchema,
  adminLoginResponseSchema,
  adminReportsPageSchema,
  banUserRequestSchema,
  platformAnalyticsResponseSchema,
  reportRequestSchema,
  updateAdminReportStatusRequestSchema,
} from './admin';
/** Supported HTTP verbs for endpoint contracts. */
export type ApiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Strongly typed API contract for one endpoint.
 *
 * TRequest is validated before dispatch.
 * TResponse is validated before returning data to callers.
 */
export interface ApiEndpointContract<TRequest, TResponse> {
  method: ApiHttpMethod;
  url: string;
  requestSchema?: z.ZodType<TRequest>;
  responseSchema: z.ZodType<TResponse>;
}

const defineContract = <TRequest, TResponse>(
  contract: ApiEndpointContract<TRequest, TResponse>
): ApiEndpointContract<TRequest, TResponse> => contract;

const trackPlaybackActionRequestSchema = z.object({
  trackId: z.number().int().nonnegative(),
  deviceInfo: deviceInfoDTOSchema,
});

/**
 * Endpoint registry used by useAPI templates and real services.
 *
 * Every entry imports its URL from `API_ENDPOINTS` and binds request/response
 * DTO schemas for runtime validation.
 */
export const API_CONTRACTS = {
  AUTH_LOGIN_LOCAL: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.LOGIN_LOCAL,
    requestSchema: loginLocalRequestDTOSchema,
    responseSchema: loginResponseDTOSchema,
  }),

  AUTH_REGISTER_LOCAL: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.REGISTER_LOCAL,
    requestSchema: registerLocalRequestDTOSchema,
    responseSchema: registerLocalResponseDTOSchema,
  }),

  AUTH_OAUTH_GOOGLE: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.GOOGLE_OAUTH,
    requestSchema: googleOAuthRequestDTOSchema,
    responseSchema: loginResponseDTOSchema,
  }),

  AUTH_REFRESH_TOKEN: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.REFRESH,
    responseSchema: refreshTokenResponseDTOSchema,
  }),

  AUTH_LOGOUT: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.LOGOUT,
    responseSchema: z.object({ message: z.string().trim().min(1) }),
  }),

  AUTH_LOGOUT_ALL: defineContract<void, undefined>({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.LOGOUT_ALL,
    responseSchema: z.undefined(),
  }),
  VERIFY_EMAIL: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    requestSchema: z.object({ token: z.string().trim().min(1) }),
    responseSchema: z.object({ message: z.string().trim().min(1) }),
  }),
  RESEND_VERIFICATION: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
    requestSchema: z.object({
      email: z.string().trim().email(),
      deviceInfo: deviceInfoDTOSchema,
    }),
    responseSchema: z.object({
      message: z.string().trim().min(1),
      coolDown: z.number().int().nonnegative().optional().nullable(),
    }),
  }),
  USERS_ME: defineContract({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME,
    responseSchema: userMeSchema,
  }),
  USERS_ME_EDIT: defineContract({
    method: 'PATCH',
    url: API_ENDPOINTS.USERS.ME,
    requestSchema: updateMeRequestSchema,
    responseSchema: userMeSchema,
  }),
  USERS_ME_TRACKS: defineContract<
    void,
    z.infer<typeof paginatedTracksResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME_TRACKS,
    responseSchema: paginatedTracksResponseSchema,
  }),

  USERS_ME_PLAYLISTS: defineContract<
    void,
    z.infer<typeof userPlaylistsResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME_PLAYLISTS,
    responseSchema: userPlaylistsResponseSchema,
  }),

  USERS_ME_PRIVACY: defineContract({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME_PRIVACY,
    responseSchema: privacySettingsSchema,
  }),

  USERS_ME_PRIVACY_UPDATE: defineContract({
    method: 'PATCH',
    url: API_ENDPOINTS.USERS.ME_PRIVACY,
    requestSchema: updatePrivacySettingsDtoSchema,
    responseSchema: privacySettingsSchema,
  }),
  USERS_ME_RESET_PASSWORD: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.USERS.ME_RESET_PASSWORD,
    requestSchema: resetLoggedInPasswordRequestSchema,
    responseSchema: messageResponseSchema,
  }),

  USERS_ME_ADD_NEW_EMAIL: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.USERS.ME_ADD_EMAIL,
    requestSchema: addNewEmailRequestSchema,
    responseSchema: messageResponseSchema,
  }),

  USERS_ME_UPDATE_PRIMARY_EMAIL: defineContract({
    method: 'POST',
    url: API_ENDPOINTS.USERS.ME_UPDATE_PRIMARY_EMAIL,
    requestSchema: updatePrimaryEmailRequestSchema,
    responseSchema: messageResponseSchema,
  }),

  USERS_ME_SOCIAL_LINKS_UPDATE: defineContract({
    method: 'PATCH',
    url: API_ENDPOINTS.USERS.ME_SOCIAL_LINKS,
    requestSchema: updateSocialLinksRequestSchema,
    responseSchema: privateSocialLinksSchema,
  }),

  USERS_ME_ROLE_UPDATE: defineContract({
    method: 'PATCH',
    url: API_ENDPOINTS.USERS.ME_ROLE,
    requestSchema: updateRoleRequestSchema,
    responseSchema: userMeSchema,
  }),

  USERS_ME_TIER_UPDATE: defineContract({
    method: 'PATCH',
    url: API_ENDPOINTS.USERS.ME_TIER,
    requestSchema: updateTierRequestSchema,
    responseSchema: updateTierResponseSchema,
  }),

  USERS_ME_IMAGES_UPDATE: defineContract<
    FormData,
    z.infer<typeof updateImagesResponseSchema>
  >({
    method: 'PATCH',
    url: API_ENDPOINTS.USERS.ME_IMAGES,
    responseSchema: updateImagesResponseSchema,
  }),

  USERS_ME_HISTORY: defineContract<
    void,
    z.infer<typeof paginatedFeedResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME_HISTORY,
    responseSchema: paginatedFeedResponseSchema,
  }),

  USERS_ME_BLOCKED: defineContract<
    void,
    z.infer<typeof paginatedFollowersResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME_BLOCKED,
    responseSchema: paginatedFollowersResponseSchema,
  }),

  USERS_SUGGESTED: defineContract<
    void,
    z.infer<typeof usersSuggestedResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.USERS.SUGGESTED,
    responseSchema: usersSuggestedResponseSchema,
  }),

  USERS_TRACKS: (userId: number) =>
    defineContract<void, z.infer<typeof paginatedTracksResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.TRACKS(userId),
      responseSchema: paginatedTracksResponseSchema,
    }),

  USERS_PLAYLISTS: (userId: number) =>
    defineContract<void, z.infer<typeof userPlaylistsResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.PLAYLISTS(userId),
      responseSchema: userPlaylistsResponseSchema,
    }),

  USERS_LIKED_PLAYLISTS: (username: string) =>
    defineContract<void, z.infer<typeof paginatedPlaylistsResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.LIKED_PLAYLISTS(username),
      responseSchema: paginatedPlaylistsResponseSchema,
    }),

  USERS_FOLLOW: (userId: number) =>
    defineContract<void, z.infer<typeof followResponseSchema>>({
      method: 'POST',
      url: API_ENDPOINTS.USERS.FOLLOW(userId),
      responseSchema: followResponseSchema,
    }),

  USERS_UNFOLLOW: (userId: number) =>
    defineContract<void, z.infer<typeof followResponseSchema>>({
      method: 'DELETE',
      url: API_ENDPOINTS.USERS.FOLLOW(userId),
      responseSchema: followResponseSchema,
    }),

  USERS_FOLLOWERS: (userId: number) =>
    defineContract<void, z.infer<typeof paginatedFollowersResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.FOLLOWERS(userId),
      responseSchema: paginatedFollowersResponseSchema,
    }),

  USERS_FOLLOWING: (userId: number) =>
    defineContract<void, z.infer<typeof paginatedFollowersResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.FOLLOWING(userId),
      responseSchema: paginatedFollowersResponseSchema,
    }),

  USERS_BLOCK: (userId: number) =>
    defineContract<void, z.infer<typeof messageResponseSchema>>({
      method: 'POST',
      url: API_ENDPOINTS.USERS.BLOCK(userId),
      responseSchema: messageResponseSchema,
    }),

  USERS_UNBLOCK: (userId: number) =>
    defineContract<void, void>({
      method: 'DELETE',
      url: API_ENDPOINTS.USERS.BLOCK(userId),
      responseSchema: z.undefined(),
    }),

  USERS_PUBLIC_BY_ID: (userId: number) =>
    defineContract<void, z.infer<typeof userPublicSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.BY_ID(userId),
      responseSchema: userPublicSchema,
    }),
  USERS_PUBLIC_BY_USERNAME: (username: string) =>
    defineContract<void, z.infer<typeof userPublicSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.BY_USERNAME(username),
      responseSchema: userPublicSchema,
    }),

  MESSAGES_INBOX: defineContract<
    void,
    z.infer<typeof paginatedMessageResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.MESSAGES.CONVERSATIONS,
    responseSchema: paginatedMessageResponseSchema,
  }),

  MESSAGES_CHAT_HISTORY: (userId: number) =>
    defineContract<void, z.infer<typeof paginatedMessageResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.MESSAGES.CONVERSATION_MESSAGES(userId),
      responseSchema: paginatedMessageResponseSchema,
    }),

  MESSAGES_SEND: (userId: number) =>
    defineContract<
      z.infer<typeof sendMessageRequestSchema>,
      z.infer<typeof messageDTOSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.MESSAGES.CONVERSATION_MESSAGES(userId),
      requestSchema: sendMessageRequestSchema,
      responseSchema: messageDTOSchema,
    }),

  PLAYLISTS_CREATE: defineContract<
    z.infer<typeof createPlaylistRequestSchema>,
    z.infer<typeof playlistResponseSchema>
  >({
    method: 'POST',
    url: API_ENDPOINTS.PLAYLISTS.CREATE,
    requestSchema: createPlaylistRequestSchema,
    responseSchema: playlistResponseSchema,
  }),

  PLAYLISTS_BY_ID: (playlistId: number) =>
    defineContract<void, z.infer<typeof playlistResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.PLAYLISTS.BY_ID(playlistId),
      responseSchema: playlistResponseSchema,
    }),

  PLAYLISTS_UPDATE: (playlistId: number) =>
    defineContract<
      z.infer<typeof updatePlaylistRequestSchema>,
      z.infer<typeof playlistUpdateResponseSchema>
    >({
      method: 'PATCH',
      url: API_ENDPOINTS.PLAYLISTS.UPDATE(playlistId),
      requestSchema: updatePlaylistRequestSchema,
      responseSchema: playlistUpdateResponseSchema,
    }),

  PLAYLISTS_DELETE: (playlistId: number) =>
    defineContract<void, undefined>({
      method: 'DELETE',
      url: API_ENDPOINTS.PLAYLISTS.DELETE(playlistId),
      responseSchema: z.undefined(),
    }),

  PLAYLISTS_ADD_TRACK: (playlistId: number) =>
    defineContract<
      z.infer<typeof addPlaylistTrackRequestSchema>,
      z.infer<typeof messageResponseSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.PLAYLISTS.TRACKS(playlistId),
      requestSchema: addPlaylistTrackRequestSchema,
      responseSchema: messageResponseSchema,
    }),

  PLAYLISTS_REMOVE_TRACK: (playlistId: number, trackId: number) =>
    defineContract<void, undefined>({
      method: 'DELETE',
      url: API_ENDPOINTS.PLAYLISTS.TRACK(playlistId, trackId),
      responseSchema: z.undefined(),
    }),

  PLAYLISTS_REORDER_TRACKS: (playlistId: number) =>
    defineContract<
      z.infer<typeof reorderPlaylistTracksRequestSchema>,
      z.infer<typeof playlistUpdateResponseSchema>
    >({
      method: 'PATCH',
      url: API_ENDPOINTS.PLAYLISTS.REORDER_TRACKS(playlistId),
      requestSchema: reorderPlaylistTracksRequestSchema,
      responseSchema: playlistUpdateResponseSchema,
    }),

  PLAYLISTS_EMBED: (playlistId: number) =>
    defineContract<void, z.infer<typeof playlistEmbedResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.PLAYLISTS.EMBED(playlistId),
      responseSchema: playlistEmbedResponseSchema,
    }),

  PLAYLISTS_SECRET_LINK: (playlistId: number) =>
    defineContract<void, z.infer<typeof playlistSecretLinkResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.PLAYLISTS.SECRET_LINK(playlistId),
      responseSchema: playlistSecretLinkResponseSchema,
    }),

  PLAYLISTS_SECRET_LINK_REGENERATE: (playlistId: number) =>
    defineContract<
      void,
      z.infer<typeof playlistSecretLinkRegenerateResponseSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.PLAYLISTS.SECRET_LINK_REGENERATE(playlistId),
      responseSchema: playlistSecretLinkRegenerateResponseSchema,
    }),

  PLAYLISTS_BY_TOKEN: (token: string) =>
    defineContract<void, z.infer<typeof playlistResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.PLAYLISTS.TOKEN(token),
      responseSchema: playlistResponseSchema,
    }),

  PLAYLISTS_LIKE: (playlistId: number) =>
    defineContract<void, z.infer<typeof playlistLikeResponseSchema>>({
      method: 'POST',
      url: API_ENDPOINTS.PLAYLISTS.LIKE(playlistId),
      responseSchema: playlistLikeResponseSchema,
    }),

  PLAYLISTS_UNLIKE: (playlistId: number) =>
    defineContract<void, z.infer<typeof playlistLikeResponseSchema>>({
      method: 'DELETE',
      url: API_ENDPOINTS.PLAYLISTS.LIKE(playlistId),
      responseSchema: playlistLikeResponseSchema,
    }),

  TRACKS_COMMENTS_LIST: (trackId: number) =>
    defineContract<void, z.infer<typeof paginatedCommentsResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.TRACKS.COMMENTS(trackId),
      responseSchema: paginatedCommentsResponseSchema,
    }),

  TRACKS_COMMENTS_CREATE: (trackId: number) =>
    defineContract<
      z.infer<typeof createCommentRequestSchema>,
      z.infer<typeof commentSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.COMMENTS(trackId),
      requestSchema: createCommentRequestSchema,
      responseSchema: commentSchema,
    }),

  COMMENTS_REPLIES_LIST: (commentId: number) =>
    defineContract<void, z.infer<typeof paginatedRepliesResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.COMMENTS.REPLIES(commentId),
      responseSchema: paginatedRepliesResponseSchema,
    }),
  COMMENTS_REPLIES_CREATE: (commentId: number) =>
    defineContract<
      z.infer<typeof createCommentRequestSchema>,
      z.infer<typeof commentSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.COMMENTS.REPLIES(commentId),
      requestSchema: createCommentRequestSchema,
      responseSchema: commentSchema,
    }),

  COMMENTS_DELETE: (commentId: number) =>
    defineContract<void, undefined>({
      method: 'DELETE',
      url: API_ENDPOINTS.COMMENTS.DELETE(commentId),
      responseSchema: z.undefined(),
    }),

  TRACK_REPORT: (trackId: number) =>
    defineContract<
      z.infer<typeof reportRequestSchema>,
      z.infer<typeof messageResponseSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.REPORT(trackId),
      requestSchema: reportRequestSchema,
      responseSchema: messageResponseSchema,
    }),

  COMMENT_REPORT: (commentId: number) =>
    defineContract<
      z.infer<typeof reportRequestSchema>,
      z.infer<typeof messageResponseSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.COMMENTS.REPORT(commentId),
      requestSchema: reportRequestSchema,
      responseSchema: messageResponseSchema,
    }),

  ADMIN_LOGIN: defineContract<
    z.infer<typeof adminLoginRequestSchema>,
    z.infer<typeof adminLoginResponseSchema>
  >({
    method: 'POST',
    url: API_ENDPOINTS.ADMIN.LOGIN,
    requestSchema: adminLoginRequestSchema,
    responseSchema: adminLoginResponseSchema,
  }),

  ADMIN_REPORTS: defineContract<void, z.infer<typeof adminReportsPageSchema>>({
    method: 'GET',
    url: API_ENDPOINTS.ADMIN.REPORTS,
    responseSchema: adminReportsPageSchema,
  }),

  ADMIN_UPDATE_REPORT_STATUS: (reportId: number) =>
    defineContract<
      z.infer<typeof updateAdminReportStatusRequestSchema>,
      z.infer<typeof messageResponseSchema>
    >({
      method: 'PUT',
      url: API_ENDPOINTS.ADMIN.REPORT_BY_ID(reportId),
      requestSchema: updateAdminReportStatusRequestSchema,
      responseSchema: messageResponseSchema,
    }),

  ADMIN_DELETE_TRACK: (trackId: number) =>
    defineContract<void, z.infer<typeof messageResponseSchema>>({
      method: 'DELETE',
      url: API_ENDPOINTS.TRACKS.DELETE(trackId),
      responseSchema: messageResponseSchema,
    }),

  ADMIN_BAN_USER: (userId: number) =>
    defineContract<
      z.infer<typeof banUserRequestSchema> | undefined,
      z.infer<typeof messageResponseSchema>
    >({
      method: 'PUT',
      url: API_ENDPOINTS.ADMIN.BAN_USER(userId),
      responseSchema: messageResponseSchema,
    }),

  ADMIN_UNBAN_USER: (userId: number) =>
    defineContract<void, z.infer<typeof messageResponseSchema>>({
      method: 'PUT',
      url: API_ENDPOINTS.ADMIN.UNBAN_USER(userId),
      responseSchema: messageResponseSchema,
    }),

  ADMIN_ANALYTICS: defineContract<
    void,
    z.infer<typeof platformAnalyticsResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.ADMIN.ANALYTICS,
    responseSchema: platformAnalyticsResponseSchema,
  }),

  TRACKS_UPLOAD: defineContract<
    FormData,
    z.infer<typeof uploadTrackResponseSchema>
  >({
    method: 'POST',
    url: API_ENDPOINTS.TRACKS.UPLOAD,
    responseSchema: uploadTrackResponseSchema,
  }),
  TRACK_LIKE: (trackId: number) =>
    defineContract<void, z.infer<typeof likeResponseSchema>>({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.LIKE(trackId),
      responseSchema: likeResponseSchema,
    }),
  TRACK_UNLIKE: (trackId: number) =>
    defineContract<void, z.infer<typeof likeResponseSchema>>({
      method: 'DELETE',
      url: API_ENDPOINTS.TRACKS.LIKE(trackId),
      responseSchema: likeResponseSchema,
    }),
  TRACKS_BY_ID: (trackId: number) =>
    defineContract<void, z.infer<typeof trackDetailsResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.TRACKS.BY_ID(trackId),
      responseSchema: trackDetailsResponseSchema,
    }),

  TRACKS_UPDATE: (trackId: number) =>
    defineContract<FormData, z.infer<typeof trackUpdateResponseSchema>>({
      method: 'PATCH',
      url: API_ENDPOINTS.TRACKS.BY_ID(trackId),
      responseSchema: trackUpdateResponseSchema,
    }),

  TRACKS_DELETE: (trackId: number) =>
    defineContract<void, z.infer<typeof messageResponseSchema>>({
      method: 'DELETE',
      url: API_ENDPOINTS.TRACKS.BY_ID(trackId),
      responseSchema: messageResponseSchema,
    }),

  TRACKS_DELETE_COVER: (trackId: number) =>
    defineContract<void, undefined>({
      method: 'DELETE',
      url: API_ENDPOINTS.TRACKS.COVER(trackId),
      responseSchema: z.undefined(),
    }),

  TRACKS_UPDATE_VISIBILITY: (trackId: number) =>
    defineContract({
      method: 'PATCH',
      url: API_ENDPOINTS.TRACKS.BY_ID(trackId),
      requestSchema: updateTrackVisibilityDtoSchema,
      responseSchema: trackUpdateResponseSchema,
    }),

  TRACKS_SECRET_TOKEN: (trackId: number | string) =>
    defineContract<void, z.infer<typeof secretTokenResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.TRACKS.SECRET_TOKEN(trackId),
      responseSchema: secretTokenResponseSchema,
    }),

  TRACKS_GENERATE_TOKEN: (trackId: number | string) =>
    defineContract<void, z.infer<typeof secretTokenResponseSchema>>({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.GENERATE_TOKEN(trackId),
      responseSchema: secretTokenResponseSchema,
    }),
  TRACK_PLAY: (trackId: number) =>
    defineContract<
      z.infer<typeof trackPlaybackActionRequestSchema>,
      z.infer<typeof messageResponseSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.PLAY(trackId),
      requestSchema: trackPlaybackActionRequestSchema,
      responseSchema: messageResponseSchema,
    }),
  TRACK_COMPLETE: (trackId: number) =>
    defineContract<
      z.infer<typeof trackPlaybackActionRequestSchema>,
      z.infer<typeof messageResponseSchema>
    >({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.COMPLETE(trackId),
      requestSchema: trackPlaybackActionRequestSchema,
      responseSchema: messageResponseSchema,
    }),
  TRACK_REPOST: (trackId: number) =>
    defineContract<void, z.infer<typeof repostResponseSchema>>({
      method: 'POST',
      url: API_ENDPOINTS.TRACKS.REPOST(trackId),
      responseSchema: repostResponseSchema,
    }),
  TRACK_UNREPOST: (trackId: number) =>
    defineContract<void, z.infer<typeof repostResponseSchema>>({
      method: 'DELETE',
      url: API_ENDPOINTS.TRACKS.REPOST(trackId),
      responseSchema: repostResponseSchema,
    }),
  TRACK_REPOST_USERS: (trackId: number) =>
    defineContract<void, z.infer<typeof paginationRepostUserSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.TRACKS.GET_REPOSTERS(trackId),
      responseSchema: paginationRepostUserSchema,
    }),
  FEED: defineContract<void, z.infer<typeof paginatedTrackFeedResponseSchema>>({
    method: 'GET',
    url: API_ENDPOINTS.FEED,
    responseSchema: paginatedTrackFeedResponseSchema,
  }),
  SEARCH: defineContract<void, z.infer<typeof paginatedSearchResponseSchema>>({
    method: 'GET',
    url: API_ENDPOINTS.SEARCH,
    responseSchema: paginatedSearchResponseSchema,
  }),
  TRENDING: defineContract<void, z.infer<typeof trendingTracksResponseSchema>>({
    method: 'GET',
    url: API_ENDPOINTS.TRENDING,
    responseSchema: trendingTracksResponseSchema,
  }),
  STATIONS_GENRE: defineContract<
    void,
    z.infer<typeof paginatedStationResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.STATIONS.GENRE,
    responseSchema: paginatedStationResponseSchema,
  }),
  STATIONS_ARTIST: defineContract<
    void,
    z.infer<typeof paginatedStationResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.STATIONS.ARTIST,
    responseSchema: paginatedStationResponseSchema,
  }),
  STATIONS_LIKES: defineContract<
    void,
    z.infer<typeof paginatedStationResponseSchema>
  >({
    method: 'GET',
    url: API_ENDPOINTS.STATIONS.LIKES,
    responseSchema: paginatedStationResponseSchema,
  }),
  USERS_WHO_LIKED_TRACK: (trackId: number) =>
    defineContract<void, z.infer<typeof paginatedFollowersResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.WHO_LIKE_TRACK(trackId),
      responseSchema: paginatedFollowersResponseSchema,
    }),
  USERS_WHO_REPOSTED_TRACK: (trackId: number) =>
    defineContract<void, z.infer<typeof paginatedFollowersResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.WHO_REPOSTED(trackId),
      responseSchema: paginatedFollowersResponseSchema,
    }),
  // USERS_LIKED_PLAYLISTS: (userId: number) =>
  //   defineContract<void, z.infer<typeof paginatedPlaylistResponseSchema>>({
  //     method: 'GET',
  //     url: API_ENDPOINTS.USERS.LIKE_PLAYLISTS(userId),
  //     responseSchema: paginatedPlaylistResponseSchema,
  //   }),
  USERS_WHO_REPOSTED: (trackId: number) =>
    defineContract<void, z.infer<typeof paginatedFollowersResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.WHO_REPOSTED(trackId),
      responseSchema: paginatedFollowersResponseSchema,
    }),
  ME_LIKED_TRACKS: () =>
    defineContract<void, z.infer<typeof paginatedTrackResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.ME_LIKED_TRACKS,
      responseSchema: paginatedTrackResponseSchema,
    }),
  ME_REPOSTED_TRACKS: () =>
    defineContract<void, z.infer<typeof paginatedTrackResponseSchema>>({
      method: 'GET',
      url: API_ENDPOINTS.USERS.ME_REPOSTs,
      responseSchema: paginatedTrackResponseSchema,
    }),
} as const;

/** Union of all contract keys for autocomplete and constrained lookups. */
export type ApiContractKey = keyof typeof API_CONTRACTS;
