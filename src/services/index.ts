/**
 * Services Barrel Export
 *
 * Dependency-injection entry point.
 * Switches between mock and real services based on `NEXT_PUBLIC_USE_MOCK`.
 */

import { config } from '@/config';

import type { AuthService } from './api/authService';
import { RealAuthService } from '@/services/api/authService';
import { MockAuthService } from './mocks/authService';

import type { PrivacyService } from './api/privacyService';
import { RealPrivacyService } from './api/privacyService';
import { MockPrivacyService } from './mocks/privacyService';

import type { TrackService } from '@/services/api/trackService';
import { RealTrackService } from '@/services/api/trackService';
import { MockTrackService } from '@/services/mocks/trackService';

import type { PlaylistService } from '@/services/api/playlistService';
import { RealPlaylistService } from '@/services/api/playlistService';
import { MockPlaylistService } from '@/services/mocks/playlistService';

import type { CountryService } from './api/countryService';
import { RealCountryService } from './api/countryService';
import { MockCountryService } from './mocks/countryService';

import type { UserService } from './api/userService';
import { RealUserService } from './api/userService';
import { MockUserService } from './mocks/userService';

import type { DiscoveryService } from './api/discoveryService';
import { RealDiscoveryService } from './api/discoveryService';
import { MockDiscoveryService } from './mocks/discoveryService';
import { RealFeedService } from '@/services/api/feedService';
import { MockFeedService } from './mocks/feedService';
import { FeedService } from './api/feedService';

import type { CommentService } from './api/commentService';
import { RealCommentService } from './api/commentService';
import { MockCommentService } from './mocks/commentService';
import type { PlaybackService } from './api/playbackService';
import { RealPlaybackService } from './api/playbackService';
import { MockPlaybackService } from './mocks/playbackService';

import type { MessageService } from './api/messageService';
import { FirebaseMessageService } from './api/messageService';
import { MockMessageService } from './mocks/messageService';

import type { AdminService } from './api/adminSerivce';
import { RealAdminService } from './api/adminSerivce';
import { MockAdminService } from './mocks/adminService';

import type { SubscriptionService } from './api/subscriptionService';
import { RealSubscriptionService } from './api/subscriptionService';
import { MockSubscriptionService } from './mocks/subscriptionService';

import type { NotificationService } from './api/notificationService';
import { FirebaseNotificationService } from './api/notificationService';
import { MockNotificationService } from './mocks/notificationService';

const resolveTrackService = (): TrackService => {
  if (config.api.useMock) {
    return new MockTrackService();
  }
  return new RealTrackService();
};

export const trackService = resolveTrackService();

const resolvePlaylistService = (): PlaylistService => {
  if (config.api.useMock) {
    return new MockPlaylistService();
  }
  return new RealPlaylistService();
};

export const playlistService = resolvePlaylistService();

// --- Auth Service ---
const resolveAuthService = (): AuthService => {
  if (config.api.useMock) {
    return new MockAuthService();
  }
  return new RealAuthService();
};

export const authService = resolveAuthService();

// --- Privacy Service ---
const resolvePrivacyService = (): PrivacyService => {
  if (config.api.useMock) {
    return new MockPrivacyService();
  }
  return new RealPrivacyService();
};

export const privacyService = resolvePrivacyService();

const resolveCountryService = (): CountryService => {
  if (config.api.useMock) {
    return new MockCountryService();
  }
  return new RealCountryService();
};

export const countryService = resolveCountryService();

const resolveUserService = (): UserService => {
  if (config.api.useMock) {
    return new MockUserService();
  }
  return new RealUserService();
};

export const userService = resolveUserService();

const resolveDiscoveryService = (): DiscoveryService => {
  if (config.api.useMock) {
    return new MockDiscoveryService();
  }
  return new RealDiscoveryService();
};

export const discoveryService = resolveDiscoveryService();

const resolveFeedService = (): FeedService => {
  if (config.api.useMock) {
    return new MockFeedService();
  }
  return new RealFeedService();
};

export const feedService = resolveFeedService();
const resolveCommentService = (): CommentService => {
  if (config.api.useMock) {
    return new MockCommentService();
  }
  return new RealCommentService();
};

export const commentService = resolveCommentService();

const resolvePlaybackService = (): PlaybackService => {
  if (config.api.useMock) {
    return new MockPlaybackService();
  }
  return new RealPlaybackService();
};

export const playbackService = resolvePlaybackService();

const resolveMessageService = (): MessageService => {
  if (config.api.useMock) {
    return new MockMessageService();
  }
  return new FirebaseMessageService();
};

export const messageService = resolveMessageService();

const resolveAdminService = (): AdminService => {
  if (config.api.useMock) {
    return new MockAdminService();
  }
  return new RealAdminService();
};

export const adminService = resolveAdminService();

// --- Subscription Service ---
const resolveSubscriptionService = (): SubscriptionService => {
  if (config.api.useMock) {
    return new MockSubscriptionService();
  }
  return new RealSubscriptionService();
};

export const subscriptionService = resolveSubscriptionService();

// --- Notification Service ---
const resolveNotificationService = (): NotificationService => {
  if (config.api.useMock) {
    return new MockNotificationService();
  }
  return new FirebaseNotificationService();
};

export const notificationService = resolveNotificationService();
